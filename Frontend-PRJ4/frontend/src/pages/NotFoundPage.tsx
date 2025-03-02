import React from 'react';
import { Link } from 'react-router-dom';


const NotFoundPage: React.FC = () => {
    
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-6 dark:bg-gray-800 dark:text-white bg-white text-gray-800`}>
      <h1 className="text-5xl font-extrabold mb-4 p-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500">
        404 - Siden blev ikke fundet
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
        Den side, du prøvede at tilgå, eksisterer ikke.
      </p>
      <Link to="/home" className="text-indigo-600 dark:text-indigo-400 hover:underline">
        Gå tilbage til forsiden
      </Link>
    </div>
  );
};

export default NotFoundPage;