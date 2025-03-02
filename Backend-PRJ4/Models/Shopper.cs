namespace Project4Database.Models
{
    public class Shopper
    {
        public string? ShopperId { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string Role { get; set; }
        public List<ShoppingList>? ShoppingLists { get; set; }
    }
}
