using Microsoft.AspNetCore.Mvc;

namespace Project4Database.Interfaces
{
    public interface IDatabaseController
    {
        Task<IActionResult> ReseedDatabase();
    }
} 