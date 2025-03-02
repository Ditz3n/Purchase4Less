namespace Project4Database.Models
{
    public class Product
    {
        public int ProductId { get; set; }
        public required string Name { get; set; }
        public string? UniqueItemIdentifier { get; set; }
        public string? ImageUrl { get; set; }
        public string? Brand { get; set; }

        public List<ShoppingList_Product> ShoppingList_Products { get; set; } = new();
        public List<Price> Prices { get; set; } = new();

    }
}
