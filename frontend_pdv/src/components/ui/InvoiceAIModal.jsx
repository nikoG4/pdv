import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Button } from './button';
import { Input } from './input';
import InvoiceAIService from '../../services/InvoiceAIService';
import ProductService from '../../services/ProductService';
import SupplierService from '../../services/SupplierService';
import { PlusIcon, XIcon, SearchIcon, DeleteIcon } from './icons';
import PaginatedSelect from './PaginatedSelect';

const InvoiceAIModal = ({ isOpen, onClose, onConfirm, mode = 'purchase' }) => {
    const [file, setFile] = useState(null);
    const [isParsing, setIsParsing] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleParse = async () => {
        if (!file) return;
        setIsParsing(true);
        try {
            const data = await InvoiceAIService.parse(file);
            // Enrich items with UI-specific flags
            data.items = data.items.map(item => ({
                ...item,
                isNewProduct: !item.productId,
                isNewCategory: !item.categoryId && !!item.categoryName,
                originalDescription: item.description
            }));
            setInvoiceData(data);
        } catch (error) {
            alert('Error al procesar la factura: ' + error.message);
        } finally {
            setIsParsing(false);
        }
    };

    const handleConfirm = async () => {
        try {
            if (mode === 'purchase') {
                await InvoiceAIService.confirmPurchase(invoiceData, selectedSupplier?.value);
            } else {
                await InvoiceAIService.confirmProducts(invoiceData);
            }
            onConfirm();
            onClose();
        } catch (error) {
            alert('Error al confirmar: ' + error.message);
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...invoiceData.items];
        newItems[index][field] = value;
        
        // Auto-calculate subtotal
        if (field === 'quantity' || field === 'price') {
            newItems[index].subtotal = newItems[index].quantity * newItems[index].price;
        }
        
        setInvoiceData({ ...invoiceData, items: newItems });
    };

    const removeItem = (index) => {
        const newItems = invoiceData.items.filter((_, i) => i !== index);
        setInvoiceData({ ...invoiceData, items: newItems });
    };

    const loadSuppliers = async (page) => {
        const response = await SupplierService.getAllSuppliers({ page, size: 10 });
        return response.content.map(s => ({ value: s.id, label: s.name }));
    };

    const loadProducts = async (page) => {
        const response = await ProductService.getAllProducts({ page, size: 10 });
        return response.content.map(p => ({ value: p.id, label: p.name }));
    };

    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.8) return 'text-green-600';
        if (confidence >= 0.5) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col">
                <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <span className="p-2 bg-white/20 rounded-lg">✨</span>
                        Carga Inteligente de Factura ({mode === 'purchase' ? 'Compra' : 'Productos'})
                    </h2>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {!invoiceData ? (
                        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer relative" 
                             onClick={() => document.getElementById('file-upload').click()}>
                            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                            
                            {file ? (
                                <div className="text-center">
                                    <div className="text-4xl mb-4">📄</div>
                                    <p className="text-xl font-semibold text-gray-800">{file.name}</p>
                                    <p className="text-gray-500 mt-2">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <Button className="mt-6 bg-indigo-600 hover:bg-indigo-700 h-12 px-8 rounded-xl shadow-lg" onClick={(e) => { e.stopPropagation(); handleParse(); }} disabled={isParsing}>
                                        {isParsing ? 'Analizando con IA...' : 'Iniciar Análisis IA'}
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="text-6xl mb-6 opacity-40">📁</div>
                                    <p className="text-2xl font-medium text-gray-700">Arrastra tu factura aquí</p>
                                    <p className="text-gray-500 mt-2">O haz clic para seleccionar (PDF, Imágenes, etc.)</p>
                                </div>
                            )}
                            
                            {isParsing && (
                                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center rounded-3xl backdrop-blur-sm">
                                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
                                    <p className="text-indigo-800 font-bold text-xl animate-pulse">Procesando factura con IA...</p>
                                    <p className="text-gray-500 mt-2">Estamos detectando productos, precios y categorías</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nro Factura</label>
                                    <Input value={invoiceData.invoiceNumber || ''} onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})} className="border-gray-200 focus:ring-indigo-500" />
                                </div>
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fecha</label>
                                    <Input type="date" value={invoiceData.date || ''} onChange={(e) => setInvoiceData({...invoiceData, date: e.target.value})} className="border-gray-200 focus:ring-indigo-500" />
                                </div>
                                {mode === 'purchase' && (
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Proveedor</label>
                                        <PaginatedSelect 
                                            loadOptions={loadSuppliers}
                                            value={selectedSupplier}
                                            onChange={setSelectedSupplier}
                                            placeholder="Seleccionar..."
                                            className="react-select-container"
                                        />
                                        <p className="text-[10px] mt-1 text-gray-400">Detectado: {invoiceData.supplierName}</p>
                                    </div>
                                )}
                            </div>

                            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                                            <th className="p-4 font-semibold">Match</th>
                                            <th className="p-4 font-semibold">Descripción</th>
                                            <th className="p-4 font-semibold w-24 text-center">Cant.</th>
                                            <th className="p-4 font-semibold w-32 text-right">Precio</th>
                                            <th className="p-4 font-semibold w-32 text-right">Subtotal</th>
                                            <th className="p-4 font-semibold">Categoría</th>
                                            <th className="p-4 font-semibold text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {invoiceData.items.map((item, index) => (
                                            <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`text-[10px] font-bold uppercase ${item.isNewProduct ? 'text-blue-500' : 'text-green-500'}`}>
                                                            {item.isNewProduct ? '✨ Nuevo' : '✅ Existente'}
                                                        </span>
                                                        {item.confidence && (
                                                            <span className={`text-[10px] ${getConfidenceColor(item.confidence)}`}>
                                                                Conf: {(item.confidence * 100).toFixed(0)}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Input value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} className="font-medium" />
                                                </td>
                                                <td className="p-4">
                                                    <Input type="number" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))} className="text-center" />
                                                </td>
                                                <td className="p-4">
                                                    <Input type="number" value={item.price} onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))} className="text-right" />
                                                </td>
                                                <td className="p-4 text-right font-bold text-gray-700">
                                                    {new Intl.NumberFormat('es-PY').format(item.subtotal || 0)}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <Input value={item.categoryName || ''} onChange={(e) => updateItem(index, 'categoryName', e.target.value)} placeholder="Categoría..." />
                                                        <label className="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer">
                                                            <input type="checkbox" checked={item.isNewCategory} onChange={(e) => updateItem(index, 'isNewCategory', e.target.checked)} />
                                                            Crear nueva
                                                        </label>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors">
                                                        <DeleteIcon className="h-5 w-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="mt-8 flex justify-between items-center p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <div className="text-gray-600">
                                    <span className="text-2xl font-bold text-indigo-900 ml-2">Total Factura: {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(invoiceData.total || 0)}</span>
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="outline" onClick={() => setInvoiceData(null)} className="h-12 px-6 rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-100">Volver a subir</Button>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 shadow-xl h-12 px-10 rounded-xl" onClick={handleConfirm}>Confirmar y Guardar</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvoiceAIModal;
