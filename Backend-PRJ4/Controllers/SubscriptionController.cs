using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project4Database.Data;
using Project4Database.Models;

namespace Project4Database.Controllers
{
    // Svar gemmes i Message for subscription endpoint
    public class SubscriptionResponse
    {
        public string Message { get; set; } = string.Empty;
    }

    [ApiController]
    [Route("api/[controller]")]
    public class SubscriptionController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SubscriptionController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/subscription
        [HttpPost]
        public async Task<IActionResult> AddSubscription([FromBody] Subscription subscription)
        {
            // Tjek om modellen er valid
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Hent produktet baseret på ProductId
            var product = await _context.Products
                .Include(p => p.Prices) // Inkluder priserne
                .FirstOrDefaultAsync(p => p.ProductId == subscription.ProductId);

            // Hvis produktet ikke findes, returner NotFound
            if (product == null)
            {
                return NotFound("The specified product does not exist.");
            }

            // Find den seneste pris for produktet
            var latestPrice = product.Prices
                .OrderByDescending(p => p.PriceId)
                .FirstOrDefault();

            // Hvis der findes en pris, opdater PriceId i subscription
            if (latestPrice != null)
            {
                subscription.PriceId = latestPrice.PriceId;
            }

            // Tilføj subscription til databasen
            _context.Subscriptions.Add(subscription);
            await _context.SaveChangesAsync();

            // Returner en succesbesked
            return Ok(new SubscriptionResponse { Message = "Subscription added successfully." });
        }
    }
}