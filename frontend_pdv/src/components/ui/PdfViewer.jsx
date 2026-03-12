import { Document, Page, pdfjs } from 'react-pdf';
import React, { useState, useEffect } from 'react';

const PdfViewer = ({ file }) => {
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    if (file) {
      // Crear un objeto URL para el Blob
      const url = URL.createObjectURL(file);
      setPdfUrl(url);

      // Limpiar el objeto URL al desmontar el componente
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="p-4 bg-white shadow-md rounded-lg w-full h-full">
        <iframe src={pdfUrl} width="100%" height="100%" />
      </div>
    </div>
  );
};

export default PdfViewer;
