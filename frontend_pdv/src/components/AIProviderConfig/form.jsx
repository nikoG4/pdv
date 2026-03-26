import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const Form = ({ selectedConfig, handleUpdate, handleCreate, setConfig }) => {
    const [formData, setFormData] = useState({
        name: '',
        providerType: 'OPENAI',
        apiKey: '',
        model: '',
        priority: 1,
        enabled: true,
        baseUrl: ''
    });

    useEffect(() => {
        if (selectedConfig && selectedConfig.id) {
            setFormData(selectedConfig);
        }
    }, [selectedConfig]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.id) {
            handleUpdate(formData);
        } else {
            handleCreate(formData);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto shadow-xl border-none">
            <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
                    {formData.id ? 'Editar Proveedor IA' : 'Nuevo Proveedor IA'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600">Nombre</label>
                            <Input name="name" value={formData.name} onChange={handleChange} placeholder="Ej: OpenAI GPT-4" required className="h-11" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600">Tipo de Proveedor</label>
                            <select name="providerType" value={formData.providerType} onChange={handleChange} className="w-full h-11 px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                                <option value="OPENAI">OpenAI</option>
                                <option value="GEMINI">Google Gemini</option>
                                <option value="ANTHROPIC">Anthropic Claude</option>
                                <option value="LOCAL">Local / Otros (Base URL)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600">API Key</label>
                        <Input name="apiKey" type="password" value={formData.apiKey} onChange={handleChange} placeholder="sk-..." required className="h-11" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600">Modelo</label>
                            <Input name="model" value={formData.model} onChange={handleChange} placeholder="Ej: gpt-4o" required className="h-11" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600">Prioridad (1 es mayor)</label>
                            <Input name="priority" type="number" value={formData.priority} onChange={handleChange} required className="h-11" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600">Base URL (Opcional)</label>
                        <Input name="baseUrl" value={formData.baseUrl || ''} onChange={handleChange} placeholder="https://..." className="h-11" />
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                        <input type="checkbox" name="enabled" checked={formData.enabled} onChange={handleChange} id="enabled" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                        <label htmlFor="enabled" className="text-sm font-medium text-gray-700 cursor-pointer select-none">Habilitado</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <Button type="button" variant="outline" onClick={() => setConfig(null)} className="h-12 px-6">Cancelar</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-12 px-8 font-bold">Guardar Configuración</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default Form;
