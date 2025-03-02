namespace Project4Database.Models
{
    public class ShoppingList
    {
        public int ShoppingListId { get; set; }
        public required string Title { get; set; }
        public DateTime Date { get; set; } = DateTime.Now;

        public string? ShopperId { get; set; }
        public Shopper? Shopper { get; set; }

        public List<ShoppingList_Product> ShoppingList_Products { get; set; } = new();
    }
}
