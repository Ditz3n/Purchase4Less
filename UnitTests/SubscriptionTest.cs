using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using Project4Database.Controllers;
using Project4Database.Data;
using Project4Database.Models;

namespace Project4Database.UnitTests
{
    [TestFixture]
    public class SubscriptionControllerTests
    {
        private AppDbContext _context;
        private SubscriptionController _controller;

        [SetUp]
        public void Setup()
        {
            // Konfigurer in-memory database
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase")
                .Options;

            _context = new AppDbContext(options);
            _controller = new SubscriptionController(_context);

            // Slet databasen og opret den på ny før hver test
            _context.Database.EnsureDeleted();
            _context.Database.EnsureCreated();
        }

        [Test]
        public async Task AddSubscription_ShouldReturnOk_WhenSubscriptionIsValid()
        {
            // Arrange
            // Opret et produkt med priser
            var product = new Product
            {
                ProductId = 1,
                Name = "Test Product",
                Prices = new List<Price>
                {
                    new Price { PriceId = 1, ProductPrice = 100, Source = "Test Source" }
                }
            };

            // Tilføj produktet til databasen
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Opret en valid subscription
            var subscription = new Subscription
            {
                UserId = "user_1",
                ProductId = 1,
                TargetPrice = 90
            };

            // Act
            // Kald AddSubscription-endpointet
            var result = await _controller.AddSubscription(subscription);

            // Assert
            // Tjek at resultatet er en OkObjectResult
            var okResult = result as OkObjectResult;
            Assert.That(okResult, Is.Not.Null);

            // Tjek indholdet af svaret
            var response = okResult?.Value as SubscriptionResponse;
            Assert.That(response, Is.Not.Null);
            Assert.That(response?.Message, Is.EqualTo("Subscription added successfully."));

            // Tjek at subscription blev tilføjet til databasen
            var addedSubscription = _context.Subscriptions.FirstOrDefault();
            Assert.That(addedSubscription, Is.Not.Null);
            Assert.That(addedSubscription?.UserId, Is.EqualTo(subscription.UserId));
            Assert.That(addedSubscription?.ProductId, Is.EqualTo(subscription.ProductId));
        }

        [Test]
        public async Task AddSubscription_ShouldReturnNotFound_WhenProductDoesNotExist()
        {
            // Arrange
            // Opret en subscription til et produkt, der ikke findes
            var subscription = new Subscription
            {
                UserId = "user_1",
                ProductId = 999, // Produktet eksisterer ikke
                TargetPrice = 90
            };

            // Act
            // Kald AddSubscription-endpointet
            var result = await _controller.AddSubscription(subscription);

            // Assert
            // Tjek at resultatet er en NotFoundObjectResult
            var notFoundResult = result as NotFoundObjectResult;
            Assert.That(notFoundResult, Is.Not.Null);
            Assert.That(notFoundResult?.Value, Is.EqualTo("The specified product does not exist."));
        }

        [Test]
        public async Task AddSubscription_ShouldSetLatestPriceId_WhenProductHasPrices()
        {
            // Arrange
            // Opret et produkt med flere priser
            var product = new Product
            {
                ProductId = 1,
                Name = "Test Product",
                Prices = new List<Price>
                {
                    new Price { PriceId = 1, ProductPrice = 100, Source = "Test Source" },
                    new Price { PriceId = 2, ProductPrice = 90, Source = "Another Source" }
                }
            };

            // Tilføj produktet til databasen
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Opret en subscription
            var subscription = new Subscription
            {
                UserId = "user_1",
                ProductId = 1,
                TargetPrice = 85
            };

            // Act
            // Kald AddSubscription-endpointet
            var result = await _controller.AddSubscription(subscription);

            // Assert
            // Tjek at resultatet er en OkObjectResult
            var okResult = result as OkObjectResult;
            Assert.That(okResult, Is.Not.Null);

            // Tjek indholdet af svaret
            var response = okResult?.Value as SubscriptionResponse;
            Assert.That(response, Is.Not.Null);
            Assert.That(response?.Message, Is.EqualTo("Subscription added successfully."));

            // Tjek at den seneste pris blev knyttet til subscription
            var addedSubscription = _context.Subscriptions.FirstOrDefault();
            Assert.That(addedSubscription, Is.Not.Null);
            Assert.That(addedSubscription?.PriceId, Is.EqualTo(2)); // Seneste pris ID
        }
    }
}