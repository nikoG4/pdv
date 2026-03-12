import React, { useState } from 'react';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    inputConfig = null 
}) => {
    const [inputValue, setInputValue] = useState(inputConfig?.defaultValue || "");

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(inputValue); // Pasa el valor del input al confirmar
        setInputValue(inputConfig?.defaultValue || ""); // Restablece el valor al predeterminado
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black opacity-50"></div>
            <div className="bg-white p-6 rounded-lg shadow-lg z-10 w-80">
                <h2 className="text-lg font-bold mb-4">{title}</h2>
                <p className="mb-4">{message}</p>
                {inputConfig && (
                    <input
                        type={inputConfig.type || "text"}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={inputConfig.placeholder || ""}
                        className="w-full p-2 border rounded mb-4"
                        min={inputConfig.min || undefined}
                    />
                )}
                <div className="flex justify-end space-x-2">
                    <button
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        onClick={handleConfirm}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export { ConfirmModal };
