using System.IO;
using Microsoft.EntityFrameworkCore;
using Project4Database.Models;

namespace Project4Database.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<Shopper> Shoppers { get; set; }
        public DbSet<ShoppingList> ShoppingLists { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Price> Prices { get; set; }
        public DbSet<ShoppingList_Product> ShoppingList_Products { get; set; }
        public DbSet<Subscription> Subscriptions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure the primary key for Shopper manually
            modelBuilder.Entity<Shopper>().HasKey(s => s.ShopperId); // Explicitly setting the primary key

            modelBuilder
                .Entity<ShoppingList>()
                .HasOne(sl => sl.Shopper)
                .WithMany(s => s.ShoppingLists)
                .HasForeignKey(sl => sl.ShopperId);

            modelBuilder
                .Entity<ShoppingList_Product>()
                .HasKey(sp => new { sp.ShoppingListId, sp.ProductId });

            modelBuilder
                .Entity<Price>()
                .Property(p => p.ProductPrice)
                .HasColumnType("decimal(18,2)");

            // Relation mellem Subscription og Product
            modelBuilder
                .Entity<Subscription>()
                .HasOne(s => s.Product)
                .WithMany()
                .HasForeignKey(s => s.ProductId);

            // Relation mellem Subscription og Price
            modelBuilder
                .Entity<Subscription>()
                .HasOne(s => s.OriginalPrice)
                .WithMany()
                .HasForeignKey(s => s.PriceId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deletion of Price if it is used in a Subscription
        }
    }
}