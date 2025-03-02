using Quartz;
using Project4Database.Controllers;
using Project4Database.Interfaces;
using Project4Database.Services;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading.Tasks;

namespace Project4Database.CRON
{
    public class ReseedJob : IJob
    {
        private readonly IDatabaseController _databaseController;
        private readonly ILoggerService _logger;

        public ReseedJob(IDatabaseController databaseController, ILoggerService logger)
        {
            _databaseController = databaseController;
            _logger = logger;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            try
            {
                await _logger.LogAsync("Starter planlagt database reseed...");
                await _databaseController.ReseedDatabase();
                await _logger.LogAsync("Database reseed gennemført med succes");
            }
            catch (Exception ex)
            {
                await _logger.LogAsync($"Fejl under database reseed: {ex.Message}");
                throw;
            }
        }
    }
} 