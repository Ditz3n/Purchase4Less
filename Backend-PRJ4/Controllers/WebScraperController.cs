using Microsoft.AspNetCore.Mvc;
using PuppeteerSharp;
using System.Threading.Tasks;
using Project4Database.Interfaces;
using Project4Database.Models;
using Microsoft.AspNetCore.Cors;

namespace Project4Database.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowFrontend")]
    public class WebScraperController : ControllerBase, IWebScraperController
    {
        private readonly IBrowser _browser;

        public WebScraperController()
        {
            // Initialize browser in constructor
            var browserFetcher = new BrowserFetcher();
            browserFetcher.DownloadAsync().Wait();
            _browser = Puppeteer.LaunchAsync(new LaunchOptions
            {
                Headless = true
            }).Result;
        }

        [HttpPost("scrape")]
        public async Task<IActionResult> ScrapeProduct([FromBody] ScrapeRequest request)
        {
            try
            {
                using var page = await _browser.NewPageAsync();
                await page.GoToAsync(request.Url, new NavigationOptions
                {
                    WaitUntil = new[] { WaitUntilNavigation.DOMContentLoaded }
                });

                await Task.Delay(2000);

                // Bestem hvilken scraping logik der skal bruges baseret på URL
                if (request.Url.Contains("bilkatogo.dk"))
                {
                    return await ScrapeBilka(page);
                }
                else if (request.Url.Contains("rema1000.dk"))
                {
                    return await ScrapeRema(page);
                }
                else if (request.Url.Contains("spar.dk")) 
                {
                    return await ScrapeSpar(page);
                }
                
                return BadRequest(new { error = "Ikke-understøttet butik" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\nScraping error details: {ex}");
                return BadRequest(new { error = $"Fejl ved scraping: {ex.Message}" });
            }
        }

        private async Task<IActionResult> ScrapeBilka(IPage page)
        {
            var imageScript = @"
                (() => {
                    const img = document.querySelector('img.img-fluid.selected-image.zoom-in[alt=""Produkt billede""]');
                    return img ? img.getAttribute('src') : '';
                })()
            ";

            var image = await page.EvaluateExpressionAsync<string>(imageScript);
            var name = await page.EvaluateExpressionAsync<string>(
                "document.querySelector('.product-title')?.innerText"
            );
            var brand = await page.EvaluateExpressionAsync<string>(
                "document.querySelector('.product-sub-title span b')?.innerText"
            );
            var price = await page.EvaluateExpressionAsync<string>(
                "document.querySelector('.product-price__integer')?.innerText"
            );

            return Ok(new
            {
                name = name?.Trim() ?? "Ikke fundet",
                brand = brand?.Trim() ?? "Ukendt mærke",
                store = "Bilka",
                image = image?.Trim() ?? "",
                price = ExtractPrice(price ?? "0")
            });
        }

        private async Task<IActionResult> ScrapeRema(IPage page)
        {
            try
            {
                var name = await page.EvaluateExpressionAsync<string>(
                    "document.querySelector('div[data-v-71b26ec4].title')?.innerText"
                );

                var brand = await page.EvaluateExpressionAsync<string>(
                    "document.querySelector('div[data-v-71b26ec4].sub')?.innerText"
                );

                var priceScript = @"
                    (() => {
                        const priceElement = document.querySelector('span[data-v-71b26ec4].price-normal');
                        if (!priceElement) return '0.00';
                        const mainPrice = priceElement.firstChild.textContent.trim();
                        const decimal = priceElement.querySelector('span').textContent.trim();
                        return mainPrice + '.' + decimal;
                    })()
                ";
                var price = await page.EvaluateExpressionAsync<string>(priceScript);

                var image = await page.EvaluateExpressionAsync<string>(
                    "document.querySelector('img.product-img')?.getAttribute('src')"
                );

                return Ok(new
                {
                    name = name?.Trim() ?? "Ikke fundet",
                    brand = brand?.Trim().Split('/').LastOrDefault()?.Trim() ?? "Ukendt mærke",
                    store = "Rema 1000",
                    image = image?.Trim() ?? "",
                    price = decimal.Parse(price, System.Globalization.CultureInfo.InvariantCulture)
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ScrapeRema: {ex.Message}");
                return BadRequest(new { error = $"Fejl ved scraping af Rema produkt: {ex.Message}" });
            }
        }


        private async Task<IActionResult> ScrapeSpar(IPage page)
        {
            try
            {
                var nameScript = @"
                    (() => {
                        const nameElement = document.querySelector('.product-details-name');
                        return nameElement ? nameElement.innerText : '';
                    })()
                ";

                var priceScript = @"
                    (() => {
                        // Find alle app-price elementer der IKKE er inde i app-savings
                        const priceElements = Array.from(document.querySelectorAll('app-price')).filter(el => 
                            !el.closest('app-savings')
                        );
                        
                        if (!priceElements.length) return '0';
                        const priceElement = priceElements[0];
                        
                        const mainPrice = priceElement.textContent.trim();
                        const supElement = priceElement.querySelector('sup');
                        
                        if (supElement) {
                            const decimal = supElement.textContent.trim();
                            return mainPrice.replace(decimal, '') + '.' + decimal;
                        }
                        return mainPrice;
                    })()
                ";

                var imageScript = @"
                    (() => {
                        const img = document.querySelector('.product-details-image-container img');
                        return img ? img.getAttribute('src') : '';
                    })()
                ";

                var brandScript = @"
                    (() => {
                        const producerHeader = Array.from(document.querySelectorAll('h2'))
                            .find(h => h.textContent.includes('Producent'));
                        if (producerHeader) {
                            const nextElement = producerHeader.nextElementSibling;
                            return nextElement ? nextElement.textContent : '';
                        }
                        return '';
                    })()
                ";

                var name = await page.EvaluateExpressionAsync<string>(nameScript);
                var price = await page.EvaluateExpressionAsync<string>(priceScript);
                var image = await page.EvaluateExpressionAsync<string>(imageScript);
                var brand = await page.EvaluateExpressionAsync<string>(brandScript);

                return Ok(new
                {
                    name = name?.Trim() ?? "Ikke fundet",
                    brand = brand?.Trim() ?? "Ukendt mærke",
                    price = decimal.TryParse(price, System.Globalization.CultureInfo.InvariantCulture, out var parsedPrice) ? parsedPrice : 0,
                    image = image?.Trim() ?? "",
                    store = "SPAR"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Fejl i ScrapeSpar: {ex.Message}");
                return BadRequest(new { error = $"Fejl ved scraping af SPAR produkt: {ex.Message}" });
            }
        }


        private decimal ExtractPrice(string priceText)
        {
            if (string.IsNullOrEmpty(priceText)) return 0;

            // Fjern alt undtagen tal og decimaltegn
            var cleanPrice = new string(priceText.Where(c => char.IsDigit(c) || c == ',' || c == '.').ToArray());
            
            // Erstat komma med punktum for decimal parsing
            cleanPrice = cleanPrice.Replace(',', '.');

            if (decimal.TryParse(cleanPrice, System.Globalization.NumberStyles.Any, 
                System.Globalization.CultureInfo.InvariantCulture, out decimal result))
            {
                return result;
            }

            return 0;
        }
    }
}
