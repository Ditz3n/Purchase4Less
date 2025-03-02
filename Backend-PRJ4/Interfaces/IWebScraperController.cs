using Microsoft.AspNetCore.Mvc;
using Project4Database.Models;

namespace Project4Database.Interfaces
{
    public interface IWebScraperController
    {
        Task<IActionResult> ScrapeProduct([FromBody] ScrapeRequest request);
    }
}