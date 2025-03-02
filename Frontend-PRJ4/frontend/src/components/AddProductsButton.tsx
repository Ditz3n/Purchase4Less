import React from "react";
import { PlusIcon } from "@heroicons/react/20/solid";

interface AddProductsButtonProps {
  onClick: () => void;
}

const AddProductsButton: React.FC<AddProductsButtonProps> = ({ onClick }) => {
  return (
    <div className="mt-6">
      <button
        className="w-full p-2 text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-md hover:from-indigo-600 hover:to-purple-700"
        onClick={onClick}
      >
        <PlusIcon className="h-5 w-5 inline-block mr-2" />
        Tilføj produkter
      </button>
    </div>
  );
};

export default AddProductsButton;
