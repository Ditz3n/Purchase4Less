using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using Project4Database.Controllers;
using Project4Database.Data;
using Project4Database.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Project4Database.Tests
{
    [TestFixture]
    public class ProductsControllerTests
    {
        private AppDbContext _context;
        private ProductsController _controller;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase("TestDatabase")
                .Options;

            _context = new AppDbContext(options);
            _controller = new ProductsController(_context);

            _context.Database.EnsureDeleted();
            _context.Database.EnsureCreated();

            _context.Products.Add(new Product
            {
                ProductId = 1,
                Name = "Test Product 1",
                Prices = new List<Price>
                {
                    new Price { PriceId = 1, ProductPrice = 2.75m, Source = "Bilka", ProductId = 1 }
                }
            });

            _context.Products.Add(new Product
            {
                ProductId = 2,
                Name = "Test Product 2",
                Prices = new List<Price>
                {
                    new Price { PriceId = 2, ProductPrice = 3.50m, Source = "Rema 1000", ProductId = 2 }
                }
            });

            _context.SaveChanges();
        }

        [Test]
        public async Task GetProducts_WhenCalled_ReturnsOkWithListOfProducts()
        {
            var result = await _controller.GetProducts();

            Assert.That(result, Is.InstanceOf<ActionResult<IEnumerable<Product>>>()); // Tjekker typen

            var actionResult = result.Result as OkObjectResult;
            Assert.That(actionResult, Is.Not.Null); // Sikrer, at resultatet ikke er null

            var products = actionResult?.Value as List<Product>;
            Assert.That(products, Is.Not.Null); // Sikrer, at vi har en liste
            Assert.That(products?.Count, Is.EqualTo(2)); // Forventet antal produkter
        }

        [Test]
        public async Task GetProduct_WhenProductExists_ReturnsOkWithProduct_OrNull()
        {
            var result = await _controller.GetProduct(1);

            if (result == null)
            {
                Assert.That(result, Is.Null); // Hvis produktet er null
                return;
            }

            var actionResult = result.Result as OkObjectResult;
            Assert.That(actionResult, Is.Not.Null); // Tjekker, at vi har et OkResult

            var product = actionResult?.Value as Product;
            Assert.That(product, Is.Not.Null); // Tjekker, at vi har produktdata

            Assert.That(product.ProductId, Is.EqualTo(1));
            Assert.That(product.Name, Is.EqualTo("Test Product 1"));
            Assert.That(product.Prices.Count, Is.EqualTo(1));
            Assert.That(product.Prices[0].ProductPrice, Is.EqualTo(2.75m));
            Assert.That(product.Prices[0].Source, Is.EqualTo("Bilka"));
        }

        [Test]
        public async Task GetProduct_WhenProductDoesNotExist_ReturnsNotFound()
        {
            var result = await _controller.GetProduct(999);

            Assert.That(result, Is.InstanceOf<ActionResult<Product>>()); // Tjekker typen

            var actionResult = result.Result as NotFoundResult;
            Assert.That(actionResult, Is.Not.Null); // Sikrer, at vi får et NotFoundResult
        }
    }
}
