import { useEffect, useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TableData } from '../ui/table';
import SaleService from '../../services/SaleService';
import Form from './form'; 
import { AuthContext } from '../../services/Auth/AuthContext';
import { DeleteIcon, EditIcon, MenuIcon, PlusIcon, PrintIcon, SearchIcon, ViewIcon } from '../ui/icons';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Input } from '../ui/input'; // Input para búsqueda
import SaleProductsReport from './report';
import SaleProductsView from './view';

const SaleProducts = () => {
    const [sales, setSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]); // Para la lista filtrada
    const [selectedSale, setSelectedSale] = useState(null);
    const [viewSale, setViewSale] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saleToDelete, setSaleToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [searchQuery, setSearchQuery] = useState(''); // Estado para la búsqueda
    const { user } = useContext(AuthContext);
    const [isReportVisible, setIsReportVisible] = useState(false);
    

    const fetchSales = async (page) => {
        try {
            const response = await SaleService.getAllSales({ page, size: pageSize, q: searchQuery });
            setSales(response.content);
            setFilteredSales(response.content); // Inicialmente mostrar todas
            setTotalElements(response.totalElements);
        } catch (error) {
            console.error('Error fetching sales:', error);
        }
    };

    useEffect(() => {
        fetchSales(currentPage);
    }, [currentPage, searchQuery]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handlePrint = async (id) => {

        if(localStorage.getItem('printOnServer') === 'true'){            
            await SaleService.print(id).
            then((response) => {
                alert('Impreso');    
            }).catch((error) => {
                alert('Error en la impresión');
                console.error('Error printing sale:', error);
            });
        }else{

            const params = {
                id: id,
                report: 'ticket'    
            };

            await SaleService.getReport(params).
            then((response) => {
                // Asegúrate de que el response sea un Blob
                const blob = new Blob([response], { type: 'application/pdf' });
    
                // Crea una URL para el Blob
                const url = window.URL.createObjectURL(blob);
                
                // Abre el PDF en una nueva pestaña para imprimir
                const newWindow = window.open(url, '_blank');
                
                // En algunos navegadores, puedes forzar el diálogo de impresión cuando se abre
                if (newWindow) {
                    newWindow.onload = () => {
                        newWindow.print();
                    };
                }

                // Libera la URL del Blob cuando ya no sea necesaria
                newWindow.onbeforeunload = () => window.URL.revokeObjectURL(url);
                
            }).catch((error) => {
                alert('Error en la impresión');
                console.error('Error printing sale:', error);
            })
        }
    };
    

    const handleSaleCreate = async (sale, printOnSave) => {
        try {
            const createdSale = await SaleService.save(sale);
            setSales((prevSales) => [...prevSales, createdSale]);
            setFilteredSales((prevSales) => [...prevSales, createdSale]);
            
            if (printOnSave) {
                handlePrint(createdSale.id);
            }

            setSelectedSale(null);  

        } catch (error) {
            console.error('Error creating sale:', error);
        }
    };

    const handleSaleUpdate = async (updatedSale) => {
        console.log( updatedSale);
        try {
            const sale = await SaleService.update(updatedSale.id, updatedSale);
            const updatedSales = sales.map((p) =>
                p.id === updatedSale.id ? sale : p
            );
            setSales(updatedSales);
            setFilteredSales(updatedSales); // Actualizar lista filtrada
            setSelectedSale(null); // Limpiar selección después de actualizar
        } catch (error) {
            console.error('Error updating sale:', error);
        }
    };

    const handleSaleDelete = async (saleId) => {
        try {
            await SaleService.delete(saleId);
            const updatedSales = sales.filter((p) => p.id !== saleId);
            setSales(updatedSales);
            setFilteredSales(updatedSales); // Actualizar lista filtrada
            setSelectedSale(null);
        } catch (error) {
            console.error('Error deleting sale:', error);
        }
    };

    const openConfirmModal = (sale) => {
        setSaleToDelete(sale);
        setIsModalOpen(true);
    };

    const confirmDeleteSale = () => {
        if (saleToDelete) {
            handleSaleDelete(saleToDelete.id);
        }
        setIsModalOpen(false);
    };

    const getActions = () => {
        const actions = [];
        if (user?.authorities.includes('ProductSale.read')) {
            actions.push({
                label: "Ver",
                icon: <ViewIcon className="h-4 w-4"/>,
                onClick: (sale) => setViewSale(sale),
            });
        }

        if (user?.authorities.includes('ProductSale.read')) {
            actions.push({
                label: "Imprimir",
                icon: <PrintIcon className="h-4 w-4"/>,
                onClick: (sale) => handlePrint(sale.id),
            });
        }

        if (user?.authorities.includes('ProductSale.update')) {
            actions.push({
                label: "Editar",
                icon: <EditIcon className="h-4 w-4"/>,
                onClick: (sale) => setSelectedSale(sale),
            });
        }

        if (user?.authorities.includes('ProductSale.delete')) {
            actions.push({
                label: "Eliminar",
                icon: <DeleteIcon className="h-4 w-4"/>,
                onClick: (sale) => openConfirmModal(sale),
            });
        }

        return actions;
    };

    const columns = [
        { name: "id", label: "ID" },
        { name: "date", label: "Fecha", callback: (date) => {return new Date(`${date} `).toLocaleDateString('es-ES', { timeZone: 'America/Asuncion' })}},
        { name: "invoiceNumber", label: "Número de Factura" },
        { name: "client.name", label: "Cliente" },
        { name: "total", label: "Total" , callback: (total) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'PYG' }).format(total) },
    ];

    const handleSearch = (event) => {
        const searchQuery = event.target.value;
        setSearchQuery(searchQuery);
    };

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            { 
            viewSale ? 
                <SaleProductsView selectedSale={viewSale} setSale={setViewSale} /> :
            isReportVisible ?
                <SaleProductsReport setIsReportVisible={setIsReportVisible} /> :
            selectedSale ? 
                <Form
                    selectedSale={selectedSale}
                    handleSaleUpdate={handleSaleUpdate}
                    handleSaleCreate={handleSaleCreate}
                    setSale={setSelectedSale}
                />
             : 
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
                            {user?.authorities.includes('ProductSale.read') && (
                                <Button key={1} variant="primary"  onClick={() => setIsReportVisible(true)} >
                                    <MenuIcon className="h-4 w-4 mr-1" />Reporte
                                </Button>
                            )}
                            {user?.authorities.includes('ProductSale.create') && (
                                <Button variant="primary" onClick={() => setSelectedSale({})}>
                                    <PlusIcon className="h-4 w-4 mr-1" /> Nueva venta
                                </Button>
                            )}
                        </div>
                    </div>
                    <Card>
                        <CardContent>
                            <TableData 
                                data={filteredSales} // Mostrar solo compras filtradas
                                columns={columns} 
                                actions={getActions()} 
                                totalElements={totalElements}
                                pageSize={pageSize}
                                onPageChange={handlePageChange}
                            />
                        </CardContent>
                    </Card>
                </div>
            }
            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDeleteSale}
                title="Confirmar eliminación"
                message="¿Estás seguro de que deseas eliminar esta compra?"
            />
        </main>
    );
};

export default SaleProducts;
