import { IScraperFactory } from '../Interfaces/IScraperFactory';
import { IProductScraper } from '../Interfaces/IScrapedProduct';
import { BilkaScraper } from '../scrapers/BilkaScraper';
import { RemaScraper } from '../scrapers/RemaScraper';
import { SparScraper } from '../scrapers/SparScraper';

export class ScraperFactory implements IScraperFactory {
  private scrapers: IProductScraper[] = [
    new BilkaScraper(),
    new RemaScraper(),
    new SparScraper()
  ];

  getScraper(url: string): IProductScraper | null {
    return this.scrapers.find(scraper => scraper.canHandle(url)) || null;
  }
}