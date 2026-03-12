import { useEffect, useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TableData } from '../ui/table';
import { PlusIcon, DeleteIcon, EditIcon, SearchIcon, ViewIcon, MenuIcon } from '../ui/icons';
import Form from './form';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import CashInflowService from '../../services/CashInflowService';
import { AuthContext } from '../../services/Auth/AuthContext';
import { Input } from '../ui/input';
import CashInflowDetailsView from './view';

export default function CashInflows() {
    const [cashInflows, setCashInflows] = useState([]);
    const [filteredCashInflows, setFilteredCashInflows] = useState([]);
    const [selectedCashInflow, setSelectedCashInflow] = useState(null);
    const [viewCashInflow, setViewCashInflow] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cashInflowToDelete, setCashInflowToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const { user } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchCashInflows = async (page) => {
        try {
            const response = await CashInflowService.getAllCashInflows({ page, size: pageSize, q: searchTerm });
            setCashInflows(response.content);
            setTotalElements(response.totalElements);
            setFilteredCashInflows(response.content);
        } catch (error) {
            console.error('Error fetching cash inflows:', error);
        }
    };

    useEffect(() => {
        fetchCashInflows(currentPage);
    }, [currentPage, searchTerm]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleCashInflowCreate = async (newCashInflow) => {
        await CashInflowService.save(newCashInflow).then(() => {
            fetchCashInflows(currentPage);
            setSelectedCashInflow(null);
        }).catch((error) => {
            console.error('Error creating cash inflow:', error);
            alert('Error en la solicitud');
        });
    };

    const handleCashInflowUpdate = async (updatedCashInflow) => {
        try {
            const cashInflow = await CashInflowService.update(updatedCashInflow.id, updatedCashInflow);
            const updatedCashInflows = cashInflows.map((c) =>
                c.id === updatedCashInflow.id ? cashInflow : c
            );
            setCashInflows(updatedCashInflows);
            setSelectedCashInflow(null);
        } catch (error) {
            console.error('Error updating cash inflow:', error);
        }
    };

    const handleCashInflowDelete = async (cashInflowId) => {
        try {
            await CashInflowService.delete(cashInflowId);
            const updatedCashInflows = cashInflows.filter((c) => c.id !== cashInflowId);
            setCashInflows(updatedCashInflows);
            setSelectedCashInflow(null);
        } catch (error) {
            console.error('Error deleting cash inflow:', error);
        }
    };

    const openConfirmModal = (cashInflow) => {
        setCashInflowToDelete(cashInflow);
        setIsModalOpen(true);
    };

    const confirmDeleteCashInflow = () => {
        if (cashInflowToDelete) {
            handleCashInflowDelete(cashInflowToDelete.id);
        }
        setIsModalOpen(false);
    };

    const getActions = () => {
        const actions = [];
        if (user?.authorities.includes('CashInflow.read')) {
            actions.push({
                label: "Ver",
                icon: <ViewIcon className="h-4 w-4" />,
                onClick: (cashInflow) => setViewCashInflow(cashInflow),
            });
        }
        if (user?.authorities.includes('CashInflow.update')) {
            actions.push({
                label: "Editar",
                icon: <EditIcon className="h-4 w-4" />,
                onClick: (cashInflow) => setSelectedCashInflow(cashInflow),
            });
        }
        if (user?.authorities.includes('CashInflow.delete')) {
            actions.push({
                label: "Eliminar",
                icon: <DeleteIcon className="h-4 w-4" />,
                onClick: (cashInflow) => openConfirmModal(cashInflow),
            });
        }
        return actions;
    };

    const columns = [
        { name: "id", label: "ID" },
        { name: "description", label: "Descripción" },
        { name: "amount", label: "Monto" },
        { name: "date", label: "Fecha" },
    ];

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    };

    const formattedData = filteredCashInflows.map(item => ({
        ...item,
        date: formatDate(item.date)
    }));

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            {viewCashInflow ? (
                <CashInflowDetailsView
                    selectedCashInflow={viewCashInflow}
                    setCashInflow={setViewCashInflow}
                />
            ) : selectedCashInflow ? (
                <Form
                    selectedCashInflow={selectedCashInflow}
                    handleCashInflowUpdate={handleCashInflowUpdate}
                    handleCashInflowCreate={handleCashInflowCreate}
                    setCashInflow={setSelectedCashInflow}
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
                        <div className="flex gap-2">
                            {user?.authorities.includes('CashInflow.create') && (
                                <Button key={2} variant="primary" onClick={() => setSelectedCashInflow({})}>
                                    <PlusIcon className="h-4 w-4 mr-1" /> Crear Entrada de Efectivo
                                </Button>
                            )}
                        </div>
                    </div>

                    <Card>
                        <CardContent>
                            <TableData
                                data={formattedData}
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
                onConfirm={confirmDeleteCashInflow}
                title="Confirmar eliminación"
                message="¿Estás seguro de que deseas eliminar esta entrada de efectivo?"
            />
        </main>
    );
}
