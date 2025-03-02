import React from "react";
import { PlusIcon } from "@heroicons/react/20/solid";

interface SidebarProps {
  shoppingLists: {
    shoppingListId: number;
    title: string;
  }[];
  selectedListId: number | null;
  shopperUsername: string;
  onListSelect: (shoppingListId: number, title: string) => void;
  onEditList: (listId: number, title: string) => void;
  onDeleteList: (listId: number, title: string) => void;
  onCreateList: () => void;
  editingListId: number | null;
  editingListTitle: string;
  setEditingListTitle: (title: string) => void;
  saveEditing: (listId: number) => void;
  cancelEditing: () => void;
}

const ShoppingListSidebar: React.FC<SidebarProps> = ({
  shoppingLists,
  selectedListId,
  shopperUsername,
  onListSelect,
  onEditList,
  onDeleteList,
  onCreateList,
  editingListId,
  editingListTitle,
  setEditingListTitle,
  saveEditing,
  cancelEditing,
}) => {
  return (
    <div className="w-1/3 p-5 border-r border-gray-600">
      <h1 className="text-4xl font-bold mb-5 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500">
        {shopperUsername}'s indkøbslister
      </h1>
      <ul className="space-y-3 max-h-[calc(8*4.2rem)] overflow-y-auto mt-4">
        {shoppingLists.map((list) => (
          <li
            key={list.shoppingListId}
            className={`p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md flex justify-between items-center ${
              selectedListId === list.shoppingListId
                ? "bg-gradient-to-r text-white from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500"
                : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            }`}
          >
            {editingListId === list.shoppingListId ? (
              <div className="flex items-center gap-1 w-full">
                <input
                  type="text"
                  value={editingListTitle}
                  onChange={(e) => setEditingListTitle(e.target.value)}
                  className="flex-1 max-w-[60%] px-1 py-1 text-sm border border-gray-300 rounded bg-gray-100 text-gray-900 dark:bg-gray-600 dark:text-white"
                />

                <button
                  onClick={() => saveEditing(list.shoppingListId)}
                  className="px-2 py-1 text-sm dark:bg-gray-800 text-white rounded"
                >
                  Gem
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-2 py-1 text-sm dark:bg-gray-800 text-white rounded"
                >
                  Annuller
                </button>
              </div>
            ) : (
              <div
                className="flex-1 cursor-pointer"
                onClick={() => onListSelect(list.shoppingListId, list.title)}
              >
                {list.title}
              </div>
            )}
            <div className="flex gap-2">
              {editingListId !== list.shoppingListId && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditList(list.shoppingListId, list.title);
                    }}
                    className={`px-2 py-1 shadow-md rounded ${
                      selectedListId === list.shoppingListId
                        ? "bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
                        : "text-white bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 hover:from-purple-600 hover:to-indigo-500 dark:hover:from-purple-500 dark:hover:to-indigo-400"
                    }`}
                  >
                    Rediger
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteList(list.shoppingListId, list.title);
                    }}
                    className={`px-2 py-1 shadow-md rounded ${
                      selectedListId === list.shoppingListId
                        ? "bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
                        : "text-white bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 hover:from-purple-600 hover:to-indigo-500 dark:hover:from-purple-500 dark:hover:to-indigo-400"
                    }`}
                  >
                    Slet
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      {shoppingLists.length === 0 && (
        <p className="text-md text-center mt-1 text-gray-600 dark:text-gray-300 leading-relaxed">
          Du har ingen indkøbslister i øjeblikket.
        </p>
      )}
      <div className="mt-6">
        <button
          className="w-full p-2 text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-md hover:from-indigo-600 hover:to-purple-700"
          onClick={onCreateList}
        >
          <PlusIcon className="h-5 w-5 inline-block mr-2" />
          Opret ny indkøbsliste
        </button>
      </div>
    </div>
  );
};

export default ShoppingListSidebar;
