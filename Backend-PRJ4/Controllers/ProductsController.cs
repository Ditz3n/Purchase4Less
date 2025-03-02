using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project4Database.Data;
using Project4Database.Models;
using Microsoft.AspNetCore.Cors;

namespace Project4Database.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowFrontend")]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            try
            {
                var products = await _context.Products
                    .Include(p => p.Prices)
                    .ToListAsync();

                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            try
            {
                var product = await _context.Products
                    .Include(p => p.Prices)
                    .FirstOrDefaultAsync(p => p.ProductId == id);

                if (product == null)
                {
                    return NotFound();
                }

                return Ok(product);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("store-price-comparison")]
        public async Task<ActionResult<Dictionary<string, decimal>>> GetStorePriceComparison()
        {
            try
            {
                var storeTotals = await _context.Prices
                    .GroupBy(p => p.Source)
                    .Select(g => new 
                    { 
                        Store = g.Key,
                        Total = g.Sum(p => p.ProductPrice)
                    })
                    .ToDictionaryAsync(
                        x => x.Store,
                        x => x.Total
                    );

                return Ok(storeTotals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("popular")]
        public async Task<ActionResult<Dictionary<string, int>>> GetPopularProducts()
        {
            Console.WriteLine("GetPopularProducts blev kaldt");
            try
            {
                Console.WriteLine("Starter query af populære produkter");
                var popularProducts = await _context.ShoppingList_Products
                    .Include(slp => slp.Product)
                    .Where(slp => slp.Product.UniqueItemIdentifier != null)
                    .GroupBy(slp => new { slp.Product.UniqueItemIdentifier, slp.ShoppingListId })
                    .Select(g => new
                    {
                        UniqueIdentifier = g.Key.UniqueItemIdentifier,
                        Count = g.Count()
                    })
                    .GroupBy(x => x.UniqueIdentifier)
                    .Select(g => new
                    {
                        UniqueIdentifier = g.Key,
                        Count = g.Count()
                    })
                    .OrderByDescending(x => x.Count)
                    .Take(5)
                    .ToDictionaryAsync(
                        x => x.UniqueIdentifier,
                        x => x.Count
                    );

                Console.WriteLine($"Succes! Fandt {popularProducts.Count} populære produkter");
                return Ok(popularProducts);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Fejl i GetPopularProducts: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
} 