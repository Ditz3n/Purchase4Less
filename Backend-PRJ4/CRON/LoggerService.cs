using System.Text;

namespace Project4Database.Services
{
    public interface ILoggerService
    {
        Task LogAsync(string message);
    }

    public class LoggerService : ILoggerService
    {
        private readonly string _logFilePath;
        private readonly object _lockObject = new object();

        public LoggerService(IConfiguration configuration)
        {
            var baseDir = AppDomain.CurrentDomain.BaseDirectory;
            var logsDir = Path.Combine(baseDir, "Logs");
            
            // Opret logs mappe hvis den ikke eksisterer
            if (!Directory.Exists(logsDir))
            {
                Directory.CreateDirectory(logsDir);
            }

            _logFilePath = Path.Combine(logsDir, "reseed.log");
        }

        public async Task LogAsync(string message)
        {
            var logMessage = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] {message}{Environment.NewLine}";
            
            try
            {
                await File.AppendAllTextAsync(_logFilePath, logMessage);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Fejl ved logning: {ex.Message}");
            }
        }
    }
} 