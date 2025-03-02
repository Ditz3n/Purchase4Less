using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using Project4Database.Controllers;
using Project4Database.Data;
using Project4Database.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Project4Database.Tests
{
    [TestFixture]
    public class ShopperControllerTests
    {
        private AppDbContext _context;
        private ShopperController _controller;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase_" + System.Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _context.Database.EnsureDeleted();
            _context.Database.EnsureCreated();

            _controller = new ShopperController(_context);
        }

        [Test]
        public async Task GetShoppers_WhenCalled_ReturnsAllShoppers()
        {
            // Arrange
            var shopper1 = new Shopper { ShopperId = "1", Username = "User1", Email = "user1@example.com", Role = "User" };
            var shopper2 = new Shopper { ShopperId = "2", Username = "User2", Email = "user2@example.com", Role = "Admin" };
            _context.Shoppers.Add(shopper1);
            _context.Shoppers.Add(shopper2);
            await _context.SaveChangesAsync();

            // Act
            var result = _controller.GetShoppers();

            // Assert
            Assert.That(result, Is.InstanceOf<ActionResult<IEnumerable<Shopper>>>());

            var actionResult = (result.Result as OkObjectResult);
            Assert.That(actionResult, Is.Not.Null);

            var shoppers = actionResult.Value as List<Shopper>;
            Assert.That(shoppers, Is.Not.Null);
            Assert.That(shoppers.Count, Is.EqualTo(2));
        }

        [Test]
        public async Task GetShopper_WhenCalledWithExistingId_ReturnsShopper()
        {
            // Arrange
            var shopper = new Shopper { ShopperId = "1", Username = "User1", Email = "user1@example.com", Role = "User" };
            _context.Shoppers.Add(shopper);
            await _context.SaveChangesAsync();

            // Act
            var result = _controller.GetShopper("1");

            // Assert
            Assert.That(result, Is.InstanceOf<ActionResult<Shopper>>());

            var actionResult = (result.Result as OkObjectResult);
            Assert.That(actionResult, Is.Not.Null);

            var returnedShopper = actionResult.Value as Shopper;
            Assert.That(returnedShopper, Is.Not.Null);
            Assert.That(returnedShopper.ShopperId, Is.EqualTo("1"));
            Assert.That(returnedShopper.Username, Is.EqualTo("User1"));
        }

        [Test]
        public void GetShopper_WhenCalledWithNonExistingId_ReturnsNotFound()
        {
            // Arrange
            var nonExistingId = "999";

            // Act
            var result = _controller.GetShopper(nonExistingId);

            // Assert
            Assert.That(result.Result, Is.InstanceOf<NotFoundResult>());
        }

        [Test]
        public void GetShopperCount_WhenCalled_ReturnsCorrectCount()
        {
            // Arrange
            var shopper1 = new Shopper { ShopperId = "1", Username = "User1", Email = "user1@example.com", Role = "User" };
            var shopper2 = new Shopper { ShopperId = "2", Username = "User2", Email = "user2@example.com", Role = "Admin" };
            _context.Shoppers.Add(shopper1);
            _context.Shoppers.Add(shopper2);
            _context.SaveChanges();

            // Act
            var result = _controller.GetShopperCount();

            // Assert
            Assert.That(result, Is.InstanceOf<ActionResult<int>>());

            var actionResult = (result.Result as OkObjectResult);
            Assert.That(actionResult, Is.Not.Null);

            var count = (int)actionResult.Value;
            Assert.That(count, Is.EqualTo(2));
        }

        [Test]
        public async Task DeleteShopper_WhenCalledWithExistingId_ReturnsNoContent()
        {
            // Arrange
            var shopper = new Shopper { ShopperId = "1", Username = "User1", Email = "user1@example.com", Role = "User" };
            _context.Shoppers.Add(shopper);
            await _context.SaveChangesAsync();

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };
            _controller.ControllerContext.HttpContext.Request.Headers["Dummy-Login"] = "true";

            // Act
            var result = await _controller.DeleteShopper("1");

            // Assert
            Assert.That(result, Is.InstanceOf<NoContentResult>());
        }

        [Test]
        public async Task DeleteShopper_WhenCalledWithNonExistingId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.DeleteShopper("NonExistentId");

            // Assert
            Assert.That(result, Is.InstanceOf<NotFoundResult>());
        }

        [Test]
        public async Task CreateShopper_WhenCalledWithValidData_ReturnsOk()
        {
            // Arrange
            var newShopper = new Shopper { ShopperId = "3", Username = "User3", Email = "user3@example.com", Role = "User" };

            // Act
            var result = await _controller.SyncUser(newShopper);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());

            var okResult = (result as OkObjectResult);
            var createdShopper = okResult.Value as Shopper;

            Assert.That(createdShopper, Is.Not.Null);
            Assert.That(createdShopper.ShopperId, Is.EqualTo("3"));
            Assert.That(createdShopper.Username, Is.EqualTo("User3"));
        }

        [Test]
        public async Task CreateShopper_WhenCalledWithInvalidData_ReturnsBadRequest()
        {
            // Arrange
            var newShopper = new Shopper { ShopperId = "3", Username = "", Email = "", Role = "User" };

            // Act
            var result = await _controller.SyncUser(newShopper);

            // Assert
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task UpdateUsername_WhenCalledWithValidData_ReturnsOk()
        {
            // Arrange
            var shopper = new Shopper { ShopperId = "1", Username = "User1", Email = "user1@example.com", Role = "User" };
            _context.Shoppers.Add(shopper);
            await _context.SaveChangesAsync();
            var newUsername = "UpdatedUser1";

            // Act
            var result = _controller.UpdateUsername("1", newUsername);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());

            var okResult = (result as OkObjectResult);
            var updatedShopper = okResult.Value as Shopper;

            Assert.That(updatedShopper, Is.Not.Null);
            Assert.That(updatedShopper.ShopperId, Is.EqualTo("1"));
            Assert.That(updatedShopper.Username, Is.EqualTo(newUsername));
        }

        [Test]
        public async Task UpdateEmail_WhenCalledWithValidData_ReturnsOk()
        {
            // Arrange
            var shopper = new Shopper { ShopperId = "1", Username = "User1", Email = "user1@example.com", Role = "User" };
            _context.Shoppers.Add(shopper);
            await _context.SaveChangesAsync();
            var newEmail = "updateduser1@example.com";

            // Act
            var result = _controller.UpdateEmail("1", newEmail);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());

            var okResult = (result as OkObjectResult);
            var updatedShopper = okResult.Value as Shopper;

            Assert.That(updatedShopper, Is.Not.Null);
            Assert.That(updatedShopper.ShopperId, Is.EqualTo("1"));
            Assert.That(updatedShopper.Email, Is.EqualTo(newEmail));
        }

        [Test]
        public async Task UpdateEmail_WhenCalledWithInvalidData_ReturnsBadRequest()
        {
            // Arrange
            var shopper = new Shopper { ShopperId = "1", Username = "User1", Email = "user1@example.com", Role = "User" };
            _context.Shoppers.Add(shopper);
            await _context.SaveChangesAsync();
            var newEmail = ""; // Invalid email

            // Act
            var result = _controller.UpdateEmail("1", newEmail);

            // Assert
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }
    }
}
