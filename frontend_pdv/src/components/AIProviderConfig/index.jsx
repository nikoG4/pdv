import { useEffect, useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TableData } from '../ui/table';
import AIProviderConfigService from '../../services/AIProviderConfigService';
import Form from './form';
import { AuthContext } from '../../services/Auth/AuthContext';
import { DeleteIcon, EditIcon, PlusIcon, SearchIcon, ViewIcon } from '../ui/icons';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
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
        </main>
    );
};

export default AIProviderConfig;
