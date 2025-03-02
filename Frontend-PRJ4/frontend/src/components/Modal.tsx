import React from "react";

interface ModalProps {
  isVisible: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isVisible, title, message, onClose, children }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-lg text-center w-10/12 sm:w-3/4 lg:w-1/2">
        {title && <h2 className="text-lg font-bold mb-4">{title}</h2>}
        {message && <p className="text-md text-gray-900 dark:text-white mb-4">{message}</p>}
        {children}
      </div>
    </div>
  );
};

export default Modal;
