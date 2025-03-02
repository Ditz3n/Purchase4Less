namespace Project4Database.Models
{
    public class Price
    {
        public int PriceId { get; set; }
        public decimal ProductPrice { get; set; }
        public required string Source { get; set; }

        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;
    }
}
