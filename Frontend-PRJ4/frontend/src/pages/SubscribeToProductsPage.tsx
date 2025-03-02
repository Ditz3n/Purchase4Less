import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import MapsVisual from '../components/mapsVisual';
import { useUser } from '@clerk/clerk-react';

interface Product {
  productId: number;
  name: string;
  prices: { priceId: number; productPrice: number }[]; // Adjust based on your API response
}

const SubscribeToProductsPage: React.FC = () => {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isValidProduct, setIsValidProduct] = useState(false);
  const [selectedProductPrice, setSelectedProductPrice] = useState<number | null>(null);
  const [isValidPrice, setIsValidPrice] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Fetch products from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        if (response.ok) {
          const data: Product[] = await response.json();
          setProducts(data);
        } else {
          console.error('Failed to fetch products:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(results);
      setShowDropdown(true);
    } else {
      setFilteredProducts([]);
      setShowDropdown(false);
    }
  }, [searchQuery, products]);

  const validateProduct = (productName: string) => {
    const foundProduct = filteredProducts.find(
      (p) => p.name.toLowerCase() === productName.toLowerCase()
    );
    setIsValidProduct(!!foundProduct);
    return !!foundProduct;
  };

  const validatePrice = (price: string) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0 || (selectedProductPrice && numPrice >= selectedProductPrice)) {
      setIsValidPrice(false);
      return false;
    }
    setIsValidPrice(true);
    return true;
  };

  const handleLocationChange = (lat: number, lng: number) => {
    console.log(`Nye koordinater: ${lat}, ${lng}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500">
            Abonner på produkter
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Søg efter produkter, du er interesseret i, og abonner for at modtage beskeder om prisændringer og særlige tilbud for at holde dig opdateret om de bedste tilbud.
          </p>
        </div>

        <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl shadow-xl p-8 backdrop-blur-lg backdrop-filter">
          <div className="relative">
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="flex-grow relative">
                <label htmlFor="productSearch" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Navn på produkt
                </label>
                <div className="relative">
                  <input
                    id="productSearch"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      validateProduct(e.target.value);

                      if (e.target.value.trim() === '') {
                        setTargetPrice('');
                        setSelectedProductPrice(null);
                        setIsValidPrice(false);
                      }
                    }}
                    placeholder="Indtast produktets navn..."
                    className="w-full p-3 pr-10 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                  {searchQuery && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isValidProduct ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {showDropdown && filteredProducts.length > 0 && (
                  <div className="absolute w-full bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 mt-1">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.productId}
                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center"
                        onClick={() => {
                          const targetPrice = (Math.floor(product.prices[0]?.productPrice || 0) - 1).toString();

                          setSearchQuery(product.name);
                          setSelectedProductPrice(product.prices[0]?.productPrice || null);
                          setTargetPrice(targetPrice);
                          setShowDropdown(false);

                          setTimeout(() => {
                            validateProduct(product.name);
                            validatePrice(targetPrice);
                          }, 0);
                        }}
                      >
                        <span className="flex-1 mr-4 text-gray-900 dark:text-gray-100">{product.name}</span>
                        <span className="text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          DKK {product.prices[0]?.productPrice.toFixed(2) || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-36">
                <label htmlFor="targetPrice" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Mindste pris
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    DKK
                  </span>
                  <input
                    id="targetPrice"
                    type="number"
                    value={targetPrice}
                    onChange={(e) => {
                      setTargetPrice(e.target.value);
                      validatePrice(e.target.value);
                    }}
                    placeholder="0.00"
                    className={`w-full p-3 pl-12 pr-10 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700
                      ${targetPrice && !isValidPrice ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'}
                      text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 
                      focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
                  />
                  {targetPrice && (
                    <div className="absolute left-28 top-1/2 transform -translate-y-1/2">
                      {isValidPrice ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              disabled={!isValidProduct || !isValidPrice}
              onClick={() => setShowModal(true)}
              className={`w-full p-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-1xl transform hover:-translate-y-0.5 font-semibold
                ${(isValidProduct && isValidPrice)
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 text-white cursor-pointer'
                  : 'bg-gray-400 dark:bg-gray-600 text-gray-200 cursor-not-allowed'}`}
            >
              Hold mig opdateret!
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)} // Close when clicking outside
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Bekræft abonnement
            </h2>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowModal(false)} // Cancel button
                className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors font-medium"
              >
                Annuller
              </button>
              <button
                onClick={async () => {
                  try {
                    const productId = products.find((p) => p.name === searchQuery)?.productId;

                    // Ensure ProductId and TargetPrice are valid
                    if (!productId || !targetPrice) {
                      console.error('Invalid product or price');
                      return;
                    }

                    const payload = {
                      userId: user?.id,
                      productId: productId,
                      targetPrice: parseFloat(targetPrice),
                    };

                    console.log('Payload:', payload);

                    const response = await fetch('http://localhost:5000/api/subscription', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(payload),
                    });

                    if (response.ok) {
                      console.log('Subscription successful');
                      setShowModal(false); // Close modal after success
                    } else {
                      console.error('Error subscribing:', await response.text());
                    }
                  } catch (error) {
                    console.error('Network error:', error);
                  }
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-colors font-medium"
              >
                Bekræft
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mt-10">
        <h1 className="p-2 mb-4 text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500">
          Filtrer butikker nær dig
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Filtrer butikker nær dig for at finde de bedste tilbud i dit område og spar tid ved kun at se relevante resultater, så du ikke behøves handle langt væk fra dit hjem.
        </p>
      </div>

      <div className="w-full max-w-3xl mt-12 bg-gray-100 dark:bg-gray-700 rounded-2xl shadow-xl p-8 backdrop-blur-lg backdrop-filter">
        <MapsVisual
          apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}
          onLocationChange={handleLocationChange}
        />
      </div>
    </div>
  );
};

export default SubscribeToProductsPage;