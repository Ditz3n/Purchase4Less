interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  brand: string;
  store: string;
  description?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg mb-4 hover:shadow-xl transition-all duration-300">
      <div className="relative w-full h-48 mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = 'https://via.placeholder.com/400x400?text=Billede+ikke+tilgængeligt';
          }}
        />
      </div>

      {/* Butik og brand sektion */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
          {product.store}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {product.brand}
        </p>
      </div>

      {/* Produkt navn */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {product.name}
      </h2>

      {/* Pris og knap sektion */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {product.price.toFixed(2)} kr
        </span>
        
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 
          text-white rounded-lg transition-colors duration-200">
          Tilføj til liste
        </button>
      </div>

      {/* Beskrivelse hvis tilgængelig */}
      {product.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {product.description}
        </p>
      )}
    </div>
  );
};

export default ProductCard; 