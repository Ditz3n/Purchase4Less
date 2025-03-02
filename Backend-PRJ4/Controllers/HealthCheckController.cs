using Microsoft.AspNetCore.Mvc;
using Project4Database.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Cors;

namespace Project4Database.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowFrontend")]
    public class HealthCheckController : ControllerBase
    {
        private readonly AppDbContext _context;
        private static DateTime _startTime;
        private static int _totalChecks = 0;
        private static int _successfulChecks = 0;

        static HealthCheckController()
        {
            _startTime = DateTime.Now;
        }

        public HealthCheckController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("status")]
        public IActionResult GetStatus()
        {
            try
            {
                _totalChecks++;
                // Simple query to check the database connection
                _context.Database.ExecuteSqlRaw("SELECT 1");
                _successfulChecks++;
                
                // Beregn uptime som procentdel af succesfulde checks
                double uptime = (_successfulChecks / (double)_totalChecks) * 100;
                
                return Ok(new { 
                    status = "online",
                    uptime = uptime,
                    totalChecks = _totalChecks,
                    successfulChecks = _successfulChecks
                });
            }
            catch
            {
                _totalChecks++;
                double uptime = (_successfulChecks / (double)_totalChecks) * 100;
                
                return StatusCode(500, new { 
                    status = "offline",
                    uptime = uptime,
                    totalChecks = _totalChecks,
                    successfulChecks = _successfulChecks
                });
            }
        }

        [HttpGet("database")]
        public IActionResult CheckDatabase()
        {
            try
            {
                bool isConnected = _context.Database.CanConnect();
                double uptime = (_successfulChecks / (double)_totalChecks) * 100;

                return Ok(new
                {
                    isConnected,
                    connectionCount = _context.Database.GetDbConnection().State == System.Data.ConnectionState.Open ? 1 : 0,
                    lastSync = DateTime.Now,
                    uptime = uptime
                });
            }
            catch
            {
                double uptime = (_successfulChecks / (double)_totalChecks) * 100;
                return StatusCode(500, new
                {
                    isConnected = false,
                    connectionCount = 0,
                    lastSync = DateTime.Now,
                    uptime = uptime
                });
            }
        }

        [HttpGet("metrics")]
        public IActionResult GetMetrics()
        {
            float errorRate = _totalChecks > 0 ? (_totalChecks - _successfulChecks / (float)_totalChecks) * 100 : 0;
            
            return Ok(new
            {
                totalChecks = _totalChecks,
                successfulChecks = _successfulChecks,
                errorRate = Math.Round(errorRate, 2),
                uptime = (DateTime.Now - _startTime).TotalMinutes,
                lastChecked = DateTime.Now
            });
        }

        [HttpGet("reset-metrics")]
        public IActionResult ResetMetrics()
        {
            _totalChecks = 0;
            _successfulChecks = 0;
            _startTime = DateTime.Now;
            
            return Ok(new { 
                message = "Metrics reset successfully",
                resetTime = DateTime.Now
            });
        }
    }
}

