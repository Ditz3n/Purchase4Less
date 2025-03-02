using NUnit.Framework;
using Microsoft.EntityFrameworkCore;
using Project4Database.Data;
using Project4Database.Models;
using Project4Database.Controllers;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;

namespace Project4Database.UnitTests
{
    [TestFixture]
    public class ShoppingListControllerTests
    {
        private AppDbContext? _context;
        private ShoppingListController? _controller;

        [SetUp]
        public void SetUp()
        {
            // Create a unique database name for each test
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: System.Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _controller = new ShoppingListController(_context);

            // Initialize ControllerBase properties
            _controller.ControllerContext = new ControllerContext();
            _controller.ModelState.Clear(); // Ensure ModelState is initialized
        }

        [Test]
        public void GetShoppingLists_ReturnsAllShoppingLists()
        {
            // Arrange
            var shoppingLists = new List<ShoppingList>
    {
        new ShoppingList { ShoppingListId = 1, Title = "Groceries" },
        new ShoppingList { ShoppingListId = 2, Title = "Electronics" }
    };

            _context!.ShoppingLists.AddRange(shoppingLists);
            _context.SaveChanges();

            // Act
            var result = _controller!.getShoppingLists();

            // Assert
            Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
            var returnValue = (result.Result as OkObjectResult)!.Value as IEnumerable<ShoppingList>;
            Assert.That(returnValue, Is.Not.Null);
            Assert.That(returnValue!.Count(), Is.EqualTo(2));
        }


        [Test]
        public void GetShoppingLists_ReturnsEmptyList_WhenNoShoppingListsExist()
        {
            // Act
            var result = _controller!.getShoppingLists();

            // Assert
            Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
            var returnValue = (result.Result as OkObjectResult)!.Value as IEnumerable<ShoppingList>;
            Assert.That(returnValue, Is.Not.Null);
            Assert.That(returnValue, Is.Empty);
        }

        [Test]
        public void GetShoppingList_ReturnsNotFound_WhenIdDoesNotExist()
        {
            // Act
            var result = _controller!.getShoppingList(99);

            // Assert
            Assert.That(result.Result, Is.TypeOf<NotFoundResult>());
        }

        [Test]
        public void GetShoppingList_ReturnsShoppingList_WhenIdExists()
        {
            // Arrange
            var shoppingList = new ShoppingList { ShoppingListId = 1, Title = "Groceries" };
            _context!.ShoppingLists.Add(shoppingList);
            _context.SaveChanges();

            // Act
            var result = _controller!.getShoppingList(1);

            // Assert
            Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
            var returnValue = (result.Result as OkObjectResult)!.Value as ShoppingList;
            Assert.That(returnValue, Is.Not.Null);
            Assert.That(returnValue!.Title, Is.EqualTo("Groceries"));
        }

        [Test]
        public void GetShoppingListsByShopperId_ReturnsNotFound_WhenShopperIdDoesNotExist()
        {
            // Act
            var result = _controller!.GetShoppingListsByShopperId("nonexistent-id");

            // Assert
            Assert.That(result.Result, Is.TypeOf<NotFoundObjectResult>());
            var returnValue = result.Result as NotFoundObjectResult;
            Assert.That(returnValue, Is.Not.Null);
            Assert.That(returnValue!.Value, Is.EqualTo("No shopping lists found for ShopperId: nonexistent-id"));
        }

        [Test]
        public void CreateShoppingList_AddsShoppingListToDatabase()
        {
            // Arrange
            var shoppingList = new ShoppingList { Title = "Books" };

            // Act
            var result = _controller!.CreateShoppingList(shoppingList);

            // Assert
            Assert.That(result.Result, Is.TypeOf<CreatedAtActionResult>());
            var returnValue = result.Result as CreatedAtActionResult;
            Assert.That(returnValue, Is.Not.Null);
            Assert.That(returnValue!.ActionName, Is.EqualTo("getShoppingList"));
        }

        [Test]
        public void UpdateShoppingList_ReturnsNoContent_WhenUpdateIsSuccessful()
        {
            // Arrange
            var shoppingList = new ShoppingList { ShoppingListId = 1, Title = "Groceries" };
            _context!.ShoppingLists.Add(shoppingList);
            _context.SaveChanges();

            var updatedShoppingList = new ShoppingList { ShoppingListId = 1, Title = "Updated Groceries" };

            // Act
            var result = _controller!.UpdateShoppingList(1, updatedShoppingList);

            // Assert
            Assert.That(result, Is.TypeOf<NoContentResult>());
            Assert.That(_context.ShoppingLists.First().Title, Is.EqualTo("Updated Groceries"));
        }

        [Test]
        public void DeleteShoppingList_RemovesShoppingListFromDatabase()
        {
            // Arrange
            var shoppingList = new ShoppingList { ShoppingListId = 1, Title = "Groceries" };
            _context!.ShoppingLists.Add(shoppingList);
            _context.SaveChanges();

            // Act
            var result = _controller!.DeleteShoppingList(1);

            // Assert
            Assert.That(result, Is.TypeOf<NoContentResult>());
            Assert.That(_context.ShoppingLists, Is.Empty);
        }
    }
}
