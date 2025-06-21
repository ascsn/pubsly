
import React from 'react';

interface AlertMessageProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose?: () => void;
}

const AlertMessage: React.FC<AlertMessageProps> = ({ message, type, onClose }) => {
  const baseClasses = "p-4 mb-4 rounded-md shadow-lg flex items-center justify-between";
  const typeClasses = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-sky-600 text-white", // Blue for info
  };

  const Icon: React.FC<{type: 'success' | 'error' | 'info'}> = ({type}) => {
    if (type === 'success') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      );
    }
    if (type === 'error') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      );
    }
    // Info Icon
    return (
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3">
         <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
       </svg>
    );
  }

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
      <div className="flex items-center">
        <Icon type={type} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-xl font-semibold leading-none hover:opacity-75 focus:outline-none"
          aria-label="Close alert"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default AlertMessage;
