import React, { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';

interface Product {
  productId: number;
  name: string;
  imageUrl: string;
  brand: string;
  prices: { productPrice: number }[];
}

interface ShoppingList {
  shoppingListId: number;
  title: string;
}

const ProductOverviewPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/Products');
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Fetched products:', data);
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    const fetchShoppingLists = async () => {
      const dummyLogin = localStorage.getItem('dummyLogin');
      const shopperId = dummyLogin === 'true' ? localStorage.getItem('dummyShopperId') : user?.id;

      if (!shopperId) return;

      try {
        const token = dummyLogin === 'true' ? null : await getToken();
        const response = await fetch(`http://localhost:5000/api/ShoppingList/shopper/${shopperId}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch shopping lists: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Fetched shopping lists:', data);
        setShoppingLists(data);
      } catch (err) {
        console.error('Error fetching shopping lists:', err);
        setShoppingLists([]);
      }
    };

    fetchProducts();
    fetchShoppingLists();
  }, [user, getToken]);

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const addProductToList = async (listId: number) => {
    if (!selectedProduct) return;
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:5000/api/ShoppingListProduct', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shoppingListId: listId,
          productId: selectedProduct.productId,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to add product to list');
      }
      console.log('Product added to list');
      closeModal();
    } catch (err) {
      console.error('Error adding product to list:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-12 px-4 sm:px-6 lg:px-8 w-full">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 break-words">
            Produktoversigt
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Her kan du se en oversigt over produkter, som du kan tilføje til dine indkøbslister.
          </p>
        </div>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full">
          {products.map((product) => (
            <div key={product.productId} className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4">
              <img
                src={product.imageUrl || 'https://via.placeholder.com/150'}
                alt={product.name}
                className="w-full h-40 object-contain mb-4"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://via.placeholder.com/150';
                }}
              />
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{product.brand}</p>
              <p className="font-bold text-lg">{product.prices[0]?.productPrice || 'N/A'} DKK</p>
              <button
                onClick={() => openModal(product)}
                className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
              >
                Tilføj til liste
              </button>
            </div>
          ))}
        </div>
      )}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Tilføj {selectedProduct.name} til en liste</h2>
            {shoppingLists.length > 0 ? (
              shoppingLists.map((list) => (
                <button
                  key={list.shoppingListId}
                  onClick={() => addProductToList(list.shoppingListId)}
                  className="block w-full text-left bg-indigo-500 text-white px-4 py-2 my-2 rounded hover:bg-indigo-600"
                >
                  {list.title}
                </button>
              ))
            ) : (
              <p className="text-red-500">Ingen indkøbslister fundet</p>
            )}
            <button
              onClick={closeModal}
              className="mt-4 w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Annuller
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductOverviewPage;