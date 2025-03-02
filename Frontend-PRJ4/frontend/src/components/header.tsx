"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser, SignOutButton, useAuth } from "@clerk/clerk-react";
import { Disclosure } from "@headlessui/react";
import {
  ShoppingCartIcon,
  UserIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  PowerIcon,
  Square3Stack3DIcon,
  RectangleGroupIcon,
  Bars3Icon,
  ArrowLeftIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { ThemeToggle } from "../components/themeToggle";
import NotificationBell from "./NotificationBell";

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({
  isSidebarOpen,
  toggleSidebar,
}: SidebarProps) {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [backendStatus, setBackendStatus] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();

  // Menuindhold for shopping-relaterede sider
  const shoppingFeatures = [
    {
      name: "Mine Shoppinglister",
      description: "View and manage your shopping lists",
      href: "/mine-indkoebslister", // Route til MyShoppingListsPage
      icon: ShoppingCartIcon,
    },
  ];

  // Menuindhold for produkt-relaterede sider
  const productFeatures = [
    {
      name: "Find produkt",
      description: "Find a specific product",
      href: "/soeg-produkt", // Route til SearchProductPage
      icon: MagnifyingGlassIcon,
    },
    {
      name: "Alle produkter",
      description: "See all available products",
      href: "/produktoverblik", // Route til ProductOverviewPage
      icon: Square3Stack3DIcon,
    },
    {
      name: "Abonner på produkt",
      description: "Get notifications for products",
      href: "/abonner-produkt", // Route til SubscribeToProductsPage
      icon: () => <NotificationBell /> // Kald component for at vise notifikationsikon
    },
  ];

  useEffect(() => {
    const checkAdminRole = async () => {
      if (isSignedIn && user) {
        const token = await getToken({ template: "p4l" });
        let role = "User"; // Default role

        if (token) {
          const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT
          role = decodedToken.role || "User"; // Extract role eller fald tilbage til "User"
          setIsAdmin(role === "Admin");
        }
      } else {
        // Check for dummy login
        const dummyLogin = localStorage.getItem('dummyLogin');
        const dummyRole = localStorage.getItem('dummyRole');
        if (dummyLogin === 'true' && dummyRole) {
          setIsAdmin(dummyRole === "Admin");
        }
      }
    };

    checkAdminRole();
  }, [isSignedIn, user, getToken]);

  const handleLogout = () => {
    localStorage.removeItem('dummyLogin');
    localStorage.removeItem('dummyUsername');
    localStorage.removeItem('dummyEmail');
    localStorage.removeItem('dummyShopperId');
    localStorage.removeItem('dummyRole');
    navigate("/login");
  };

  const checkBackendStatus = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/healthcheck/status", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      setBackendStatus(data.status === "online");
    } catch {
      setBackendStatus(false);
    }
  };

  useEffect(() => {
    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const handleAdminAccess = () => {
    navigate("/admin");
  };

  return (
    <div className="relative">
      <button
        onClick={toggleSidebar}
        className={`fixed bottom-4 left-4 z-50 p-2 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 text-white rounded-full focus:outline-none shadow-lg hover:shadow-xl hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-700 dark:hover:from-indigo-500 dark:hover:to-purple-600 transition-shadow duration-300 ${isSidebarOpen ? "hidden" : "block"
          }`}
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      <div
        className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}
      >
        <button
          onClick={toggleSidebar}
          className="fixed bottom-[2rem] left-48 z-50 p-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 text-white rounded-full focus:outline-none shadow-lg hover:shadow-xl hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-700 dark:hover:from-indigo-500 dark:hover:to-purple-600 transition-shadow duration-300"
        >
          {isSidebarOpen ? (
            <ArrowLeftIcon className="h-5 w-5" />
          ) : (
            <Bars3Icon className="h-5 w-5" />
          )}
        </button>

        {/* Logo Section */}
        <div className="p-4">
          <Link to="/home" className="flex items-center">
            <h2 className="text-2xl ml-2 font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
              Purchase4Less
            </h2>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col h-[calc(100vh-80px)] justify-between border-t border-gray-200 dark:border-gray-700 pt-4 space-y-1">
          <div className="px-2">
            {(isSignedIn && (
              <>
                {/* Products Section */}
                <Disclosure as="div" className="mb-2">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex items-center w-full px-4 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                        <RectangleGroupIcon className="h-5 w-5 mr-2" />
                        <span>Produkter</span>
                        <ChevronDownIcon
                          className={`ml-auto h-5 w-5 transform transition-transform duration-200 ${open ? "rotate-180" : ""
                            }`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="px-4 pt-2 pb-2">
                        {productFeatures.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
                          >
                            <item.icon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                            {item.name}
                          </Link>
                        ))}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
                {/* Direct Link to Mine Shoppinglister */}
                <div className="mb-2">
                  <Link
                    to="/mine-indkoebslister"
                    className="flex items-center px-4 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    <ShoppingCartIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                    Mine shoppinglister
                  </Link>
                </div>
              </>
            ))}
          </div>

          {/* Settings & Profile Section */}
          <div className="mt-auto px-2">
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-1">
              {(isSignedIn && isAdmin && (
                <Link
                  to="/profil"
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Profil
                </Link>
              ))}
              {isSignedIn && isAdmin && (
                <button
                  onClick={handleAdminAccess}
                  className="flex items-center w-full px-4 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <ShieldCheckIcon className="h-4 w-4 mr-2" />
                  Admin
                </button>
              )}
              {isSignedIn ? (
                <SignOutButton>
                  <button
                    onClick={() => {
                      sessionStorage.removeItem("isAdminAuthenticated");
                      handleLogout();
                    }}
                    className="flex items-center w-full px-4 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    <PowerIcon className="h-4 w-4 mr-2" />
                    Log ud
                  </button>
                </SignOutButton>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center w-full px-4 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <PowerIcon className="h-4 w-4 mr-2" />
                  Log ind
                </Link>
              )}
              <div className="px-4 py-2">
                <ThemeToggle />
              </div>
              <div className="flex items-center px-4 py-2">
                <span className="text-xs text-gray-600 dark:text-gray-400 mr-2">
                  Backend Status:
                </span>
                <span
                  className={`h-2 w-2 rounded-full ${backendStatus ? "bg-green-500" : "bg-red-500"
                    }`}
                ></span>
                <button
                  onClick={checkBackendStatus}
                  className="ml-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}