import { useState } from 'react';
import { IProduct } from '../../Interfaces/IScrapedProduct';
import { ScraperFactory } from '../../services/ScraperFactory';
import { ProductCard } from './Products/ProductCard';

export const WebScraper = () => {
  const [url, setUrl] = useState('');
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scraperFactory = new ScraperFactory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const scraper = scraperFactory.getScraper(url);
      if (!scraper) {
        throw new Error('Ingen scraper fundet til denne URL');
      }

      const product = await scraper.scrapeProduct(url);
      setProduct(product);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der skete en fejl');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex flex-col gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Produkt Scraper
        </h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Indtast produkt URL"
              className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border 
                border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white 
                placeholder-gray-400 focus:outline-none focus:ring-1 
                focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white 
                rounded-lg transition-colors duration-200 font-medium 
                disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner />
                  <span>Henter...</span>
                </div>
              ) : (
                'Hent produkt'
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 dark:bg-red-900 
            dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {product && (
          <div className="mt-6">
            <ProductCard product={product} />
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <svg 
    className="animate-spin h-5 w-5 text-white" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    />
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);