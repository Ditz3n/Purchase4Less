using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Project4Database.Models
{
    public class Subscription
    {
        [Key]
        public int SubId { get; set; } // Primær nøgle for subscription

        public string? UserId { get; set; } // User ID til at identificere abonnenten

        public decimal TargetPrice { get; set; } // Target-pris for produktet

        // Fremmednøgle til Product
        public int ProductId { get; set; } // ID for produktet

        [ForeignKey("ProductId")]
        public Product? Product { get; set; } // Navigation property til Product

        // Fremmednøgle til Price
        public int? PriceId { get; set; } // ID for den originale pris

        [ForeignKey("PriceId")]
        public Price? OriginalPrice { get; set; } // Navigation property til Price
    }
}