import React, { forwardRef } from 'react';

const Input = forwardRef(({ className = "", ...props }, ref) => {
  return (
    <input
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${className}`}
      ref={ref}
      {...props}
    />
  );
});

export { Input };
