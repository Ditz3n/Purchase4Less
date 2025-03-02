using Microsoft.AspNetCore.Mvc;
using Project4Database.Data;
using Project4Database.Interfaces;
using Project4Database.Data.Seeders;
using Project4Database.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.EntityFrameworkCore;

namespace Project4Database.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowFrontend")]
    public class DatabaseController : ControllerBase, IDatabaseController
    {
        private readonly AppDbContext _context;
        private readonly IWebScraperController _scraper;

        public DatabaseController(AppDbContext context, IWebScraperController scraper)
        {
            _context = context;
            _scraper = scraper;
        }

        [HttpPost("reseed")]
        public async Task<IActionResult> ReseedDatabase()
        {
            Console.WriteLine("ReseedDatabase endpoint blev kaldt");
            try
            {
                Console.WriteLine("Starter database reseed proces...");
                
                // Ryd kun produkter og priser
                var existingProducts = _context.Products.ToList();
                var existingPrices = _context.Prices.ToList();
                
                _context.Prices.RemoveRange(existingPrices);
                _context.Products.RemoveRange(existingProducts);
                _context.SaveChanges();
                
                // Nulstil identity for Products og Prices
                _context.Database.ExecuteSqlRaw("DBCC CHECKIDENT ('Products', RESEED, 0)");
                _context.Database.ExecuteSqlRaw("DBCC CHECKIDENT ('Prices', RESEED, 0)");
                
                Console.WriteLine("Produkter blev cleared");
                await SeedProducts(_context, _scraper);
                Console.WriteLine("Produkter blev seedet med success");
                
                return Ok(new { message = "Produkter blev opdateret med succes!" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Fejl i ReseedDatabase: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = $"Fejl ved opdatering af produkter: {ex.Message}" });
            }
        }

        async Task SeedProducts(AppDbContext context, IWebScraperController scraper)
        {
            // Ryd eksisterende produkter først
            var existingProducts = context.Products.ToList();
            var existingPrices = context.Prices.ToList();
            
            context.Prices.RemoveRange(existingPrices);
            context.Products.RemoveRange(existingProducts);
            await context.SaveChangesAsync();

            // Seed Bilka products
            foreach (var (url, identifier) in ProductSeeder.BilkaProducts)
            {
                try
                {
                    var scrapedData = await scraper.ScrapeProduct(new ScrapeRequest { Url = url });
                    if (scrapedData is OkObjectResult okResult)
                    {
                        var productData = okResult.Value as dynamic;
                        var newProduct = new Product 
                        { 
                            Name = productData.name,
                            UniqueItemIdentifier = identifier,
                            ImageUrl = productData.image,
                            Brand = productData.brand
                        };
                        
                        var price = new Price
                        {
                            ProductPrice = productData.price,
                            Source = "Bilka",
                            Product = newProduct
                        };
                        
                        context.Products.Add(newProduct);
                        context.Prices.Add(price);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Fejl ved scraping af Bilka produkt {url}: {ex.Message}");
                }
            }

            // Seed Rema products
            foreach (var (url, identifier) in ProductSeeder.RemaProducts)
            {
                try
                {
                    var scrapedData = await scraper.ScrapeProduct(new ScrapeRequest { Url = url });
                    if (scrapedData is OkObjectResult okResult)
                    {
                        var productData = okResult.Value as dynamic;
                        var newProduct = new Product 
                        { 
                            Name = productData.name,
                            UniqueItemIdentifier = identifier,
                            ImageUrl = productData.image,
                            Brand = productData.brand
                        };
                        
                        var price = new Price
                        {
                            ProductPrice = productData.price,
                            Source = "Rema 1000",
                            Product = newProduct
                        };
                        
                        context.Products.Add(newProduct);
                        context.Prices.Add(price);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Fejl ved scraping af Rema produkt {url}: {ex.Message}");
                }
            }

            // Seed SPAR products
            foreach (var (url, identifier) in ProductSeeder.SparProducts)
            {
                try
                {
                    var scrapedData = await scraper.ScrapeProduct(new ScrapeRequest { Url = url });
                    if (scrapedData is OkObjectResult okResult)
                    {
                        var productData = okResult.Value as dynamic;
                        var newProduct = new Product 
                        { 
                            Name = productData.name,
                            UniqueItemIdentifier = identifier,
                            ImageUrl = productData.image,
                            Brand = productData.brand
                        };
                        
                        var price = new Price
                        {
                            ProductPrice = productData.price,
                            Source = "SPAR",
                            Product = newProduct
                        };
                        
                        context.Products.Add(newProduct);
                        context.Prices.Add(price);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Fejl ved scraping af SPAR produkt {url}: {ex.Message}");
                }
            }

            await context.SaveChangesAsync();
        }
    }
}
