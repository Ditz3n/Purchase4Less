import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative h-8 w-16 rounded-full 
                bg-gray-100 dark:bg-gray-700 
                transition-colors duration-300 ease-in-out
                hover:bg-gray-200 dark:hover:bg-gray-600
                focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
      aria-label={isDarkMode ? 'Skift til lyst tema' : 'Skift til mørkt tema'}
    >
      <span className="sr-only">Skift tema</span>
      
      {/* Slider */}
      <div
        className={`absolute top-1 left-1 flex h-6 w-6 transform items-center justify-center
                   rounded-full bg-white dark:bg-gray-800 shadow-md
                   transition-transform duration-300 ease-in-out
                   ${isDarkMode ? 'translate-x-8' : 'translate-x-0'}`}
      >
        {/* Icon inside slider */}
        {isDarkMode ? (
          <MoonIcon className="h-4 w-4 text-indigo-200" />
        ) : (
          <SunIcon className="h-4 w-4 text-yellow-500" />
        )}
      </div>
    </button>
  );
};