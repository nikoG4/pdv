import React from 'react';

const DropdownMenu = ({ children, className = "" }) => {
  return (
    <div className={`relative inline-block text-left ${className}`}>
      {children}
    </div>
  );
};

const DropdownMenuTrigger = ({ children, asChild, className = "" }) => {
  const Trigger = asChild ? 'button' : 'div';
  return (
    <Trigger className={`inline-flex items-center ${className}`}>
      {children}
    </Trigger>
  );
};

const DropdownMenuContent = ({ children, align = "start", className = "" }) => {
  return (
    <div
      className={`absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 ${className} ${align === 'end' ? 'right-0' : ''}`}
    >
      {children}
    </div>
  );
};

const DropdownMenuLabel = ({ children, className = "" }) => {
  return (
    <div className={`px-4 py-2 text-sm font-semibold text-gray-900 ${className}`}>
      {children}
    </div>
  );
};

const DropdownMenuSeparator = ({ className = "" }) => {
  return (
    <div className={`h-px bg-gray-200 ${className}`} />
  );
};

const DropdownMenuItem = ({ children, className = "", onClick }) => {
  return (
    <button
      className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem };
