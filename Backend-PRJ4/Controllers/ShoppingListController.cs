using System.CodeDom.Compiler;
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
    public class ShoppingListController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ShoppingListController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public ActionResult<IEnumerable<ShoppingList>> getShoppingLists()
        {
            var shoppingLists = _context.ShoppingLists.Include(s => s.Shopper).ToList();
            return Ok(shoppingLists);
        }

        [HttpGet("{id}")]
        public ActionResult<ShoppingList> getShoppingList(int id)
        {
            var shoppinglist = _context.ShoppingLists.Include(s => s.Shopper).FirstOrDefault(s => s.ShoppingListId == id);
            if (shoppinglist == null)
            {
                return NotFound();
            }
            return Ok(shoppinglist);
        }

        [HttpGet("shopper/{shopperId}")]
        public ActionResult<IEnumerable<ShoppingList>> GetShoppingListsByShopperId(string ShopperId)
        {
            var shoppingLists = _context.ShoppingLists
                .Include(s => s.Shopper)
                .Where(s => s.ShopperId == ShopperId)
                .ToList();

            if (!shoppingLists.Any())
            {
                return NotFound($"No shopping lists found for ShopperId: {ShopperId}");
            }

            return Ok(shoppingLists);
        }

        [HttpPost]
        public ActionResult<ShoppingList> CreateShoppingList(ShoppingList shoppinglist)
        {
            _context.ShoppingLists.Add(shoppinglist);
            _context.SaveChanges();

            return CreatedAtAction(nameof(getShoppingList), new { id = shoppinglist.ShoppingListId }, shoppinglist);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateShoppingList(int id, ShoppingList updatedShoppingList)
        {
            var shoppinglist = _context.ShoppingLists.Find(id);
            if (shoppinglist == null)
            {
                return NotFound();
            }

            shoppinglist.Title = updatedShoppingList.Title;

            _context.SaveChanges();

            return NoContent();
        }


        [HttpDelete("{id}")]
        public IActionResult DeleteShoppingList(int id)
        {
            var shoppinglist = _context.ShoppingLists.Find(id);
            if (shoppinglist == null)
            {
                return NotFound();
            }

            _context.ShoppingLists.Remove(shoppinglist);
            _context.SaveChanges();

            return NoContent();
        }

        [HttpGet("count")]
        public ActionResult<int> GetShoppingListCount()
        {
            var count = _context.ShoppingLists.Count();
            return Ok(count);
        }
    }
}