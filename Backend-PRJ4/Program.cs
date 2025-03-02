using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Cors;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Builder;
using Project4Database.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Project4Database.Data;
using Microsoft.AspNetCore.Mvc;
using Project4Database.Data.Seeders;
using Project4Database.Controllers;
using Microsoft.Extensions.Logging;
using PuppeteerSharp;
using Project4Database.Interfaces;
using Project4Database.Services;
using Project4Database.CRON;
using Quartz;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddUserSecrets<Program>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        builder => builder
            .WithOrigins("http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Project4Database API",
        Version = "v1",
        Description = "API for managing shopping lists, products, and related data in the Project4Database system."
    });
});

// Register the IWebScraperController service
builder.Services.AddScoped<IWebScraperController, WebScraperController>();
// Register the IDatabaseController service
builder.Services.AddScoped<IDatabaseController, DatabaseController>();

// Tilføj denne linje for at sikre at alle controllers bliver registreret
builder.Services.AddControllers().AddApplicationPart(typeof(DatabaseController).Assembly);

// Kommenteret ud midlertidigt
// builder.Services.AddSingleton<ILoggerService, LoggerService>();
// builder.Services.AddQuartz(q =>
// {
//     var jobKey = new JobKey("ReseedJob");
//     q.AddJob<ReseedJob>(opts => opts.WithIdentity(jobKey));
//     q.AddTrigger(opts => opts
//         .ForJob(jobKey)
//         .WithIdentity("ReseedJob-trigger")
//         .WithCronSchedule("0 0 0 ? * SUN"));
// });
// builder.Services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetService<AppDbContext>();
    var seeder = new Seeder();
    seeder.Seed(context); // Seeder database med dummy data profilen "Admin"
    seeder.ClearData(context);
}

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Project4Database API v1");
});

app.UseCors("AllowFrontend");
app.MapControllers();
app.Run();