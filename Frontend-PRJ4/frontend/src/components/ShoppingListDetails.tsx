import React from "react";
import { PlusIcon, MinusIcon } from "@heroicons/react/20/solid";
import { useNavigate } from "react-router-dom";
import TotalPrices from "../components/TotalPrices";
import ProductList from "../components/ProductList";
import EmptyListMessage from "../components/EmptyListMessage";
import AddProductsButton from "../components/AddProductsButton";

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

interface TotalPrice {
  source: string;
  total: number;
}

interface ShoppingListDetailsProps {
  selectedListTitle: string;
  selectedListId: number | null;
  isEmptyList: boolean;
  products: Product[];
  totalPrices: TotalPrice[];
  sourceLogos: { [key: string]: string };
  editingQuantities: { [key: number]: number };
  updateProductQuantity: (
    productId: number,
    action: "increment" | "decrement"
  ) => void;
  handleQuantityChange: (productId: number, newQuantity: string) => void;
  saveQuantity: (productId: number) => void;
  setDeleteProductId: (productId: number | null) => void;
  setShowProductDeleteModal: (show: boolean) => void;
}

const ShoppingListDetails: React.FC<ShoppingListDetailsProps> = ({
  selectedListTitle,
  selectedListId,
  isEmptyList,
  products,
  totalPrices,
  sourceLogos,
  editingQuantities,
  updateProductQuantity,
  handleQuantityChange,
  saveQuantity,
  setDeleteProductId,
  setShowProductDeleteModal,
}) => {
  const navigate = useNavigate();

  if (!selectedListId) return null;

  return (
    <div className="w-2/3 p-5">
      <h2 className="text-3xl font-bold mb-5 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500">
        {selectedListTitle}
      </h2>
      {isEmptyList ? (
        <EmptyListMessage
          isEmptyList={isEmptyList}
          onAddProducts={() => navigate("/soeg-produkt")}
        />
      ) : (
        <>
          {/*ProductList component*/}
          <ProductList
            products={products}
            sourceLogos={sourceLogos}
            editingQuantities={editingQuantities}
            updateProductQuantity={updateProductQuantity}
            handleQuantityChange={handleQuantityChange}
            saveQuantity={saveQuantity}
            setDeleteProductId={setDeleteProductId}
            setShowProductDeleteModal={setShowProductDeleteModal}
          />

          <AddProductsButton onClick={() => navigate("/soeg-produkt")} />

          {/*TotalPrices component*/}
          <TotalPrices totalPrices={totalPrices} sourceLogos={sourceLogos} />
        </>
      )}
    </div>
  );
};

export default ShoppingListDetails;
