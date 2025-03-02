import { IProduct } from "../../../Interfaces/IScrapedProduct";

interface ProductCardProps {
  product: IProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  console.log("Product data received:", product);
  console.log("Image URL:", product.image);

  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden p-5 pb-10">
      <div className="flex flex-col md:flex-row">
        {/* Billede sektion */}
        <div className="w-full md:w-[10em] h-[10em]">
          {product.image ? (
            <>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error("Failed to load image:", product.image);
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://via.placeholder.com/400x400?text=Billede+ikke+tilgængeligt';
                }}
              />
              <a href={product.image} target="_blank" rel="noopener noreferrer" className="text-xs underline text-gray-500 hover:text-blue-500">Image URL</a>
            </>
          ) : (
            <div className="w-full h-48 md:h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">
                Intet billede
              </span>
            </div>
          )}
        </div>

        {/* Produkt information */}
        <div className="p-6 w-full md:w-2/3">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {product.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {product.brand}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {product.price.toFixed(2)} kr
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {product.store}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};