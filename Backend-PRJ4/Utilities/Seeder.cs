using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Cors;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Builder;
using Project4Database.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Project4Database.Data;
using System.Linq;

public class Seeder
{
    public void Seed(AppDbContext context)
    {
        // Ryd eksisterende data for admin-brugeren
        ClearData(context);

        // Opret dummy-data administratorbruger
        var shopper1 = new Shopper { ShopperId = GenerateShopperId(), Username = "Admin", Email = "admin@purchase4less.dk", Role = "Admin" };
        context.Shoppers.Add(shopper1);
        context.SaveChanges();
    }

    // Funktion til at generere et tilfældigt shopperId
    private string GenerateShopperId()
    {
        var random = new Random();
        var randomString = new string(Enumerable.Repeat("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 30)
            .Select(s => s[random.Next(s.Length)]).ToArray());
        return $"user_{randomString}";
    }

    // Funktion til at tilføje et produkt til en indkøbsliste
    public void AddProductToShoppingList(List<ShoppingList_Product> shoppingListProducts, ShoppingList shoppingList, Product product, int quantity)
    {
        var newShoppingListProduct = new ShoppingList_Product
        {
            ShoppingList = shoppingList,
            Product = product,
            Quantity = quantity
        };
        shoppingListProducts.Add(newShoppingListProduct);
    }

    // Funktion til at fjerne alle data fra databasen
    public void ClearData(AppDbContext context)
    {
        // Find admin-brugeren
        var adminShoppers = context.Shoppers.Where(s => s.Role == "Admin").ToList();
        if (adminShoppers.Any())
        {
            // Fjern kun admin-brugerens shoppinglister
            foreach (var adminShopper in adminShoppers)
            {
                var adminShoppingLists = context.ShoppingLists.Where(sl => sl.ShopperId == adminShopper.ShopperId).ToList();
                context.RemoveRange(adminShoppingLists);
            }
            // Fjern admin-brugerne
            context.RemoveRange(adminShoppers);
        }
    }
}