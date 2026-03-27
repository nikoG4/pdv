import { useEffect, useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TableData } from '../ui/table';
import AIProviderConfigService from '../../services/AIProviderConfigService';
import Form from './form';
import { AuthContext } from '../../services/Auth/AuthContext';
import { DeleteIcon, EditIcon, PlusIcon, SearchIcon, ViewIcon, PlayIcon } from '../ui/icons';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import Modal from '@/components/ui/Modal';
import { Input } from '../ui/input';
import View from './view';

const AIProviderConfig = () => {
    const [configs, setConfigs] = useState([]);
    const [selectedConfig, setSelectedConfig] = useState(null);
    const [viewConfig, setViewConfig] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [configToDelete, setConfigToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [testResult, setTestResult] = useState(null);
    const [isTesting, setIsTesting] = useState(false);
    const { user } = useContext(AuthContext);

    const fetchConfigs = async (page) => {
        try {
            const response = await AIProviderConfigService.getAll({ page, size: pageSize, q: searchTerm });
            setConfigs(response.content);
            setTotalElements(response.totalElements);
        } catch (error) {
            console.error('Error fetching AI configs:', error);
        }
    };

    useEffect(() => {
        fetchConfigs(currentPage);
    }, [currentPage, searchTerm]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleConfigCreate = async (newConfig) => {
        try {
            await AIProviderConfigService.save(newConfig);
            fetchConfigs(currentPage);
            setSelectedConfig(null);
        } catch (error) {
            alert('Error al crear config: ' + (error.response?.data || error.message));
        }
    };

    const handleConfigUpdate = async (updatedConfig) => {
        try {
            await AIProviderConfigService.update(updatedConfig.id, updatedConfig);
            fetchConfigs(currentPage);
            setSelectedConfig(null);
        } catch (error) {
            alert('Error al actualizar config: ' + (error.response?.data || error.message));
        }
    };

    const handleConfigDelete = async (configId) => {
        try {
            await AIProviderConfigService.delete(configId);
            fetchConfigs(currentPage);
            setConfigToDelete(null);
        } catch (error) {
            alert('Error al eliminar config: ' + (error.response?.data || error.message));
        }
    };

    const handleTestConfig = async (configId) => {
        setIsTesting(true);
        try {
            const result = await AIProviderConfigService.test(configId);
            setTestResult(result);
        } catch (error) {
            setTestResult({
                success: false,
                error: error.response?.data?.error || error.response?.data || error.message,
                status: error.response?.status
            });
        } finally {
            setIsTesting(false);
        }
    };

    const openConfirmModal = (config) => {
        setConfigToDelete(config);
        setIsModalOpen(true);
    };

    const confirmDeleteConfig = () => {
        if (configToDelete) {
            handleConfigDelete(configToDelete.id);
        }
        setIsModalOpen(false);
    };

    const getActions = () => {
        const actions = [];
        if (user?.authorities.includes('AIProviderConfig.read')) {
            actions.push({
                label: "Ver",
                icon: <ViewIcon className="h-4 w-4" />,
                onClick: (config) => setViewConfig(config),
            });
        }
        if (user?.authorities.includes('AIProviderConfig.update')) {
            actions.push({
                label: "Editar",
                icon: <EditIcon className="h-4 w-4" />,
                onClick: (config) => setSelectedConfig(config),
            });
        }
        if (user?.authorities.includes('AIProviderConfig.delete')) {
            actions.push({
                label: "Eliminar",
                icon: <DeleteIcon className="h-4 w-4" />,
                onClick: (config) => openConfirmModal(config),
            });
        }
        if (user?.authorities.includes('AIProviderConfig.read')) {
            actions.push({
                label: "Probar",
                icon: <PlayIcon className="h-4 w-4" />,
                onClick: (config) => handleTestConfig(config.id),
            });
        }
        return actions;
    };

    const columns = [
        { name: "id", label: "ID" },
        { name: "name", label: "Nombre" },
        { name: "providerType", label: "Tipo" },
        { name: "model", label: "Modelo" },
        { name: "priority", label: "Prioridad", align: 'center' },
        { 
            name: "enabled", 
            label: "Estado", 
            callback: (enabled) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {enabled ? 'ACTIVO' : 'INACTIVO'}
                </span>
            ) 
        },
    ];

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 bg-gray-50/50 min-h-screen">
            {viewConfig ? (
                <View config={viewConfig} setView={setViewConfig} />
            ) : selectedConfig ? (
                <Form
                    selectedConfig={selectedConfig}
                    handleConfigUpdate={handleConfigUpdate}
                    handleConfigCreate={handleConfigCreate}
                    setConfig={setSelectedConfig}
                />
            ) : (
                <div className="grid gap-6">
                    <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-bold text-gray-800">Proveedores de IA</h1>
                            <p className="text-gray-500 text-sm italic">Configuración de motores para el parseo inteligente</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="relative w-72">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar proveedor..."
                                    className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all shadow-none"
                                />
                            </div>
                            {user?.authorities.includes('AIProviderConfig.create') && (
                                <Button variant="primary" onClick={() => setSelectedConfig({})} className="bg-blue-600 hover:bg-blue-700 h-11 px-6 shadow-md shadow-blue-100 font-bold group">
                                    <PlusIcon className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" /> Nuevo Motor
                                </Button>
                            )}
                        </div>
                    </div>

                    <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
                        <CardContent className="p-0">
                            <TableData 
                                data={configs} 
                                columns={columns} 
                                actions={getActions()} 
                                totalElements={totalElements}
                                pageSize={pageSize}
                                onPageChange={handlePageChange}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDeleteConfig}
                title="Confirmar eliminación"
                message={`¿Estás seguro de que deseas eliminar el proveedor "${configToDelete?.name}"? Esta acción no se puede deshacer.`}
            />

            {(!!testResult || isTesting) && (
                <Modal onClose={() => setTestResult(null)} title="Prueba de Conexión IA">
                    <div className="p-6">
                        {isTesting ? (
                            <div className="flex flex-col items-center justify-center space-y-4 py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                <p className="text-gray-600 font-medium">Enviando petición de prueba...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className={`p-4 rounded-xl flex items-center gap-3 ${testResult?.success ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${testResult?.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {testResult?.success ? '✓' : '✗'}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold ${testResult?.success ? 'text-green-800' : 'text-red-800'}`}>
                                            {testResult?.success ? 'Conexión Exitosa' : 'Error de Conexión'}
                                        </h3>
                                        <p className="text-sm opacity-80">
                                            Status Code: <span className="font-mono">{testResult?.status}</span>
                                        </p>
                                    </div>
                                </div>

                                {testResult?.error && (
                                    <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Detalle del Error</p>
                                        <p className="text-sm text-red-600 font-mono break-words">{testResult.error}</p>
                                    </div>
                                )}

                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Respuesta del Motor</p>
                                    <pre className="text-xs bg-white p-3 rounded border border-gray-100 overflow-x-auto whitespace-pre-wrap max-h-48">
                                        {testResult?.response || 'Sin respuesta'}
                                    </pre>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button onClick={() => setTestResult(null)} className="bg-gray-800 hover:bg-gray-900 text-white font-bold h-11 px-8 rounded-xl">
                                        Cerrar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </main>
    );
};

export default AIProviderConfig;
