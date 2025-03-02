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
    public class ShoppingListProductController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ShoppingListProductController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public ActionResult<IEnumerable<object>> getProductsInShoppingList(int id)
        {
            var products = _context.ShoppingLists
                .Where(sl => sl.ShoppingListId == id)
                .SelectMany(sl => sl.ShoppingList_Products)
                .Select(slp => new
                {
                    slp.Product.ProductId,
                    slp.Product.Name,
                    slp.Quantity,
                    slp.Product.ImageUrl,
                    slp.Product.UniqueItemIdentifier,
                    Prices = slp.Product.Prices.Select(p => new
                    {
                        p.ProductPrice,
                        p.Source
                    }).ToList()
                })
                .ToList();

            return Ok(products);
        }


        [HttpPut("increment")]
        public IActionResult IncrementProductQuantity([FromQuery] int sId, [FromQuery] int pId)
        {
            var shoppinglistproduct = _context.ShoppingList_Products
                .FirstOrDefault(slp => slp.ShoppingListId == sId && slp.ProductId == pId);

            if (shoppinglistproduct == null)
            {
                return NotFound();
            }

            shoppinglistproduct.Quantity++;

            _context.SaveChanges();
            return NoContent();
        }

        [HttpPut("decrement")]
        public IActionResult DecrementProductQuantity([FromQuery] int sId, [FromQuery] int pId)
        {
            var shoppinglistproduct = _context.ShoppingList_Products
                .FirstOrDefault(slp => slp.ShoppingListId == sId && slp.ProductId == pId);

            if (shoppinglistproduct == null)
            {
                return NotFound();
            }

            if (shoppinglistproduct.Quantity > 0)
            {
                shoppinglistproduct.Quantity--;
            }

            if (shoppinglistproduct.Quantity == 0)
            {
                _context.ShoppingList_Products.Remove(shoppinglistproduct);
            }

            _context.SaveChanges();
            return NoContent();
        }

        [HttpPut("updateQuantity")]
        public IActionResult UpdateProductQuantity([FromQuery] int sId, [FromQuery] int pId, [FromQuery] int newQuantity)
        {
            var shoppinglistproduct = _context.ShoppingList_Products
                .FirstOrDefault(slp => slp.ShoppingListId == sId && slp.ProductId == pId);

            if (shoppinglistproduct == null)
            {
                return NotFound();
            }

            if (newQuantity == 0)
            {
                _context.ShoppingList_Products.Remove(shoppinglistproduct);
            }
            else
            {
                shoppinglistproduct.Quantity = newQuantity;
            }

            _context.SaveChanges();
            return NoContent();
        }

        [HttpDelete]
        public IActionResult DeleteProduct([FromQuery] int sId, [FromQuery] int pId)
        {
            var shoppinglistproduct = _context.ShoppingList_Products
                .FirstOrDefault(slp => slp.ShoppingListId == sId && slp.ProductId == pId);

            if (shoppinglistproduct == null)
            {
                return NotFound("Product not found in the shopping list.");
            }

            _context.ShoppingList_Products.Remove(shoppinglistproduct);
            _context.SaveChanges();

            return NoContent();
        }

        [HttpPost]
        public async Task<IActionResult> AddProductToList([FromBody] AddProductToListRequest request)
        {
            try
            {
                // Find alle produkter med samme uniqueItemIdentifier
                var products = await _context.Products
                    .Where(p => p.UniqueItemIdentifier == request.UniqueItemIdentifier)
                    .ToListAsync();

                if (!products.Any())
                    return NotFound("Ingen produkter fundet med dette identifier");

                var shoppingList = await _context.ShoppingLists
                    .FindAsync(request.ShoppingListId);

                if (shoppingList == null)
                    return NotFound("Indkøbsliste ikke fundet");

                // Tilføj hvert produkt til listen
                foreach (var product in products)
                {
                    var shoppingListProduct = new ShoppingList_Product
                    {
                        ShoppingListId = request.ShoppingListId,
                        Product = product,
                        Quantity = 1
                    };

                    _context.ShoppingList_Products.Add(shoppingListProduct);
                }

                await _context.SaveChangesAsync();
                return Ok("Produkter tilføjet til listen");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("totalPrices/{shoppingListId}")]
        public async Task<ActionResult<IEnumerable<TotalPrice>>> GetTotalPrices(int shoppingListId)
        {
            var products = await _context.ShoppingList_Products
                .Where(slp => slp.ShoppingListId == shoppingListId)
                .Include(slp => slp.Product)
                    .ThenInclude(p => p.Prices)
                .ToListAsync();

            // Group products by their uniqueItemIdentifier
            var groupedProducts = products
                .GroupBy(p => p.Product.UniqueItemIdentifier);

            var totals = new Dictionary<string, decimal>();

            // Calculate totals for each group
            foreach (var group in groupedProducts)
            {
                // Get all unique sources across all products in the group
                var sources = group
                    .SelectMany(item => item.Product.Prices)
                    .Select(p => p.Source)
                    .Distinct();

                foreach (var source in sources)
                {
                    if (!totals.ContainsKey(source))
                    {
                        totals[source] = 0;
                    }

                    // Get all prices for the current source among all products in the group
                    var prices = group
                        .SelectMany(item => item.Product.Prices)
                        .Where(p => p.Source == source)
                        .Select(p => p.ProductPrice);

                    // Multiply each price by the quantity and add it to the total for the source
                    var quantity = group.First().Quantity;
                    foreach (var price in prices)
                    {
                        totals[source] += price * quantity;
                    }
                }
            }

            var result = totals.Select(t => new TotalPrice
            {
                Source = t.Key,
                Total = Math.Round(t.Value, 2)
            });

            return Ok(result);
        }

        public class AddProductToListRequest
        {
            public int ShoppingListId { get; set; }
            public string? UniqueItemIdentifier { get; set; }
        }

        public class TotalPrice
        {
            public string Source { get; set; }
            public decimal Total { get; set; }
        }
    }
}
