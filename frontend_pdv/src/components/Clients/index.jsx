import { useEffect, useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TableData } from '../ui/table';
import { PlusIcon, DeleteIcon, EditIcon, SearchIcon, ViewIcon } from '../ui/icons';
import Form from './form';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import ClientService from '../../services/ClientService'; 
import { AuthContext } from '../../services/Auth/AuthContext';
import { Input } from '../ui/input';
import ClientDetailsView from './view';

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]); // Estado para clientes filtrados
    const [selectedClient, setSelectedClient] = useState(null);
    const [viewClient, setViewClient] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(0); 
    const [pageSize] = useState(10); 
    const [totalElements, setTotalElements] = useState(0); 
    const { user } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState(""); // Estado para la barra de búsqueda

    const fetchClients = async (page) => {
        try {
            const response = await ClientService.getAllClients({ page, size: pageSize, q: searchTerm });
            setClients(response.content); 
            setTotalElements(response.totalElements); 
            setFilteredClients(response.content); // Inicializar también los clientes filtrados
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    useEffect(() => {
        fetchClients(currentPage); // Llamada a la función de carga de clientes
    }, [currentPage, searchTerm]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage); // Actualizar la página actual
    };

    const handleClientCreate = async (newClient) => {
       
            await ClientService.save(newClient).then(() => {
                fetchClients(currentPage);
                setSelectedClient(null);
            }).catch((error) => {
                console.error('Error creating client:', error);
                alert('Error en la solicitud');
            })

    };

    const handleClientUpdate = async (updatedClient) => {
        try {
            const client = await ClientService.update(updatedClient.id, updatedClient);
            const updatedClients = clients.map((c) => 
                c.id === updatedClient.id ? client : c
            );
            setClients(updatedClients);
            setSelectedClient(null);
        } catch (error) {
            console.error('Error updating client:', error);
        }
    };

    const handleClientDelete = async (clientId) => {
        try {
            await ClientService.delete(clientId);
            const updatedClients = clients.filter((c) => c.id !== clientId);
            setClients(updatedClients);
            setSelectedClient(null);
        } catch (error) {
            console.error('Error deleting client:', error);
        }
    };

    const openConfirmModal = (client) => {
        setClientToDelete(client);
        setIsModalOpen(true);
    };
    
    const confirmDeleteClient = () => {
        if (clientToDelete) {
            handleClientDelete(clientToDelete.id);
        }
        setIsModalOpen(false);
    };

    const getActions = () => {
        const actions = [];
        if (user?.authorities.includes('Client.read')) {
            actions.push({
                label: "Ver",
                icon: <ViewIcon className="h-4 w-4"/>,
                onClick: (client) => setViewClient(client),
            });
        }
        if (user?.authorities.includes('Client.update')) {
            actions.push({
                label: "Editar",
                icon: <EditIcon className="h-4 w-4"/>,
                onClick: (client) => setSelectedClient(client),
            });
        }
        if (user?.authorities.includes('Client.delete')) {
            actions.push({
                label: "Eliminar",
                icon: <DeleteIcon className="h-4 w-4"/>,
                onClick: (client) => openConfirmModal(client),
            });
        }
        return actions;
    };

    const columns = [
        { name: "id", label: "ID" },
        { name: "name", label: "Nombre" },
        { name: "phone", label: "Telefono" },
        { name: "address", label: "Dirección" },
        { name: "ruc", label: "RUC" },
        { name: "email", label: "Email" },
    ];

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            { viewClient ?(
                <ClientDetailsView 
                    selectedClient={viewClient}
                    setClient={setViewClient}
                />

            ) : selectedClient ? (
                <Form
                    selectedClient={selectedClient}
                    handleClientUpdate={handleClientUpdate}
                    handleClientCreate={handleClientCreate}
                    setClient={setSelectedClient}
                />
            ) : (
                <div className="grid gap-4 md:gap-8">
                    <div className="flex justify-between items-center">
                        <div className="relative w-80">
                            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Búsqueda"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-background shadow-none appearance-none pl-8 md:w-2/3 lg:w-3/3"
                            />
                        </div>
                        {user?.authorities.includes('Client.create') && (
                            <Button variant="primary" onClick={() => setSelectedClient({})}>
                                <PlusIcon className="h-4 w-4 mr-1" /> Crear Cliente
                            </Button>
                        )}
                    </div>

                    <Card>
                        <CardContent>
                            <TableData 
                                data={filteredClients} // Usar clientes filtrados
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
                onConfirm={confirmDeleteClient}
                title="Confirmar eliminación"
                message="¿Estás seguro de que deseas eliminar este cliente?"
            />
        </main>
    );
}
