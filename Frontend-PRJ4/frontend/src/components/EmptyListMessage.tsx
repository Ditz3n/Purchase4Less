import React from "react";
import { PlusIcon } from "@heroicons/react/20/solid";
import { useNavigate } from "react-router-dom";

interface EmptyListMessageProps {
  isEmptyList: boolean;
  onAddProducts: () => void;
}

const EmptyListMessage: React.FC<EmptyListMessageProps> = ({
  isEmptyList,
  onAddProducts,
}) => {
  const navigate = useNavigate();

  if (!isEmptyList) return null;

  return (
    <div>
      <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
        Denne indkøbsliste er tom.
      </p>
      <div className="mt-6">
        <button
          className="w-full p-2 text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-md hover:from-indigo-600 hover:to-purple-700"
          onClick={onAddProducts}
        >
          <PlusIcon className="h-5 w-5 inline-block mr-2" />
          Tilføj produkter
        </button>
      </div>
    </div>
  );
};

export default EmptyListMessage;
