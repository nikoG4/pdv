import { useEffect, useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TableData } from '../ui/table';
import PurchaseService from '../../services/PurchaseService';
import Form from './form'; 
import { AuthContext } from '../../services/Auth/AuthContext';
import { DeleteIcon, EditIcon, MenuIcon, PlusIcon, SearchIcon, ViewIcon } from '../ui/icons';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Input } from '../ui/input'; // Input para búsqueda
import PurchaseProductsReport from './report';
import PurchaseProductsView from './view';

const PurchaseProducts = () => {
    const [purchases, setPurchases] = useState([]);
    const [filteredPurchases, setFilteredPurchases] = useState([]); // Para la lista filtrada
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [viewPurchase, setViewPurchase] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [purchaseToDelete, setPurchaseToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [searchQuery, setSearchQuery] = useState(''); // Estado para la búsqueda
    const { user } = useContext(AuthContext);
    const [isReportVisible, setIsReportVisible] = useState(false);


    const fetchPurchases = async (page) => {
        try {
            const response = await PurchaseService.getAllPurchases({ page, size: pageSize, q: searchQuery });
            setPurchases(response.content);
            setFilteredPurchases(response.content); // Inicialmente mostrar todas
            setTotalElements(response.totalElements);
        } catch (error) {
            console.error('Error fetching purchases:', error);
        }
    };

    useEffect(() => {
        fetchPurchases(currentPage);
    }, [currentPage, searchQuery]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handlePurchaseCreate = async (newPurchase) => {
        try {
            const createdPurchase = await PurchaseService.save(newPurchase);
            setPurchases((prevPurchases) => [...prevPurchases, createdPurchase]);
            setFilteredPurchases((prevPurchases) => [...prevPurchases, createdPurchase]); // Actualizar lista filtrada
            setSelectedPurchase(null); // Limpiar selección después de crear
        } catch (error) {
            console.error('Error creating purchase:', error);
        }
    };

    const handlePurchaseUpdate = async (updatedPurchase) => {
        try {
            const purchase = await PurchaseService.update(updatedPurchase.id, updatedPurchase);
            const updatedPurchases = purchases.map((p) =>
                p.id === updatedPurchase.id ? purchase : p
            );
            setPurchases(updatedPurchases);
            setFilteredPurchases(updatedPurchases); // Actualizar lista filtrada
            setSelectedPurchase(null); // Limpiar selección después de actualizar
        } catch (error) {
            console.error('Error updating purchase:', error);
        }
    };

    const handlePurchaseDelete = async (purchaseId) => {
        try {
            await PurchaseService.delete(purchaseId);
            const updatedPurchases = purchases.filter((p) => p.id !== purchaseId);
            setPurchases(updatedPurchases);
            setFilteredPurchases(updatedPurchases); // Actualizar lista filtrada
            setSelectedPurchase(null);
        } catch (error) {
            console.error('Error deleting purchase:', error);
        }
    };

    const openConfirmModal = (purchase) => {
        setPurchaseToDelete(purchase);
        setIsModalOpen(true);
    };

    const confirmDeletePurchase = () => {
        if (purchaseToDelete) {
            handlePurchaseDelete(purchaseToDelete.id);
        }
        setIsModalOpen(false);
    };

    const getActions = () => {
        const actions = [];
        if (user?.authorities.includes('ProductPurchase.read')) {
            actions.push({
                label: "Ver",
                icon: <ViewIcon className="h-4 w-4"/>,
                onClick: (purchase) => setViewPurchase(purchase),
            });
        }
        if (user?.authorities.includes('ProductPurchase.update')) {
            actions.push({
                label: "Editar",
                icon: <EditIcon className="h-4 w-4"/>,
                onClick: (purchase) => setSelectedPurchase(purchase),
            });
        }
        if (user?.authorities.includes('ProductPurchase.delete')) {
            actions.push({
                label: "Eliminar",
                icon: <DeleteIcon className="h-4 w-4"/>,
                onClick: (purchase) => openConfirmModal(purchase),
            });
        }
        return actions;
    };

    const columns = [
        { name: "id", label: "ID" },
        { name: "date", label: "Fecha", callback: (date) => {return new Date(`${date} `).toLocaleDateString('es-ES', { timeZone: 'America/Asuncion' })}},
        { name: "invoiceNumber", label: "Número de Factura" },
        { name: "supplier.name", label: "Proveedor" },
        { name: "total", label: "Total" , callback: (total) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'PYG' }).format(total) },
    ];

    // Función para manejar la búsqueda
    const handleSearch = (event) => {
        const searchQuery = event.target.value;
        setSearchQuery(searchQuery);
    };

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            { viewPurchase ? (
                <PurchaseProductsView selectedPurchase={viewPurchase} setViewPurchase={setViewPurchase}  />
            ): isReportVisible ? (
                <PurchaseProductsReport setIsReportVisible={setIsReportVisible} />
            ) : selectedPurchase ? (
                <Form
                    selectedPurchase={selectedPurchase}
                    handlePurchaseUpdate={handlePurchaseUpdate}
                    handlePurchaseCreate={handlePurchaseCreate}
                    setPurchase={setSelectedPurchase}
                />
            ) : (
                <div className="grid gap-4 md:gap-8">
                    <div className="flex justify-between items-center">
                        <div className="relative w-80">
                            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Búsqueda"
                                value={searchQuery}
                                onChange={handleSearch} // Escuchar cambios en el input
                                className="w-full bg-background shadow-none appearance-none pl-8 md:w-2/3 lg:w-3/3"
                            />
                        </div>
                        <div className="flex gap-2">
                            {user?.authorities.includes('ProductPurchase.read') && (
                                <Button
                                    key={1}
                                    variant="primary"
                                    onClick={() => setIsReportVisible(true)} // Mostrar el reporte al hacer clic
                                >
                                    <MenuIcon className="h-4 w-4 mr-1" />Reporte
                                </Button>
                            )}
                            {user?.authorities.includes('ProductPurchase.create') && (
                                <Button variant="primary" onClick={() => setSelectedPurchase({})}>
                                    <PlusIcon className="h-4 w-4 mr-1" /> Nueva compra
                                </Button>
                            )}
                        </div>
                    </div>
                    <Card>
                        <CardContent>
                            <TableData 
                                data={filteredPurchases} // Mostrar solo compras filtradas
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
                onConfirm={confirmDeletePurchase}
                title="Confirmar eliminación"
                message="¿Estás seguro de que deseas eliminar esta compra?"
            />
        </main>
    );
    
};

export default PurchaseProducts;
