using NUnit.Framework;
using Microsoft.EntityFrameworkCore;
using Project4Database.Data;
using Project4Database.Models;
using Project4Database.Controllers;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Project4Database.UnitTests
{
    [TestFixture]
    public class ShoppingListProductControllerTests
    {
        private AppDbContext? _context;
        private ShoppingListProductController? _controller;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: System.Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _controller = new ShoppingListProductController(_context);
        }

        [Test]
        public void GetProductsInShoppingList_ReturnsProducts_WhenShoppingListExists()
        {
            // Arrange
            var product = new Product
            {
                ProductId = 1,
                Name = "Milk",
                UniqueItemIdentifier = "123"
            };
            var shoppingList = new ShoppingList
            {
                ShoppingListId = 1,
                Title = "Test Shopping List",
                ShoppingList_Products = new List<ShoppingList_Product>
                {
                    new ShoppingList_Product
                    {
                        Product = product,
                        ProductId = 1,
                        ShoppingListId = 1,
                        Quantity = 2
                    }
                }
            };

            _context!.Products.Add(product);
            _context.ShoppingLists.Add(shoppingList);
            _context.SaveChanges();

            // Act
            var result = _controller!.getProductsInShoppingList(1);

            // Assert
            Assert.That(result, Is.TypeOf<ActionResult<IEnumerable<object>>>());
            var okResult = result.Result as OkObjectResult;
            Assert.That(okResult, Is.Not.Null);
            var products = okResult!.Value as IEnumerable<object>;
            Assert.That(products, Is.Not.Null);
            Assert.That(products!.Count(), Is.EqualTo(1));
        }

        [Test]
        public async Task GetTotalPrices_ReturnsCorrectTotals_ForThreeStores()
        {
            // Arrange
            var product1 = new Product
            {
                ProductId = 1,
                Name = "Apple",
                UniqueItemIdentifier = "A1",
                Prices = new List<Price>
                {
                    new Price { Source = "Bilka", ProductPrice = 3.0m },
                    new Price { Source = "Rema 1000", ProductPrice = 2.8m },
                    new Price { Source = "Spar", ProductPrice = 3.2m }
                }
            };
            var product2 = new Product
            {
                ProductId = 2,
                Name = "Banana",
                UniqueItemIdentifier = "B1",
                Prices = new List<Price>
                {
                    new Price { Source = "Bilka", ProductPrice = 1.5m },
                    new Price { Source = "Rema 1000", ProductPrice = 1.3m },
                    new Price { Source = "Spar", ProductPrice = 1.6m }
                }
            };
            var shoppingListProduct1 = new ShoppingList_Product
            {
                ShoppingListId = 1,
                ProductId = 1,
                Product = product1,
                Quantity = 4
            };
            var shoppingListProduct2 = new ShoppingList_Product
            {
                ShoppingListId = 1,
                ProductId = 2,
                Product = product2,
                Quantity = 6
            };

            _context!.Products.AddRange(product1, product2);
            _context.ShoppingList_Products.AddRange(shoppingListProduct1, shoppingListProduct2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller!.GetTotalPrices(1);

            // Assert
            var actionResult = result.Result as OkObjectResult;
            Assert.That(actionResult, Is.Not.Null);

            var totals = actionResult!.Value as IEnumerable<ShoppingListProductController.TotalPrice>;
            Assert.That(totals, Is.Not.Null);

            var totalPrices = totals!.ToList();

            Assert.That(totalPrices.Count, Is.EqualTo(3));
            Assert.That(totalPrices.First(t => t.Source == "Bilka").Total, Is.EqualTo(21.0m));
            Assert.That(totalPrices.First(t => t.Source == "Rema 1000").Total, Is.EqualTo(19.0m));
            Assert.That(totalPrices.First(t => t.Source == "Spar").Total, Is.EqualTo(22.4m));
        }

        [Test]
        public async Task GetTotalPrices_ReturnsEmptyList_WhenNoProducts()
        {
            // Act
            var result = await _controller!.GetTotalPrices(1);

            // Assert
            var actionResult = result.Result as OkObjectResult;
            Assert.That(actionResult, Is.Not.Null);
            var totals = actionResult!.Value as IEnumerable<dynamic>;
            Assert.That(totals, Is.Not.Null);
            Assert.That(totals, Is.Empty);
        }

        [Test]
        public void IncrementProductQuantity_IncrementsQuantity_WhenProductExists()
        {
            // Arrange
            var shoppingListProduct = new ShoppingList_Product
            {
                ShoppingListId = 1,
                ProductId = 1,
                Quantity = 1
            };

            _context!.ShoppingList_Products.Add(shoppingListProduct);
            _context.SaveChanges();

            // Act
            _controller!.IncrementProductQuantity(1, 1);

            // Assert
            Assert.That(_context.ShoppingList_Products.First().Quantity, Is.EqualTo(2));
        }

        [Test]
        public void DeleteProduct_RemovesProduct_WhenProductExists()
        {
            // Arrange
            var shoppingListProduct = new ShoppingList_Product
            {
                ShoppingListId = 1,
                ProductId = 1
            };

            _context!.ShoppingList_Products.Add(shoppingListProduct);
            _context.SaveChanges();

            // Act
            _controller!.DeleteProduct(1, 1);

            // Assert
            Assert.That(_context.ShoppingList_Products, Is.Empty);
        }

        [Test]
        public async Task AddProductToList_AddsProducts_WhenValidRequest()
        {
            // Arrange
            var product = new Product
            {
                ProductId = 1,
                Name = "Test Product",
                UniqueItemIdentifier = "123"
            };
            var shoppingList = new ShoppingList
            {
                ShoppingListId = 1,
                Title = "Test Shopping List"
            };

            _context!.Products.Add(product);
            _context.ShoppingLists.Add(shoppingList);
            await _context.SaveChangesAsync();

            var request = new ShoppingListProductController.AddProductToListRequest
            {
                ShoppingListId = 1,
                UniqueItemIdentifier = "123"
            };

            // Act
            var result = await _controller!.AddProductToList(request);

            // Assert
            Assert.That(_context.ShoppingList_Products.Count(), Is.EqualTo(1));
        }
    }
}
