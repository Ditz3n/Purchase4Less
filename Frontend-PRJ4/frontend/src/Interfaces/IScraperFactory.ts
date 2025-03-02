import { IProductScraper } from './IScrapedProduct';

export interface IScraperFactory {
  getScraper(url: string): IProductScraper | null;
}