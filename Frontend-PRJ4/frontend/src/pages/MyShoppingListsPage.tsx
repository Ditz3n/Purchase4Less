import React, { useEffect, useState, useCallback } from "react";
import bilkaLogo from "../assets/bilka_logo.png";
import rema_1000_logo from "../assets/Rema_1000_logo.png";
import sparlogo from "../assets/spar_logo.png";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useToast } from "../hooks/use-toast";
import { Toaster } from "../components/ui/toaster";
import ShoppingListSidebar from "../components/ShoppingListSidebar";
import ShoppingListDetails from "../components/ShoppingListDetails";
import Modal from "../components/Modal";

interface ShoppingList {
  shoppingListId: number;
  title: string;
}

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

const sourceLogos: { [key: string]: string } = {
  Bilka: bilkaLogo,
  SPAR: sparlogo,
  "Rema 1000": rema_1000_logo,
};

const MyShoppingListsPage: React.FC = () => {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [selectedListTitle, setSelectedListTitle] = useState<string>("");
  const [shopperUsername, setShopperUsername] = useState<string>("");
  const [totalPrices, setTotalPrices] = useState<TotalPrice[]>([]);
  const [isEmptyList, setIsEmptyList] = useState(false);
  const [editingQuantities, setEditingQuantities] = useState<{
    [key: number]: number;
  }>({});
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteListId, setDeleteListId] = useState<number | null>(null);
  const [deleteListTitle, setDeleteListTitle] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [showTitleError, setShowTitleError] = useState(false);
  const [showProductDeleteModal, setShowProductDeleteModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [editingListId, setEditingListId] = useState<number | null>(null);
  const [editingListTitle, setEditingListTitle] = useState<string>("");

  const { user } = useUser(); // Get the logged-in user from Clerk
  const { getToken } = useAuth(); // Use Clerk's method to get the token
  const { toast } = useToast();

  const fetchShoppingLists = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await fetch("http://localhost:5000/api/ShoppingList", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Kunne ikke hente indkøbslister");
      }
      const data = await response.json();
      setShoppingLists(data);
    } catch (error) {
      console.error("Fejl ved hentning af indkøbslister:", error);
    }
  }, [getToken]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const response = await fetch(
            `http://localhost:5000/api/shopper/${user.id}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }
          const data = await response.json();
          setShopperUsername(data.username);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        // Check for dummy login
        const dummyUsername = localStorage.getItem("dummyUsername");
        if (dummyUsername) {
          setShopperUsername(dummyUsername);
        }
      }
    };

    fetchUserData();
    fetchShoppingLists();
  }, [user, fetchShoppingLists]);

  useEffect(() => {
    const fetchTotalPrices = async () => {
      if (!selectedListId) return;

      try {
        const response = await fetch(
          `http://localhost:5000/api/ShoppingListProduct/totalPrices/${selectedListId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch total prices");
        }
        const data = await response.json();
        setTotalPrices(data);
      } catch (error) {
        console.error("Error fetching total prices:", error);
      }
    };

    if (products.length > 0) {
      fetchTotalPrices();
    } else {
      setTotalPrices([]);
    }
  }, [selectedListId, products]);

  const fetchProductsInShoppingList = async (
    shoppingListId: number,
    listTitle: string
  ) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/ShoppingListProduct/${shoppingListId}`
      );
      if (!response.ok) {
        throw new Error(
          "Kunne ikke hente produkter for den valgte indkøbsliste"
        );
      }
      const data = await response.json();
      console.log("Products in shopping list:", data);
      setProducts(data);
      setSelectedListId(shoppingListId);
      setSelectedListTitle(listTitle);
      setIsEmptyList(data.length === 0);
    } catch (error) {
      console.error(error);
    }
  };

  const updateProductQuantity = async (
    productId: number,
    action: "increment" | "decrement"
  ) => {
    if (selectedListId === null) return;

    try {
      const product = products.find((p) => p.productId === productId);
      if (!product) return;

      if (action === "increment" && product.quantity >= 100) {
        setModalMessage("Du kan ikke tilføje mere end 100 af dette produkt.");
        setShowModal(true);
        setTimeout(() => setShowModal(false), 1500); // Show modal for 1.5 seconds
        return;
      }

      if (action === "decrement" && product.quantity === 1) {
        setDeleteProductId(productId);
        setShowProductDeleteModal(true);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/ShoppingListProduct/${action}?sId=${selectedListId}&pId=${productId}`,
        { method: "PUT" }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${action} product quantity`);
      }

      setProducts((prevProducts) =>
        prevProducts
          .map((product) =>
            product.productId === productId
              ? {
                  ...product,
                  quantity:
                    action === "increment"
                      ? product.quantity + 1
                      : product.quantity - 1,
                }
              : product
          )
          .filter((product) => product.quantity > 0)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const saveQuantity = async (productId: number) => {
    if (selectedListId === null) return;

    const newQuantity = editingQuantities[productId];
    if (newQuantity === undefined) return;

    if (newQuantity > 100) {
      setModalMessage("Antallet kan ikke være højere end 100.");
      setShowModal(true);
      setTimeout(() => setShowModal(false), 1500); // Show modal for 1.5 seconds
      return;
    }

    try {
      if (newQuantity === 0) {
        setDeleteProductId(productId);
        setShowProductDeleteModal(true);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/ShoppingListProduct/updateQuantity?sId=${selectedListId}&pId=${productId}&newQuantity=${newQuantity}`,
        { method: "PUT" }
      );

      if (!response.ok) {
        throw new Error("Failed to update product quantity");
      }

      setProducts((prevProducts) =>
        prevProducts
          .map((product) =>
            product.productId === productId
              ? { ...product, quantity: newQuantity }
              : product
          )
          .filter((product) => product.quantity > 0)
      );

      setEditingQuantities((prev) => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleQuantityChange = (productId: number, newQuantity: string) => {
    const numericValue = parseInt(newQuantity, 10);
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 100) {
      setEditingQuantities((prev) => ({ ...prev, [productId]: numericValue }));
    }
  };

  const deleteProduct = async (productId: number) => {
    if (selectedListId === null) return;

    try {
      // Find det produkt der skal slettes
      const productToDelete = products.find((p) => p.productId === productId);
      if (!productToDelete) return;

      // Find alle produkter med samme uniqueItemIdentifier
      const productsToDelete = products.filter(
        (p) => p.uniqueItemIdentifier === productToDelete.uniqueItemIdentifier
      );

      // Slet alle produkter med samme identifier
      for (const product of productsToDelete) {
        const response = await fetch(
          `http://localhost:5000/api/ShoppingListProduct?sId=${selectedListId}&pId=${product.productId}`,
          { method: "DELETE" }
        );

        if (!response.ok) {
          throw new Error("Kunne ikke fjerne produktet");
        }
      }

      // Opdater products state ved at fjerne alle produkter med samme identifier
      const updatedProducts = products.filter(
        (p) => p.uniqueItemIdentifier !== productToDelete.uniqueItemIdentifier
      );
      setProducts(updatedProducts);
      setIsEmptyList(updatedProducts.length === 0);
      setShowProductDeleteModal(false);

      // Vis success besked
      setSuccessMessage(`"${productToDelete.name}" blev fjernet fra listen`);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 1500);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteList = async () => {
    if (deleteListId === null) return;

    try {
      const token = await getToken();
      const response = await fetch(
        `http://localhost:5000/api/ShoppingList/${deleteListId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Kunne ikke slette indkøbslisten");
      }

      // Remove the deleted shopping list from the state
      setShoppingLists((prevLists) =>
        prevLists.filter((list) => list.shoppingListId !== deleteListId)
      );

      // Reset the selected list and its content
      if (selectedListId === deleteListId) {
        setSelectedListId(null);
        setSelectedListTitle("");
        setProducts([]);
      }

      toast({
        variant: "destructive",
        title: "Liste slettet",
        description: `Indkøbslisten "${deleteListTitle}" blev slettet!`,
      });
      setShowDeleteModal(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fejl",
        description: "Kunne ikke slette indkøbslisten",
      });
    }
  };

  const confirmDeleteShoppingList = (shoppingListId: number, title: string) => {
    setDeleteListId(shoppingListId);
    setDeleteListTitle(title);
    setShowDeleteModal(true);
  };

  const handleCreateList = async () => {
    if (!newListTitle) {
      toast({
        variant: "destructive",
        title: "Fejl",
        description: "Indtast en titel til indkøbslisten.",
      });
      return;
    }

    const dummyLogin = localStorage.getItem("dummyLogin");
    const shopperId =
      dummyLogin === "true" ? localStorage.getItem("dummyShopperId") : user?.id;

    if (!shopperId) {
      alert("Ingen brugerdata tilgængelig.");
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch("http://localhost:5000/api/ShoppingList", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newListTitle,
          shopperId,
          date: new Date().toISOString(),
          shoppingList_Products: [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Fejl",
          description:
            errorData.message ||
            "Der opstod en fejl under oprettelsen af indkøbslisten.",
        });
      } else {
        toast({
          variant: "success",
          title: "Liste oprettet!",
          description: `Indkøbslisten "${newListTitle}" blev oprettet!`,
        });
        setNewListTitle("");
        setShowTitleError(false);
        fetchShoppingLists();
        setShowCreateModal(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fejl",
        description: "Der opstod en fejl under oprettelsen af indkøbslisten.",
      });
    }
  };

  const startEditing = (listId: number, currentTitle: string) => {
    setEditingListId(listId);
    setEditingListTitle(currentTitle);
  };

  const cancelEditing = () => {
    setEditingListId(null);
    setEditingListTitle("");
  };

  const saveEditing = async (listId: number) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/ShoppingList/${listId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: editingListTitle }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update shopping list title");
      }

      setShoppingLists((prev) =>
        prev.map((list) =>
          list.shoppingListId === listId
            ? { ...list, title: editingListTitle }
            : list
        )
      );
      cancelEditing();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
      <div className="flex flex-row flex-1">
        {/* Sidebar for Shopping Lists */}
        <ShoppingListSidebar
          shoppingLists={shoppingLists}
          selectedListId={selectedListId}
          shopperUsername={shopperUsername}
          onListSelect={fetchProductsInShoppingList}
          onEditList={startEditing}
          onDeleteList={confirmDeleteShoppingList}
          onCreateList={() => setShowCreateModal(true)}
          editingListId={editingListId}
          editingListTitle={editingListTitle}
          setEditingListTitle={setEditingListTitle}
          saveEditing={saveEditing}
          cancelEditing={cancelEditing}
        />

        {/* Main Content for Products */}
        <ShoppingListDetails
          selectedListTitle={selectedListTitle}
          selectedListId={selectedListId}
          isEmptyList={isEmptyList}
          products={products}
          totalPrices={totalPrices}
          sourceLogos={sourceLogos}
          editingQuantities={editingQuantities}
          updateProductQuantity={updateProductQuantity}
          handleQuantityChange={handleQuantityChange}
          saveQuantity={saveQuantity}
          setDeleteProductId={setDeleteProductId}
          setShowProductDeleteModal={setShowProductDeleteModal}
        />
      </div>
      {/* Modal for Success */}
      <Modal
        isVisible={showModal}
        message={modalMessage}
        onClose={() => setShowModal(false)}
      />
      <div
        className={`fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${
          showDeleteModal ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-lg text-center">
          <p className="text-lg text-gray-900 dark:text-white">
            Er du sikker på, at du vil slette indkøbslisten "{deleteListTitle}"?
          </p>
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleDeleteList}
              className="mr-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded"
            >
              Bekræft
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="ml-2 px-4 py-2 bg-gray-600 text-white rounded"
            >
              Annuller
            </button>
          </div>
        </div>
      </div>

      <div
        className={`fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-500 ease-in-out ${
          showCreateModal ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-lg shadow-lg transition-transform duration-500 ease-in-out transform scale-105 relative w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3 min-h-[160px]">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500">
            Opret ny indkøbsliste
          </h2>
          <input
            type="text"
            placeholder="Indtast navn for indkøbsliste..."
            value={newListTitle}
            onChange={(e) => {
              if (e.target.value.length <= 16) {
                setNewListTitle(e.target.value);
                setShowTitleError(false);
              } else {
                setShowTitleError(true);
              }
            }}
            className="w-full mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-transform duration-200 ease-in-out transform focus:scale-105"
          />
          {showTitleError && (
            <div className="absolute top-[-3.2rem] left-1/2 transform -translate-x-1/2 mt-2 p-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 text-white rounded shadow-md text-sm sm:text-base sm:top-[-3.3rem] sm:mt-2 sm:p-1.5">
              Max 16 tegn
            </div>
          )}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-200"
            >
              Annuller
            </button>
            <button
              onClick={handleCreateList}
              className="px-4 py-2 shadow-md text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded hover:from-purple-600 hover:to-indigo-500 transition duration-200"
            >
              Opret
            </button>
          </div>
        </div>
      </div>
      <Modal
        isVisible={showProductDeleteModal}
        title="Bekræft fjernelse"
        message="Er du sikker på, at du vil fjerne dette produkt fra indkøbslisten?"
        onClose={() => setShowProductDeleteModal(false)}
      >
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => {
              if (deleteProductId !== null) {
                deleteProduct(deleteProductId);
              }
            }}
            className="mr-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded"
          >
            Bekræft
          </button>
          <button
            onClick={() => setShowProductDeleteModal(false)}
            className="ml-2 px-4 py-2 bg-gray-600 text-white rounded"
          >
            Annuller
          </button>
        </div>
      </Modal>

      <Modal
        isVisible={showSuccessModal}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />

      <Toaster />
    </div>
  );
};

export default MyShoppingListsPage;
