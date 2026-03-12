import { useEffect, useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TableData } from '../ui/table';
import { PlusIcon, DeleteIcon, EditIcon, SearchIcon, ViewIcon } from '../ui/icons';
import Form from './form'; // Asegúrate de tener un componente Form para crear/editar proveedores
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import SupplierService from '../../services/SupplierService'; 
import { AuthContext } from '../../services/Auth/AuthContext';
import { Input } from '../ui/input';
import SupplierDetailsView from './view'; // Componente para ver detalles del proveedor

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [filteredSuppliers, setFilteredSuppliers] = useState([]); // Estado para proveedores filtrados
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [viewSupplier, setViewSupplier] = useState(null); // Estado para ver detalles del proveedor
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [supplierToDelete, setSupplierToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(0); 
    const [pageSize] = useState(10); 
    const [totalElements, setTotalElements] = useState(0); 
    const { user } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState(""); // Estado para la barra de búsqueda

    const fetchSuppliers = async (page) => {
        try {
            const response = await SupplierService.getAllSuppliers({ page, size: pageSize, q: searchTerm });
            setSuppliers(response.content); 
            setTotalElements(response.totalElements); 
            setFilteredSuppliers(response.content); // Inicializar también los proveedores filtrados
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        }
    };

    useEffect(() => {
        fetchSuppliers(currentPage); // Llamada a la función de carga de proveedores
    }, [currentPage, searchTerm]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage); // Actualizar la página actual
    };

    const handleSupplierCreate = async (newSupplier) => {
        await SupplierService.save(newSupplier).then(() => {
            fetchSuppliers(currentPage);
            setSelectedSupplier(null);
        }).catch((error) => {
            console.error('Error creating supplier:', error);
            alert('Error en la solicitud');
        });
        
    };

    const handleSupplierUpdate = async (updatedSupplier) => {
        try {
            const supplier = await SupplierService.update(updatedSupplier.id, updatedSupplier);
            const updatedSuppliers = suppliers.map((s) => 
                s.id === updatedSupplier.id ? supplier : s
            );
            setSuppliers(updatedSuppliers);
            setSelectedSupplier(null);
        } catch (error) {
            console.error('Error updating supplier:', error);
        }
    };

    const handleSupplierDelete = async (supplierId) => {
        try {
            await SupplierService.delete(supplierId);
            const updatedSuppliers = suppliers.filter((s) => s.id !== supplierId);
            setSuppliers(updatedSuppliers);
            setSelectedSupplier(null);
        } catch (error) {
            console.error('Error deleting supplier:', error);
        }
    };

    const openConfirmModal = (supplier) => {
        setSupplierToDelete(supplier);
        setIsModalOpen(true);
    };
    
    const confirmDeleteSupplier = () => {
        if (supplierToDelete) {
            handleSupplierDelete(supplierToDelete.id);
        }
        setIsModalOpen(false);
    };

    const getActions = () => {
        const actions = [];
        if (user?.authorities.includes('Supplier.read')) {
            actions.push({
                label: "Ver",
                icon: <ViewIcon className="h-4 w-4" />,
                onClick: (supplier) => setViewSupplier(supplier),
            });
        }
        if (user?.authorities.includes('Supplier.update')) {
            actions.push({
                label: "Editar",
                icon: <EditIcon className="h-4 w-4" />,
                onClick: (supplier) => setSelectedSupplier(supplier),
            });
        }
        if (user?.authorities.includes('Supplier.delete')) {
            actions.push({
                label: "Eliminar",
                icon: <DeleteIcon className="h-4 w-4" />,
                onClick: (supplier) => openConfirmModal(supplier),
            });
        }
        return actions;
    };

    const columns = [
        { name: "id", label: "ID" },
        { name: "name", label: "Nombre" },
        { name: "phone", label: "Teléfono" },
        { name: "address", label: "Dirección" },
        { name: "ruc", label: "RUC" },
        { name: "email", label: "Email" },
    ];

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            { viewSupplier ? (
                <SupplierDetailsView 
                    selectedSupplier={viewSupplier}
                    setSupplier={setViewSupplier}
                />
            ) : selectedSupplier ? (
                <Form
                    selectedSupplier={selectedSupplier}
                    handleSupplierUpdate={handleSupplierUpdate}
                    handleSupplierCreate={handleSupplierCreate}
                    setSupplier={setSelectedSupplier}
                />
            ) : (
                <div className="grid gap-4 md:gap-8">
                    <div className="flex justify-between items-center">
                        <div className="relative w-80">
                            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Búsqueda"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-background shadow-none appearance-none pl-8 md:w-2/3 lg:w-3/3"
                            />
                        </div>
                        {user?.authorities.includes('Supplier.create') && (
                            <Button variant="primary" onClick={() => setSelectedSupplier({})}>
                                <PlusIcon className="h-4 w-4 mr-1" /> Crear Proveedor
                            </Button>
                        )}
                    </div>

                    <Card>
                        <CardContent>
                            <TableData 
                                data={filteredSuppliers} // Usar proveedores filtrados
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
                onConfirm={confirmDeleteSupplier}
                title="Confirmar eliminación"
                message="¿Estás seguro de que deseas eliminar este proveedor?"
            />
        </main>
    );
}
