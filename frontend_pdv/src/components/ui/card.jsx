import React from 'react';

const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white shadow overflow-visible sm:rounded-lg p-3 ${className}`}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = "" }) => {
  return (
    <div className={`bg-gray-50 px-4 py-5 sm:px-6 ${className}`}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = "" }) => {
  return (
    <h3 className={`text-lg font-medium leading-6 text-gray-900 ${className}`}>
      {children}
    </h3>
  );
};

const CardContent = ({ children, className = "" }) => {
  return (
    <div className={`p-1 sm:px-4 ${className}`}>
      {children}
    </div>
  );
};


const CardFooter = ({ children, className = "" }) => {
  return (
    <div className={`px-4 py-4 bg-gray-50 text-right sm:px-6 ${className}`}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardContent, CardFooter };

