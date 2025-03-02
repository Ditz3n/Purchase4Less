import React from "react";
import { PlusIcon, MinusIcon } from "@heroicons/react/20/solid";

interface Product {
  productId: number;
  name: string;
  quantity: number;
  prices: {
    productPrice: number;
    source: string;
  }[];
  uniqueItemIdentifier?: string;
  imageUrl?: string;
}

interface ProductListProps {
  products: Product[];
  sourceLogos: { [key: string]: string };
  editingQuantities: { [key: number]: number };
  updateProductQuantity: (productId: number, action: "increment" | "decrement") => void;
  handleQuantityChange: (productId: number, newQuantity: string) => void;
  saveQuantity: (productId: number) => void;
  setDeleteProductId: (productId: number | null) => void;
  setShowProductDeleteModal: (show: boolean) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  sourceLogos,
  editingQuantities,
  updateProductQuantity,
  handleQuantityChange,
  saveQuantity,
  setDeleteProductId,
  setShowProductDeleteModal,
}) => {
  if (products.length === 0) {
    return null;
  }

  const groupedProducts = products.reduce((grouped, product) => {
    const identifier = product.uniqueItemIdentifier || product.name || "Unknown Product";
    if (!grouped[identifier]) {
      grouped[identifier] = [];
    }
    grouped[identifier].push(product);
    return grouped;
  }, {} as Record<string, Product[]>);

  return (
    <ul className="space-y-3 mt-4 max-h-80 overflow-y-auto">
      {Object.entries(groupedProducts).map(([identifier, groupedProducts], index) => (
        <li
          key={index}
          className="p-1 rounded-md shadow-sm flex justify-between items-center transition-colors duration-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm"
        >
          <div className="flex items-center gap-4">
            {groupedProducts[0]?.imageUrl && (
              <img
                src={groupedProducts[1].imageUrl}
                alt={groupedProducts[0].name}
                className="w-16 h-16 object-contain"
              />
            )}
            <div>
              <h3 className="text-xl my-2 font-semibold">{groupedProducts[0]?.name}</h3>
              <div className="flex items-center space-x-4 mt-2">
                {groupedProducts.map((product) =>
                  product.prices.map((price, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <img
                        src={sourceLogos[price.source]}
                        alt={price.source}
                        className="w-6 h-6"
                      />
                      <span>{price.productPrice.toFixed(2)} kr</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateProductQuantity(groupedProducts[0].productId, "decrement")}
              className="px-3 py-1 text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-400 rounded"
            >
              <MinusIcon className="h-5 w-5" />
            </button>
            <input
              type="text"
              value={
                editingQuantities[groupedProducts[0].productId] ??
                groupedProducts[0].quantity
              }
              onChange={(e) =>
                handleQuantityChange(groupedProducts[0].productId, e.target.value)
              }
              onBlur={() => saveQuantity(groupedProducts[0].productId)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveQuantity(groupedProducts[0].productId);
              }}
              className="mx-2 text-xl w-12 text-center bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white border border-gray-500 rounded"
            />
            <button
              onClick={() => updateProductQuantity(groupedProducts[0].productId, "increment")}
              className="px-3 py-1 text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-400 rounded"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                setShowProductDeleteModal(true);
                setDeleteProductId(groupedProducts[0].productId);
              }}
              className="ml-2 px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              Fjern
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ProductList;
