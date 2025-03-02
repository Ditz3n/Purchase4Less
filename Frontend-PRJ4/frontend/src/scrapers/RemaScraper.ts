import { IProduct, IProductScraper } from '../Interfaces/IScrapedProduct';

export class RemaScraper implements IProductScraper {
  canHandle(url: string): boolean {
    return url.includes('rema1000.dk');
  }

  async scrapeProduct(url: string): Promise<IProduct> {
    try {
      const response = await fetch('http://localhost:5000/api/WebScraper/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunne ikke hente produktdata');
      }

      const data = await response.json();
      console.log('Scraped data:', data);
      
      return {
        name: data.name || "Ukendt produkt",
        brand: data.brand || "Ukendt mærke",
        store: "Rema 1000",
        price: data.price || 0,
        image: data.image || ""
      };
    } catch (error) {
      console.error('Fejl ved scraping af Rema 1000 produkt:', error);
      throw error;
    }
  }
}