import React from 'react';

const Button = ({ children, className = "", variant = "primary", size = "medium", ...props }) => {
  let baseClasses = "inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  let variantClasses;
  switch (variant) {
    case "secondary":
      variantClasses = "bg-gray-800 text-white hover:bg-gray-700 focus:ring-gray-500";
      break;
    case "danger":
      variantClasses = "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500";
      break;
    case "success":
      variantClasses = "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500";
      break;
    default:
      variantClasses = "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500";
      break;
  }

  let sizeClasses;
  switch (size) {
    case "small":
      sizeClasses = "text-xs py-1 px-2";
      break;
    case "large":
      sizeClasses = "text-lg py-3 px-6";
      break;
    default:
      sizeClasses = "text-sm py-2 px-4";
      break;
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };
