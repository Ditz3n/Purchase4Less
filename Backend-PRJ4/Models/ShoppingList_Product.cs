namespace Project4Database.Models
{
    public class ShoppingList_Product
    {
        public int ShoppingListId { get; set; }
        public ShoppingList? ShoppingList { get; set; }

        public int ProductId { get; set; }
        public Product? Product { get; set; }

        public int Quantity { get; set; }
    }
}
