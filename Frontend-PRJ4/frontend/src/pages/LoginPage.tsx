// LoginPage.tsx er login-siden til Purchase4Less. Denne side indeholder funktionalitet til at logge ind med Clerk, samt en dummy-login funktion til at logge ind som admin.

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SignedOut, SignInButton, useUser, useAuth } from "@clerk/clerk-react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

// LoginPage komponenten
const LoginPage: React.FC = () => {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [backendStatus, setBackendStatus] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDummyLoginModal, setShowDummyLoginModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false); // State for the password modal
  const [dummyUsername, setDummyUsername] = useState("");
  const [dummyPassword, setDummyPassword] = useState(""); // State for password input
  const [showUsernameErrorModal, setShowUsernameErrorModal] = useState(false); // State for username error modal
  const [showPasswordErrorModal, setShowPasswordErrorModal] = useState(false); // State for password error modal
  const [passwordVisible, setPasswordVisible] = useState(false); // State for password visibility
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDummyLoginModalVisible, setIsDummyLoginModalVisible] =
    useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isUsernameErrorModalVisible, setIsUsernameErrorModalVisible] =
    useState(false);
  const [isPasswordErrorModalVisible, setIsPasswordErrorModalVisible] =
    useState(false);

  // Funktion til at hente data fra backend med JWT token
  const fetchWithAuth = async (url: string, options: RequestInit) => {
    const token = await getToken({ template: "p4l" });
    if (!token) {
      throw new Error("No token found");
    }

    const authOptions = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    };

    return fetch(url, authOptions);
  };

  // Funktion til at tjekke lokal backend status
  const checkBackendStatus = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/healthcheck/status"
      );
      const data = await response.json();
      setBackendStatus(data.status === "online");
    } catch {
      setBackendStatus(false);
    }
  };

  // useEffect til at tjekke backend status hvert 5. sek
  useEffect(() => {
    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 5000); // Tjek backend status hvert 5. sek
    return () => clearInterval(interval); // Ryd op efter useEffect
  }, []);

  // useEffect til at tjekke brugerens login status og oprette bruger i lokal backend
  useEffect(() => {
    const authenticateUser = async () => {
      if (isSignedIn && user) {
        try {
          const token = await getToken({ template: "p4l" });
          let role = "User"; // Default rolle

          if (token) {
            const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT
            role = decodedToken.role || "User"; // Extract rollen fra JWT

            // Extract brugerens brugernavn fra email før @
            const username =
              user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
              "Unnamed User";

            // Tjek om brugeren allerede eksisterer i den lokale backend
            const checkResponse = await fetchWithAuth(
              `http://localhost:5000/api/shopper/checkemail/${user.primaryEmailAddress?.emailAddress}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (!checkResponse.ok) {
              // Hvis brugeren ikke eksisterer, opret bruger i lokal backend
              const response = await fetchWithAuth(
                "http://localhost:5000/api/shopper/createshopper",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    ShopperId: user.id,
                    Username: username,
                    Email: user.primaryEmailAddress?.emailAddress,
                    Role: role,
                  }),
                }
              );

              if (!response.ok) {
                console.warn("Sync failed but continuing navigation.");
              }
            }
          }

          // Naviger til home side uanset om brugeren er admin eller ej
          navigate("/home");
        } catch (error) {
          console.error("Error during authentication:", error);
          navigate("/home"); // Hvis der opstår en fejl, naviger til home side
        }
      } else {
        // Tjek om der er dummy login data i local storage og naviger til admin eller home side
        // Det er hvis man logger ind som admin med dummy data, og ikke er logget ind med Clerk
        const dummyLogin = localStorage.getItem("dummyLogin");
        const dummyRole = localStorage.getItem("dummyRole");
        if (dummyLogin === "true" && dummyRole) {
          navigate(dummyRole === "Admin" ? "/admin" : "/home");
        }
      }
    };

    authenticateUser();
  }, [isSignedIn, user, getToken, fetchWithAuth, navigate]);

  // Funktion til at logge ind som admin med dummy data
  const handleDummyLogin = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/shopper/checkusername/${dummyUsername}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Username does not exist");
      }

      const data = await response.json();

      // Set dummy login data i local storage og reload siden
      localStorage.setItem("dummyLogin", "true");
      localStorage.setItem("dummyUsername", dummyUsername);
      localStorage.setItem("dummyEmail", data.email); // Set a dummy email
      localStorage.setItem("dummyRole", data.role);
      localStorage.setItem("dummyShopperId", data.shopperId); // Set a dummy shopper ID

      window.location.reload();

      // Redirect baseret på rollen
      navigate(data.role === "Admin" ? "/admin" : "/home");
    } catch (error) {
      console.error("Error during dummy login:", error);
      setShowDummyLoginModal(false);
      setShowUsernameErrorModal(true);
      setTimeout(() => setShowUsernameErrorModal(false), 1500); // Skjul popup vindue efter 1.5 sek
    }
  };

  // Funktion til at håndtere kodeord for at logge ind som admin med dummy data
  const handlePasswordLogin = () => {
    if (dummyPassword === "Purchase4Less") {
      // Hvis kodeordet er korrekt, log ind som admin med dummy data
      handleDummyLogin();
      setShowPasswordModal(false);
    } else {
      setShowPasswordErrorModal(true);
      setTimeout(() => {
        setIsPasswordErrorModalVisible(true);
        setTimeout(() => {
          setIsPasswordErrorModalVisible(false);
          setTimeout(() => {
            setShowPasswordErrorModal(false);
          }, 500);
        }, 1500); // Skjul popup vindue efter 1.5 sek
      }, 10);
    }
  };

  // Funktion til at tjekke om brugernavnet er i lokal database for at logge ind som admin med dummy data
  const handleUsernameCheck = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/shopper/checkusername/${dummyUsername}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Username does not exist");
      }

      const data = await response.json();

      // Hvis brugernavnet findes, fortsæt til kodeordsvindue
      setIsDummyLoginModalVisible(false);
      setTimeout(() => {
        setShowDummyLoginModal(false);
        setShowPasswordModal(true);
        setTimeout(() => {
          setIsPasswordModalVisible(true);
        }, 10);
      }, 500);
    } catch (error) {
      setIsDummyLoginModalVisible(false);
      setTimeout(() => {
        setShowDummyLoginModal(false);
        setShowUsernameErrorModal(true);
        setTimeout(() => {
          setIsUsernameErrorModalVisible(true);
          setTimeout(() => {
            setIsUsernameErrorModalVisible(false);
            setTimeout(() => {
              setShowUsernameErrorModal(false);
            }, 500);
          }, 1500); // skjul  popup vindue efter 1.5 sek
        }, 10);
      }, 500);
    }
  };

  // Funktion til at åbne popup vindue for login
  const handleOpenModal = () => {
    setShowLoginModal(true);
    setTimeout(() => {
      setIsModalVisible(true);
    }, 10);
  };

  // Funktion til at lukke popup vindue for login
  const handleCloseModal = (
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
    setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>,
    callback?: () => void
  ) => {
    setIsModalVisible(false);
    setTimeout(() => {
      setShowModal(false);
      if (callback) callback();
    }, 500);
  };

  // useEffect til at vise login popup
  useEffect(() => {
    if (showLoginModal) {
      const timer = setTimeout(() => {
        setIsModalVisible(true);
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [showLoginModal]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 text-center">
        Velkommen til Purchase4Less
      </h1>
      <p className="text-lg sm:text-xl md:text-2xl mb-6 text-gray-600 dark:text-gray-300 text-center max-w-2xl">
        Tryk på nedenstående knap for at logge ind eller oprette dig
      </p>

      <SignedOut>
        <input
          className={`inputButton shadow-lg mb-5 px-4 py-2 text-white rounded-md ${
            backendStatus
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 dark:from-indigo-400 dark:to-purple-500 dark:hover:from-indigo-500 dark:hover:to-purple-600"
              : "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
          }`}
          type="button"
          value="Log ind"
          //disabled={!backendStatus}
          title={!backendStatus ? "Serveren er i øjeblikket offline" : ""}
          onClick={handleOpenModal}
        />
        {!backendStatus && (
          <p className="text-xs mt-1 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500">
            Serveren er desværre i øjeblikket offline
          </p>
        )}
      </SignedOut>

      {/* Login Modal */}
      {showLoginModal && (
        <div
          className={`fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-500 ease-in-out ${
            isModalVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full transition-all duration-500 ease-in-out transform ${
              isModalVisible ? "scale-100 opacity-100" : "scale-105 opacity-0"
            }`}
          >
            <h3 className="text-lg text-center leading-6 font-medium bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500">
              Vælg login metode
            </h3>
            <div className="mt-4 flex flex-col space-y-2">
              <SignInButton>
                <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md hover:from-indigo-600 hover:to-purple-700">
                  Login med Clerk
                </button>
              </SignInButton>
              <button
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md hover:from-indigo-600 hover:to-purple-700"
                onClick={() => {
                  setIsModalVisible(false);
                  setTimeout(() => {
                    setShowLoginModal(false);
                    setShowDummyLoginModal(true);
                    setTimeout(() => {
                      setIsDummyLoginModalVisible(true);
                    }, 10);
                  }, 500);
                }}
              >
                Login med Admin Dummy-Data
              </button>
              <button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600"
                onClick={() =>
                  handleCloseModal(setShowLoginModal, setIsModalVisible)
                }
              >
                Annuller
              </button>
            </div>
          </div>
        </div>
      )}

      {showDummyLoginModal && (
        <div
          className={`fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-500 ease-in-out ${
            isDummyLoginModalVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full transition-all duration-500 ease-in-out transform ${
              isDummyLoginModalVisible
                ? "scale-100 opacity-100"
                : "scale-105 opacity-0"
            }`}
          >
            <h3 className="text-lg leading-6 font-medium bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 text-left">
              Indtast brugernavn
            </h3>
            <input
              className="mt-4 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-transform duration-200 ease-in-out transform focus:scale-105"
              placeholder="Indtast dit brugernavn"
              value={dummyUsername}
              onChange={(e) => setDummyUsername(e.target.value)}
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600"
                onClick={() =>
                  handleCloseModal(
                    setShowDummyLoginModal,
                    setIsDummyLoginModalVisible
                  )
                }
              >
                Annuller
              </button>
              <button
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md hover:from-indigo-600 hover:to-purple-700"
                onClick={handleUsernameCheck} // Call the function that checks the username
              >
                Fortsæt
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div
          className={`fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-500 ease-in-out ${
            isPasswordModalVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full transition-all duration-500 ease-in-out transform ${
              isPasswordModalVisible
                ? "scale-100 opacity-100"
                : "scale-105 opacity-0"
            }`}
          >
            <h3 className="text-lg leading-6 font-medium bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 text-left">
              Indtast adgangskode
            </h3>
            <div className="relative mt-4 w-full">
              <input
                type={passwordVisible ? "text" : "password"}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-transform duration-200 ease-in-out transform focus:scale-105"
                placeholder="Adgangskode"
                value={dummyPassword}
                onChange={(e) => setDummyPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-300"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? (
                  <EyeIcon className="h-5 w-5" />
                ) : (
                  <EyeSlashIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600"
                onClick={() =>
                  handleCloseModal(
                    setShowPasswordModal,
                    setIsPasswordModalVisible
                  )
                }
              >
                Annuller
              </button>
              <button
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md hover:from-indigo-600 hover:to-purple-700"
                onClick={handlePasswordLogin}
              >
                Log ind
              </button>
            </div>
          </div>
        </div>
      )}

      {showUsernameErrorModal && (
        <div
          className={`fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-500 ease-in-out ${
            isUsernameErrorModalVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full transition-all duration-500 ease-in-out transform ${
              isUsernameErrorModalVisible
                ? "scale-100 opacity-100"
                : "scale-105 opacity-0"
            }`}
          >
            <h3 className="text-lg leading-6 font-medium bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 text-center">
              Brugernavn findes ikke
            </h3>
          </div>
        </div>
      )}

      {showPasswordErrorModal && (
        <div
          className={`fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-500 ease-in-out ${
            isPasswordErrorModalVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full transition-all duration-500 ease-in-out transform ${
              isPasswordErrorModalVisible
                ? "scale-100 opacity-100"
                : "scale-105 opacity-0"
            }`}
          >
            <h3 className="text-lg leading-6 font-medium bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 text-center">
              Forkert adgangskode
            </h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
