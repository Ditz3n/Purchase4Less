export interface IProduct {
    id?: number;
    name: string;
    brand: string;
    store: string;
    image: string;
    price: number;
  }
  
  export interface IProductScraper {
    canHandle(url: string): boolean;
    scrapeProduct(url: string): Promise<IProduct>;
  }