import React from 'react';

const Textarea = ({ className = "", ...props }) => {
  return (
    <textarea
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${className}`}
      {...props}
    />
  );
};

export { Textarea };
