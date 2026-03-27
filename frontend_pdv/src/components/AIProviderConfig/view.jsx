import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const View = ({ config, setView }) => {
    return (
        <Card className="max-w-2xl mx-auto shadow-2xl border-none bg-white rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-900 p-8 text-white relative">
                <h2 className="text-3xl font-extrabold mb-1">Detalle del Proveedor IA</h2>
                <p className="opacity-80 font-medium">Configuración técnica del servicio</p>
                <button onClick={() => setView(null)} className="absolute top-6 right-6 hover:bg-white/20 p-2 rounded-full transition-all">✕</button>
            </div>
            
            <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nombre del Servicio</span>
                            <span className="text-xl font-bold text-gray-800">{config.name}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tipo de Proveedor</span>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="p-1 px-3 bg-blue-50 text-blue-700 font-bold rounded-full text-xs border border-blue-100">{config.providerType}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Modelo de IA</span>
                            <span className="text-xl font-bold text-indigo-700">{config.model}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Estado Operativo</span>
                            <div className="mt-1">
                                {config.enabled ? 
                                    <span className="p-1 px-3 bg-green-50 text-green-700 font-bold rounded-full text-xs border border-green-100 flex-inline items-center gap-1">🟢 Activo</span> : 
                                    <span className="p-1 px-3 bg-red-50 text-red-700 font-bold rounded-full text-xs border border-red-100 flex-inline items-center gap-1">🔴 Deshabilitado</span>
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Prioridad de Ejecución</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-4xl font-extrabold text-blue-900">{config.priority}</span>
                            <span className="text-xs text-gray-400 max-w-[120px]">(El orden de intento será de menor a mayor prioridad)</span>
                        </div>
                    </div>
                    {config.baseUrl && (
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ruta Base (Endpoint)</span>
                            <span className="mt-1 text-sm font-mono bg-gray-50 p-2 rounded border truncate" title={config.baseUrl}>{config.baseUrl}</span>
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t border-gray-100 flex flex-col">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">API Key</span>
                    <div className="mt-1 bg-gray-900 p-4 rounded-xl flex items-center justify-between text-indigo-400/80 font-mono text-sm tracking-widest overflow-hidden">
                        <span>••••••••••••••••••••••••••••••••</span>
                        <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-1 rounded">Protegido</span>
                    </div>
                </div>

                { (config.customPrompt || config.requestTemplate || config.responsePath || config.extraHeaders) && (
                    <div className="pt-6 border-t border-gray-100 space-y-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Configuración Avanzada</h3>
                        
                        {config.customPrompt && (
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Prompt Personalizado</span>
                                <div className="p-3 bg-gray-50 border border-gray-100 font-mono text-xs text-gray-600 rounded-lg whitespace-pre-wrap max-h-40 overflow-y-auto">{config.customPrompt}</div>
                            </div>
                        )}

                        {config.requestTemplate && (
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Template de Request JSON</span>
                                <div className="p-3 bg-gray-900 border border-gray-800 font-mono text-[11px] text-green-400/90 rounded-lg whitespace-pre-wrap max-h-40 overflow-y-auto">{config.requestTemplate}</div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {config.responsePath && (
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Path de Respuesta</span>
                                    <span className="p-2 bg-indigo-50 border border-indigo-100 font-mono text-[11px] text-indigo-700 rounded-lg">{config.responsePath}</span>
                                </div>
                            )}
                            {config.extraHeaders && (
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Headers Extra</span>
                                    <span className="p-2 bg-gray-900 border border-gray-800 font-mono text-[11px] text-gray-400 rounded-lg">{config.extraHeaders}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <Button onClick={() => setView(null)} className="h-12 px-10 bg-gray-800 hover:bg-black font-bold rounded-xl shadow-lg transition-all">Cerrar Detalle</Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default View;
