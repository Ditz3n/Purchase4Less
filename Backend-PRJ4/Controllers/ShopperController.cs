using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project4Database.Data;
using Project4Database.Models;
using System.Text.Json;
using System.Text;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;

namespace Project4Database.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowFrontend")]
    public class ShopperController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ShopperController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public ActionResult<IEnumerable<Shopper>> GetShoppers()
        {
            var shoppers = _context.Shoppers.Include(s => s.ShoppingLists).ToList();
            return Ok(shoppers);
        }

        [HttpGet("{shopperId}")]
        public ActionResult<Shopper> GetShopper(string shopperId)
        {
            var shopper = _context.Shoppers.Include(s => s.ShoppingLists).FirstOrDefault(s => s.ShopperId == shopperId);
            if (shopper == null)
            {
                return NotFound();
            }
            return Ok(shopper);
        }

        // GET api/shopper/count (mængden af oprettede shoppers)
        [HttpGet("count")]
        public ActionResult<int> GetShopperCount()
        {
            var count = _context.Shoppers.Count();
            return Ok(count);
        }

        // GET api/shopper (alle shoppers i databasen returneres)
        [HttpGet("all")]
        public ActionResult<IEnumerable<Shopper>> GetAllShoppers()
        {
            var shoppers = _context.Shoppers.ToList();
            return Ok(shoppers);
        }

        // DELETE api/shopper/{id} (sletter en shopper med det givne id)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteShopper(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                Console.WriteLine("ID is required.");
                return BadRequest("ID is required.");
            }

            var shopper = _context.Shoppers.Include(s => s.ShoppingLists).FirstOrDefault(s => s.ShopperId == id);
            if (shopper == null)
            {
                Console.WriteLine($"Shopper with ID {id} not found.");
                return NotFound();
            }

            // Delete related shopping lists
            _context.ShoppingLists.RemoveRange(shopper.ShoppingLists);
            _context.Shoppers.Remove(shopper);
            await _context.SaveChangesAsync();

            // Check if the user is logged in with Clerk
            var dummyLogin = Request.Headers["Dummy-Login"].ToString();
            if (dummyLogin != "true")
            {
                // Delete the user from Clerk
                var clerkDeleteResult = await DeleteUserFromClerk(id);
                if (!clerkDeleteResult)
                {
                    Console.WriteLine($"Failed to delete user from Clerk with ID {id}.");
                    return StatusCode(500, "Failed to delete user from Clerk.");
                }
            }

            Console.WriteLine($"Successfully deleted shopper with ID {id}.");
            return NoContent();
        }

        // Hjælpemetode til at slette en shopper fra Clerks brugerdatabase
        private async Task<bool> DeleteUserFromClerk(string clerkUserId)
        {
            var clerkApiBase = "https://api.clerk.dev/v1";
            var clerkApiKey = "sk_test_xrw66UE2sdlSfnMCldyaHfvWWiLzxWu9Jy4RGhq9hB"; // Replace with your Clerk API Key

            var client = new HttpClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {clerkApiKey}");

            var response = await client.DeleteAsync($"{clerkApiBase}/users/{clerkUserId}");

            if (!response.IsSuccessStatusCode)
            {
                var errorMessage = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Failed to delete user from Clerk: {errorMessage}");
                return false;
            }

            return true;
        }

        [HttpPost("createshopper")]
        public async Task<IActionResult> SyncUser([FromBody] Shopper user)
        {
            if (string.IsNullOrEmpty(user.Username) || string.IsNullOrEmpty(user.Email))
            {
                return BadRequest("Username and Email are required.");
            }

            var existingShopper = _context.Shoppers.FirstOrDefault(s => s.ShopperId == user.ShopperId);

            if (existingShopper == null)
            {
                // Create a new shopper locally
                var newShopper = new Shopper
                {
                    Username = user.Username,
                    Email = user.Email,
                    ShopperId = user.ShopperId, // Clerk's user ID
                    Role = "User" // Default role to "User"
                };

                _context.Shoppers.Add(newShopper);
                _context.SaveChanges();

                // Update Clerk's public metadata to include the role
                await UpdateClerkMetadata(user.ShopperId, "User"); // Default to "User"

                return Ok(newShopper);
            }
            else
            {
                // Update the existing shopper's data
                existingShopper.Username = user.Username;
                existingShopper.Email = user.Email;
                existingShopper.Role = "User"; // Default role to "User"

                _context.SaveChanges();

                // Ensure Clerk metadata is updated
                await UpdateClerkMetadata(user.ShopperId, existingShopper.Role);

                return Ok(existingShopper);
            }
        }

        // hjælpermetode til at opdatere Clerk's metadata for en shopper
        private async Task UpdateClerkMetadata(string clerkUserId, string role)
        {
            // Call Clerk API to set public metadata
            var clerkApiBase = "https://api.clerk.dev/v1";
            var clerkApiKey = "sk_test_xrw66UE2sdlSfnMCldyaHfvWWiLzxWu9Jy4RGhq9hB"; // Replace with your Clerk API Key

            var client = new HttpClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {clerkApiKey}");

            var payload = new
            {
                public_metadata = new { role }
            };

            var jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            var response = await client.PatchAsync($"{clerkApiBase}/users/{clerkUserId}", content);

            if (!response.IsSuccessStatusCode)
            {
                var errorMessage = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Failed to update Clerk metadata: {errorMessage}");
            }
        }

        // PUT api/shopper/updateusername/{shopperId} (opdaterer en shopper's username med det givne id)
        [HttpPut("updateusername/{shopperId}")]
        public IActionResult UpdateUsername(string shopperId, [FromBody] string newUsername)
        {
            if (string.IsNullOrEmpty(newUsername))
            {
                return BadRequest("Username is required.");
            }

            var shopper = _context.Shoppers.FirstOrDefault(s => s.ShopperId == shopperId);
            if (shopper == null)
            {
                return NotFound();
            }

            shopper.Username = newUsername;
            _context.SaveChanges();

            return Ok(shopper);
        }

        // PUT api/shopper/updateemail/{shopperId} (opdaterer en shopper's email med det givne id)
        [HttpPut("updateemail/{shopperId}")]
        public IActionResult UpdateEmail(string shopperId, [FromBody] string newEmail)
        {
            if (string.IsNullOrEmpty(newEmail))
            {
                return BadRequest("Email is required.");
            }

            var shopper = _context.Shoppers.FirstOrDefault(s => s.ShopperId == shopperId);
            if (shopper == null)
            {
                return NotFound();
            }

            shopper.Email = newEmail;
            _context.SaveChanges();

            return Ok(shopper);
        }

        // GET api/shopper/checkemail/{email} (tjekker om en email allerede er i brug)
        [HttpGet("checkemail/{email}")]
        public IActionResult CheckEmail(string email)
        {
            var shopper = _context.Shoppers.FirstOrDefault(s => s.Email == email);
            if (shopper == null)
            {
                return NotFound();
            }
            return Ok(shopper);
        }

        // PUT api/shopper/updaterole (opdaterer en shopper's rolle)
        [HttpPut("updaterole")]
        public async Task<IActionResult> UpdateRole(string shopperId, UserRole role)
        {
            var shopper = _context.Shoppers.FirstOrDefault(s => s.ShopperId == shopperId);
            if (shopper == null)
            {
                return NotFound("User not found");
            }

            shopper.Role = role.ToString();
            _context.SaveChanges();

            // Update Clerk's public metadata to include the role
            await UpdateClerkMetadata(shopper.ShopperId, shopper.Role);

            return Ok(new { message = $"User role updated to '{role}'" });
        }

        // GET api/shopper/checkusername/{username} (tjekker om et brugernavn er i databasen for at kunne logge ind med dummy data)
        [HttpGet("checkusername/{username}")]
        public IActionResult CheckUsername(string username)
        {
            var shopper = _context.Shoppers.FirstOrDefault(s => s.Username == username);
            if (shopper == null)
            {
                return NotFound("Username does not exist");
            }
            return Ok(new { role = shopper.Role, email = shopper.Email, shopperId = shopper.ShopperId });
        }

        // ClerkUser class til at deserialisere Clerk's brugerdata
        private class ClerkUser
        {
            public PublicMetadata? public_metadata { get; set; }
        }

        // PublicMetadata class til at deserialisere Clerk's public metadata
        private class PublicMetadata
        {
            public string? role { get; set; }
        }

        // enum for de forskellige roller en shopper kan have
        public enum UserRole
        {
            User,
            Admin
        }
    }
}