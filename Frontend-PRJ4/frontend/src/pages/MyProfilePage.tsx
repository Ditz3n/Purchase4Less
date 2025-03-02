import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { PencilIcon, CheckIcon, XMarkIcon, QuestionMarkCircleIcon } from '@heroicons/react/20/solid';
import { useNavigate } from 'react-router-dom';

const MyProfilePage: React.FC = () => {
  const { user } = useUser();
  const { getToken, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditingName, setIsEditingName] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [shopperId, setShopperId] = useState('');
  const [role, setRole] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [showLengthAlert, setShowLengthAlert] = useState(false);
  const [showSpaceAlert, setShowSpaceAlert] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const response = await fetch(`http://localhost:5000/api/shopper/${user.id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          const data = await response.json();
          setUsername(data.username);
          setEmail(data.email);
          setShopperId(data.shopperId);
          setRole(data.role);
          setNewUsername(data.username);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        // Check for dummy login
        const dummyLogin = localStorage.getItem('dummyLogin');
        const dummyUsername = localStorage.getItem('dummyUsername');
        const dummyEmail = localStorage.getItem('dummyEmail');
        const dummyRole = localStorage.getItem('dummyRole');
        const dummyShopperId = localStorage.getItem('dummyShopperId');

        if (dummyLogin === 'true') {
          setUsername(dummyUsername || 'Brugernavn ikke tilgængelig');
          setEmail(dummyEmail || 'Email ikke tilgængelig');
          setShopperId(dummyShopperId || 'ID ikke tilgængelig');
          setRole(dummyRole || 'Rolle ikke tilgængelig');
          setNewUsername(dummyUsername || '');
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleEditUsernameClick = () => {
    setIsEditingName(true);
  };

  const handleCancelUsernameClick = () => {
    setIsEditingName(false);
    setNewUsername(username);
  };

  const handleSaveProfileClick = async () => {
    try {
      const dummyLogin = localStorage.getItem('dummyLogin');
      const id = dummyLogin === 'true' ? localStorage.getItem('dummyShopperId') : user?.id;

      const response = await fetch(`http://localhost:5000/api/shopper/updateusername/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUsername),
      });
      if (!response.ok) {
        throw new Error('Failed to update username');
      }
      setUsername(newUsername);
      setIsEditingName(false);

      if (dummyLogin === 'true') {
        localStorage.setItem('dummyUsername', newUsername);
      }
    } catch (error) {
      console.error('Failed to update username:', error);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > 16) {
      setShowLengthAlert(true);
      setTimeout(() => setShowLengthAlert(false), 3000);
    } else if (/\s/.test(value)) {
      setShowSpaceAlert(true);
      setTimeout(() => setShowSpaceAlert(false), 3000);
    } else {
      setNewUsername(value);
    }
  };

  const handleDeleteProfileClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = await getToken({ template: "p4l" });
      const clerkUserId = user?.id;
      const dummyLogin = localStorage.getItem('dummyLogin');
  
      if (!clerkUserId && dummyLogin !== 'true') {
        throw new Error('User ID is undefined');
      }
  
      const id = dummyLogin === 'true' ? localStorage.getItem('dummyShopperId') : clerkUserId;
  
      if (!id) {
        throw new Error('ID is undefined');
      }
  
      const response = await fetch(`http://localhost:5000/api/shopper/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Dummy-Login': dummyLogin === 'true' ? 'true' : 'false',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete user from local backend and Clerk');
      }
  
      setShowDeleteModal(false);
      setShowSuccessModal(true);

      // Fjerne brugerdata fra localStorage, så man kan logge ind igen
      localStorage.removeItem('dummyLogin');
      localStorage.removeItem('dummyUsername');
      localStorage.removeItem('dummyEmail');
      localStorage.removeItem('dummyRole');
      localStorage.removeItem('dummyShopperId');
  
      setTimeout(async () => {
        await signOut();
        window.location.reload();
        navigate('/home');
      }, 3000);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl mt-12 font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500">
          Min Profil
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Dette er din profil, hvor du kan se dine brugeroplysninger og redigere dit brugernavn, hvis du ønsker det.
        </p>
      </div>
      <div className="w-full max-w-md bg-white dark:bg-gray-700 shadow-lg rounded-lg p-6 sm:p-4 md:p-6 relative">
        <div className="space-y-4">
          <div className="border-b border-gray-300 dark:border-gray-600 pb-3 flex justify-between items-center">
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Brugernavn</p>
              {isEditingName ? (
                <input
                  type="text"
                  value={newUsername}
                  onChange={handleUsernameChange}
                  className="text-base font-medium text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none w-full"
                />
              ) : (
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {username || 'Brugernavn ikke tilgængelig'}
                </p>
              )}
            </div>
            {!isEditingName && (
              <button onClick={handleEditUsernameClick} className="text-gray-500 dark:text-gray-400">
                <PencilIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="border-b border-gray-300 dark:border-gray-600 pb-3 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {email || 'Email ikke tilgængelig'}
              </p>
            </div>
          </div>
          <div className="border-b border-gray-300 dark:border-gray-600 pb-3">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Unikt Shopper ID</p>
              <div className="relative group">
                <QuestionMarkCircleIcon className="h-5 w-5 ml-2 text-gray-500 dark:text-gray-400" />
                <div className="absolute left-0 transform -translate-x-3/4 bottom-full text-center mb-2 hidden w-48 p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded-lg shadow-lg group-hover:block">
                  Dette er dit Unikke Shopper ID.
                </div>
              </div>
            </div>
            <p className="text-base font-medium text-gray-900 dark:text-white break-words">
              {shopperId || 'ID ikke tilgængelig'}
            </p>
          </div>
          <div className="border-b border-gray-300 dark:border-gray-600 pb-3">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Rolle</p>
              <div className="relative group">
                <QuestionMarkCircleIcon className="h-5 w-5 ml-2 text-gray-500 dark:text-gray-400" />
                <div className="absolute left-0 transform -translate-x-3/4 bottom-full text-center mb-2 hidden w-48 p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded-lg shadow-lg group-hover:block">
                  Dette er din rolle.
                </div>
              </div>
            </div>
            <p className="text-base font-medium text-gray-900 dark:text-white break-words">
              {role || 'Rolle ikke tilgængelig'}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSaveProfileClick}
              className={`w-full p-2 ${isEditingName ? 
                'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 dark:from-indigo-400 dark:to-purple-500 dark:hover:from-indigo-500 dark:hover:to-purple-600'
                : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'} 
                text-white shadow-sm rounded-md transition duration-200`}
              disabled={!isEditingName}
            >
              Gem
            </button>
            <button
              onClick={handleCancelUsernameClick}
              className={`w-full p-2 ${isEditingName ? 
                'bg-gray-500 hover:bg-gray-600 dark:bg-gray-500 dark:hover:bg-gray-600'
                : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'} 
                text-white shadow-sm rounded-md transition duration-200`}
              disabled={!isEditingName}
            >
              Annuller
            </button>
          </div>
        </div>
      </div>
      <div className="mt-8 w-full max-w-md bg-white dark:bg-gray-700 shadow-lg rounded-lg p-6 sm:p-4 md:p-6">
      <button
        onClick={handleDeleteProfileClick}
        className="w-full p-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-sm rounded-md transition duration-200"
      >
        Slet Profil
      </button>
      </div>

      <div className={`fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-500 ease-in-out ${showDeleteModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-lg text-center transition-transform duration-500 ease-in-out transform scale-105 w-10/12 sm:w-1/2 lg:w-1/3">
          <p className="text-lg text-gray-900 dark:text-white">Er du sikker på, at du vil slette din profil?</p>
          <div className="mt-4 flex justify-center space-x-4">
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-md transition duration-200"
            >
              Bekræft
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition duration-200"
            >
              Annuller
            </button>
          </div>
        </div>
      </div>

      <div className={`fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-500 ease-in-out ${showSuccessModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-lg text-center transition-transform duration-500 ease-in-out transform scale-105 w-10/12 sm:w-1/2 lg:w-1/3">
          <p className="text-lg text-gray-900 dark:text-white">Brugerprofilen er blevet slettet!</p>
        </div>
      </div>
      <div className="mt-8 w-full max-w-md bg-white dark:bg-gray-700 shadow-lg rounded-lg p-6 sm:p-4 md:p-6">
        <h2 className="text-xl font-bold mb-2">Hvilke data indsamler vi?</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Vi indsamler følgende data om dig i vores database:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 mb-3">
          <li>Dit Brugernavn</li>
          <li>Din Email</li>
          <li className="whitespace-nowrap">Dit Unikke Shopper ID</li>
          <li>Din Rolle</li>
        </ul>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Disse data bruges til at administrere din konto og give dig en bedre oplevelse på vores platform.
        </p>
      </div>
    </div>
  );
};

export default MyProfilePage;