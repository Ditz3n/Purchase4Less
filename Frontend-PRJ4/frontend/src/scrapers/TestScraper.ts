import { IProduct, IProductScraper } from '../Interfaces/IScrapedProduct';

export class TestScraper implements IProductScraper {
  canHandle(url: string): boolean {
    return url.includes('test.com');
  }

  async scrapeProduct(url: string): Promise<IProduct> {
    // Simuler en kort forsinkelse
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Vælg tilfældigt mellem to produkter
    const products = [
      {
        name: "Avocado",
        brand: "Mexicado", 
        store: "Netto",
        image: "https://scontent-arn2-1.xx.fbcdn.net/v/t1.15752-9/462561964_1640714109849162_8189366574197064241_n.png?_nc_cat=100&ccb=1-7&_nc_sid=9f807c&_nc_ohc=Now_2T0ypzQQ7kNvgGWJ4OF&_nc_zt=23&_nc_ht=scontent-arn2-1.xx&oh=03_Q7cD1QG2tKuoKyCMSyZ_XxFeieFuml_mDdKyi7JC4DSME3hA7g&oe=6763FEB6",
        price: 9.99
      },
      {
        name: "Banan",
        brand: "Chiquita",
        store: "Netto", 
        image: "https://www.chiquita.com/wp-content/uploads/2019/12/Chiquita_Banana-1024x683.jpg",
        price: 4.99
      }
    ];

    return products[Math.floor(Math.random() * products.length)];
  }
}