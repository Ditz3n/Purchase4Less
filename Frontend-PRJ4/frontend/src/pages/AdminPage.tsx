import React, { useEffect, useState, useCallback } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { useStoreContext } from "../components/StoreContext";
import { useUser } from "@clerk/clerk-react";
import ReseedButton from "../components/ReseedButton";
import ChartComponent from "../components/ChartComponent";
import QuoteComponent from "../components/QuoteComponent";
import StoreComparisonChart from "../components/StoreComparisonChart";
import PopularProductsChart from "../components/PopularProductsChart";
import SystemStatusComponent from "../components/SystemStatusComponent";
import { useToast } from "../hooks/use-toast";
import { Toaster } from "../components/ui/toaster";

interface Shopper {
  shopperId: string;
  username: string;
  email: string;
  role: string;
}

const AdminPage: React.FC = () => {
  const { user } = useUser();
  const [listCount, setListCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [shoppers, setShoppers] = useState<Shopper[]>([]);
  const [loadingLists, setLoadingLists] = useState<boolean>(true);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [newShopper, setNewShopper] = useState({ username: "", email: "" });
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [shopperToDelete, setShopperToDelete] = useState<Shopper | null>(null);
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [shopperToUpdateRole, setShopperToUpdateRole] =
    useState<Shopper | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [selectedShoppers, setSelectedShoppers] = useState<string[]>([]);

  //change when data implemented
  const [storeStatus, setStoreStatus] = useState<Record<string, boolean>>({
    Bilka: true,
    Netto: true,
    Foetex: true,
  });

  const [storeData, setStoreData] = useState<Record<string, number>>({});
  const [loadingStoreData, setLoadingStoreData] = useState(true);
  const [loadingProductData, setLoadingProductData] = useState(true);
  const [productData, setProductData] = useState<Record<string, number>>({});

  const [popularProducts, setPopularProducts] = useState<
    Record<string, number>
  >({});
  const [loadingPopularProducts, setLoadingPopularProducts] = useState(true);

  const { toast } = useToast();

  const fetchShoppers = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/shopper/all");
      if (!response.ok) {
        throw new Error(`Failed to fetch shoppers: ${await response.text()}`);
      }
      const data = await response.json();
      setShoppers(data);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fejl ved indlæsning",
        description: "Kunne ikke hente brugerlisten. Prøv igen senere.",
      });
    }
  }, []);

  useEffect(() => {
    fetchShoppers();
  }, [fetchShoppers]);

  useEffect(() => {
    fetchListCount();
    fetchUserCount();
    fetchStorePrices();
    fetchPopularProducts();
  }, []);

  const fetchListCount = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/ShoppingList/count"
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch shopping list count: ${errorText}`);
      }
      const count = await response.json();
      setListCount(count);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingLists(false);
    }
  };

  const fetchUserCount = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/shopper/count");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch user count: ${errorText}`);
      }
      const count = await response.json();
      setUserCount(count);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchStorePrices = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/products/store-price-comparison"
      );
      if (!response.ok) {
        throw new Error("Kunne ikke hente butikspriser");
      }
      const data = await response.json();
      console.log("Store Price Comparison Data:", data);
      setStoreData(data);
    } catch (error) {
      console.error("Fejl ved hentning af butikspriser:", error);
    } finally {
      setLoadingStoreData(false);
    }
  };

  const fetchPopularProducts = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/products/popular"
      );
      if (!response.ok) {
        throw new Error("Kunne ikke hente populære produkter");
      }
      const data = await response.json();
      console.log("Popular Products Data:", data);
      setPopularProducts(data);
    } catch (error) {
      console.error("Fejl ved hentning af populære produkter:", error);
    } finally {
      setLoadingPopularProducts(false);
    }
  };

  const handleDeleteClick = (shopper: Shopper) => {
    setShopperToDelete(shopper);
    setConfirmDelete(true);
  };

  const confirmDeleteShopper = async () => {
    if (shopperToDelete) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/shopper/${shopperToDelete.shopperId}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to delete shopper: ${errorText}`);
        }
        setShoppers(
          shoppers.filter(
            (shopper) => shopper.shopperId !== shopperToDelete.shopperId
          )
        );
        setConfirmDelete(false);
        setShopperToDelete(null);
        await fetchUserCount(); // Update user count
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewShopper({ ...newShopper, [name]: value });
  };

  const generateShopperId = (): string => {
    const randomString =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    return `user_${randomString}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Create a new shopper object using the Shopper interface
    const newShopperEntry: Shopper = {
      shopperId: generateShopperId(), // Generate the ID
      username: newShopper.username,
      email: newShopper.email,
      role: "User", // Default role; update if needed
    };

    try {
      const response = await fetch(
        "http://localhost:5000/api/shopper/createshopper",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newShopperEntry),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create shopper: ${errorText}`);
      }

      const createdShopper = await response.json();
      setShoppers([...shoppers, createdShopper]);
      setNewShopper({ username: "", email: "" });
      await fetchUserCount(); // Update user count
      toast({
        title: "Bruger oprettet",
        description: `Dummy bruger ${newShopper.username} blev oprettet succesfuldt.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Fejl ved oprettelse",
        description: "Kunne ikke oprette dummy bruger.",
      });
    }
  };

  const toggleStore = async (store: string) => {
    try {
      setStoreStatus(prev => ({
        ...prev,
        [store]: !prev[store]
      }));
      toast({
        title: "Butiksstatus opdateret",
        description: `${store} er nu ${storeStatus[store] ? 'aktiv' : 'inaktiv'}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fejl ved opdatering",
        description: `Kunne ikke opdatere status for ${store}.`,
      });
    }
  };

  const handleUpdateRoleClick = (shopper: Shopper) => {
    setShopperToUpdateRole(shopper);
    setNewRole(shopper.role);
    setShowRoleModal(true);
  };

  const confirmUpdateRole = async () => {
    if (shopperToUpdateRole) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/shopper/updaterole?shopperId=${shopperToUpdateRole.shopperId}&role=${newRole}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to update role: ${await response.text()}`);
        }

        setShoppers(
          shoppers.map((shopper) =>
            shopper.shopperId === shopperToUpdateRole.shopperId
              ? { ...shopper, role: newRole }
              : shopper
          )
        );
        setShowRoleModal(false);
        setShopperToUpdateRole(null);

        toast({
          title: "Rolle opdateret",
          description: `${shopperToUpdateRole?.username}'s rolle blev opdateret til ${newRole}`,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Fejl ved opdatering",
          description: "Kunne ikke opdatere brugerens rolle.",
        });
      }
    }
  };

  const currentUserId = user?.id || localStorage.getItem("dummyShopperId");

  const fetchStoreData = async () => {
    setLoadingStoreData(true);
    try {
      // Din eksisterende fetch logik for butiks data
      const response = await fetch("...");
      const data = await response.json();
      setStoreData(data);
    } catch (error) {
      console.error("Fejl ved hentning af butiksdata:", error);
    } finally {
      setLoadingStoreData(false);
    }
  };

  const fetchProductData = async () => {
    setLoadingProductData(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/products/popular"
      );
      if (!response.ok) {
        throw new Error("Kunne ikke hente populære produkter");
      }
      const data = await response.json();
      setProductData(data);
    } catch (error) {
      console.error("Fejl ved hentning af produktdata:", error);
    } finally {
      setLoadingProductData(false);
    }
  };

  const filteredShoppers = shoppers
    .filter(
      (shopper) =>
        shopper.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shopper.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((shopper) => filterRole === "all" || shopper.role === filterRole);

  const handleSelectShopper = (shopperId: string) => {
    setSelectedShoppers((prev) =>
      prev.includes(shopperId)
        ? prev.filter((id) => id !== shopperId)
        : [...prev, shopperId]
    );
  };

  const handleBulkDelete = async () => {
    if (
      window.confirm(
        `Er du sikker på, at du vil slette ${selectedShoppers.length} brugere?`
      )
    ) {
      try {
        for (const shopperId of selectedShoppers) {
          await fetch(`http://localhost:5000/api/shopper/${shopperId}`, {
            method: "DELETE",
          });
        }
        setShoppers((prev) =>
          prev.filter(
            (shopper) => !selectedShoppers.includes(shopper.shopperId)
          )
        );
        setSelectedShoppers([]);
        await fetchUserCount();

        toast({
          title: "Brugere slettet",
          description: `${selectedShoppers.length} bruger(e) blev slettet succesfuldt.`,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Fejl ved sletning",
          description: "Der opstod en fejl under sletning af brugere.",
        });
      }
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Administrer brugere og se systemstatistik
          </p>
        </div>

        {/* Grid Layout for Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Statistics Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              System Statistik
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Totale indkøbslister
                </p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {loadingLists ? "Indlæser..." : listCount}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Aktive brugere
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {loadingUsers ? "Indlæser..." : userCount}
                </p>
              </div>
            </div>
          </div>

          {/* Chart Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <ChartComponent
              listCount={listCount}
              userCount={userCount}
              isLoading={loadingLists || loadingUsers}
            />
          </div>

          {/* Store Control Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Butik Status
            </h2>
            <div className="space-y-3">
              {["Bilka", "Netto", "Føtex"].map((store) => (
                <button
                  key={store}
                  onClick={() => toggleStore(store)}
                  className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-all ${
                    storeStatus[store]
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                      : "bg-gray-400 hover:bg-gray-500"
                  }`}
                >
                  {store} - {storeStatus[store] ? "Aktiv" : "Inaktiv"}
                </button>
              ))}
            </div>
          </div>

          {/* User Management Panel - Spans 3 columns */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Brugeradministration
              </h2>

              {/* Søge og filter sektion */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Søg efter brugere..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>

                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Alle roller</option>
                  <option value="User">Bruger</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedShoppers.length > 0 && (
              <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-700 dark:text-indigo-300">
                    {selectedShoppers.length} bruger(e) valgt
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Slet valgte
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Opdateret brugerliste med checkboxes */}
            <div className="overflow-hidden">
              <ul className="max-h-96 overflow-y-auto space-y-2">
                {filteredShoppers.map((shopper) => (
                  <li
                    key={shopper.shopperId}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedShoppers.includes(shopper.shopperId)}
                        onChange={() => handleSelectShopper(shopper.shopperId)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {shopper.username}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {shopper.email}
                        </span>
                        <span className="text-sm px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                          {shopper.role}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateRoleClick(shopper)}
                        className="p-2 text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(shopper)}
                        disabled={shopper.shopperId === currentUserId}
                        className={`p-2 ${
                          shopper.shopperId === currentUserId
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        }`}
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Row - Each panel spans 1 column on large screens, full width on smaller screens */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Opret Dummy-bruger
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Her kan du oprette en dummy-bruger til testformål.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="username"
                placeholder="Brugernavn"
                value={newShopper.username}
                onChange={handleInputChange}
                required
                className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={newShopper.email}
                onChange={handleInputChange}
                required
                className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="w-full py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-md transition-colors duration-200"
              >
                Opret Bruger
              </button>
            </form>
          </div>

          <div className="col-span-1 md:col-span-1 lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Database Administration
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Administrer database og opdater system data.
            </p>
            <div className="space-y-4">
              <ReseedButton />
            </div>
          </div>

          <div className="col-span-1 md:col-span-1 lg:col-span-1">
            <SystemStatusComponent />
          </div>

          {/* Store Comparison and Popular Products Chart Panels */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <StoreComparisonChart
              storeData={storeData}
              isLoading={loadingStoreData}
              onRefresh={fetchStoreData}
            />
          </div>
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <PopularProductsChart
              productData={popularProducts}
              isLoading={loadingPopularProducts}
              onRefresh={fetchProductData}
            />
            <div className="col-span-1 md:col-span-2 lg:col-span-1 mt-10">
              <QuoteComponent />
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h3 className="text-lg leading-6 font-medium bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 text-left">
                Bekræft sletning
              </h3>
              <p className="mt-2 text-sm dark:text-gray-400 text-gray-500 text-left">
                Er du sikker på, at du vil slette {shopperToDelete?.username}{" "}
                fra databasen?
              </p>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600"
                  onClick={() => setConfirmDelete(false)}
                >
                  Annuller
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md hover:from-indigo-600 hover:to-purple-700"
                  onClick={confirmDeleteShopper}
                >
                  Bekræft
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Role Update Modal */}
        {showRoleModal && (
          <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h3 className="text-lg leading-6 font-medium bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 text-left">
                Opdater Rolle
              </h3>
              <p className="mt-2 text-sm dark:text-gray-400 text-gray-500 text-left">
                Nuværende rolle for {shopperToUpdateRole?.username}:{" "}
                {shopperToUpdateRole?.role}
              </p>
              <div className="mt-4">
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 border-gray-300 bg-white rounded-md"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600"
                  onClick={() => setShowRoleModal(false)}
                >
                  Annuller
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md hover:from-indigo-600 hover:to-purple-700"
                  onClick={confirmUpdateRole}
                >
                  Bekræft
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Toaster />
    </>
  );
};

export default AdminPage;
