using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using Project4Database.Controllers;
using Project4Database.Data;
using System;

namespace Project4Database.Tests
{
    [TestFixture]
    public class HealthCheckControllerTests
    {
        private AppDbContext _context;
        private HealthCheckController _controller;

        [SetUp]
        public void SetUp()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase_" + Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _controller = new HealthCheckController(_context);
        }

        // [Test]
        // public void GetStatus_WhenDatabaseIsOnline_ReturnsOkWithOnlineStatus()
        // {
        //     // Act
        //     var result = _controller.GetStatus();

        //     // Assert
        //     Assert.That(result, Is.InstanceOf<ObjectResult>());

        //     var objectResult = (ObjectResult)result;
        //     Assert.That(objectResult.StatusCode, Is.EqualTo(200));
        //     Assert.That(((dynamic)objectResult.Value).status, Is.EqualTo("online"));
        // }

        // [Test]
        // public void GetStatus_WhenDatabaseIsOffline_ReturnsInternalServerErrorWithOfflineStatus()
        // {
        //     // Arrange
        //     _context.Database.EnsureDeleted();

        //     // Act
        //     var result = _controller.GetStatus();

        //     // Assert
        //     Assert.That(result, Is.InstanceOf<ObjectResult>());

        //     var objectResult = (ObjectResult)result;
        //     Assert.That(objectResult.StatusCode, Is.EqualTo(500));
        //     Assert.That(((dynamic)objectResult.Value).status, Is.EqualTo("offline"));
        // }

        [TearDown]
        public void TearDown()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
