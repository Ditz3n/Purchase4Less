import { IProduct, IProductScraper } from '../Interfaces/IScrapedProduct';

export class BilkaScraper implements IProductScraper {
  canHandle(url: string): boolean {
    return url.includes('bilkatogo.dk');
  }

  async scrapeProduct(url: string): Promise<IProduct> {
    try {
      console.log('Sending request to scraper...');
      
      const response = await fetch('http://localhost:5000/api/WebScraper/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error('Kunne ikke hente produktdata');
      }

      const data = await response.json();
      console.log('Raw response data:', data);
      
      const product = {
        name: data.name || "Ukendt produkt",
        brand: data.brand || "Ukendt mærke",
        store: "Bilka",
        price: data.price || 0,
        image: data.image || ""
      };
      
      console.log('Processed product data:', product);
      return product;
      
    } catch (error) {
      console.error('Fejl ved scraping af Bilka produkt:', error);
      throw error;
    }
  }
}