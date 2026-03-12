import { useEffect, useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TableData } from '../ui/table';
import { PlusIcon, DeleteIcon, EditIcon, SearchIcon, ViewIcon, MenuIcon } from '../ui/icons';
import Form from './form';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import CashOutflowService from '../../services/CashOutflowService';
import { AuthContext } from '../../services/Auth/AuthContext';
import { Input } from '../ui/input';
import CashOutflowDetailsView from './view';
import CashOutflowsReport from './report';

export default function CashOutflows() {
    const [cashOutflows, setCashOutflows] = useState([]);
    const [filteredCashOutflows, setFilteredCashOutflows] = useState([]);
    const [selectedCashOutflow, setSelectedCashOutflow] = useState(null);
    const [viewCashOutflow, setViewCashOutflow] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cashOutflowToDelete, setCashOutflowToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const { user } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState("");
    const [isReportVisible, setIsReportVisible] = useState(false);
    const [file, setFile] = useState(null);

    const fetchCashOutflows = async (page) => {
        try {
            const response = await CashOutflowService.getAllCashOutflows({ page, size: pageSize, q: searchTerm });
            setCashOutflows(response.content);
            setTotalElements(response.totalElements);
            setFilteredCashOutflows(response.content);
        } catch (error) {
            console.error('Error fetching cash outflows:', error);
        }
    };

    useEffect(() => {
        fetchCashOutflows(currentPage);
    }, [currentPage, searchTerm]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleCashOutflowCreate = async (newCashOutflow) => {
        await CashOutflowService.save(newCashOutflow).then(() => {
            fetchCashOutflows(currentPage);
            setSelectedCashOutflow(null);
        }).catch((error) => {
            console.error('Error creating cash outflow:', error);
            alert('Error en la solicitud');
        });
    };

    const handleCashOutflowUpdate = async (updatedCashOutflow) => {
        try {
            const cashOutflow = await CashOutflowService.update(updatedCashOutflow.id, updatedCashOutflow);
            const updatedCashOutflows = cashOutflows.map((c) =>
                c.id === updatedCashOutflow.id ? cashOutflow : c
            );
            setCashOutflows(updatedCashOutflows);
            setSelectedCashOutflow(null);
        } catch (error) {
            console.error('Error updating cash outflow:', error);
        }
    };

    const handleCashOutflowDelete = async (cashOutflowId) => {
        try {
            await CashOutflowService.delete(cashOutflowId);
            const updatedCashOutflows = cashOutflows.filter((c) => c.id !== cashOutflowId);
            setCashOutflows(updatedCashOutflows);
            setSelectedCashOutflow(null);
        } catch (error) {
            console.error('Error deleting cash outflow:', error);
        }
    };

    const openConfirmModal = (cashOutflow) => {
        setCashOutflowToDelete(cashOutflow);
        setIsModalOpen(true);
    };

    const confirmDeleteCashOutflow = () => {
        if (cashOutflowToDelete) {
            handleCashOutflowDelete(cashOutflowToDelete.id);
        }
        setIsModalOpen(false);
    };

    const getActions = () => {
        const actions = [];
        if (user?.authorities.includes('CashOutflow.read')) {
            actions.push({
                label: "Ver",
                icon: <ViewIcon className="h-4 w-4" />,
                onClick: (cashOutflow) => setViewCashOutflow(cashOutflow),
            });
        }
        if (user?.authorities.includes('CashOutflow.update')) {
            actions.push({
                label: "Editar",
                icon: <EditIcon className="h-4 w-4" />,
                onClick: (cashOutflow) => setSelectedCashOutflow(cashOutflow),
            });
        }
        if (user?.authorities.includes('CashOutflow.delete')) {
            actions.push({
                label: "Eliminar",
                icon: <DeleteIcon className="h-4 w-4" />,
                onClick: (cashOutflow) => openConfirmModal(cashOutflow),
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

    const formattedData = filteredCashOutflows.map(item => ({
        ...item,
        date: formatDate(item.date)
    }));

    const getReport = async (params) => {
        try {
            const response = await CashOutflowService.getReport(params);
            setFile(response);
            setIsReportVisible(true);
        } catch (error) {
            console.error('Error al obtener el reporte:', error);
        }
    };

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            {isReportVisible ? (
                <CashOutflowsReport setIsReportVisible={setIsReportVisible} file={file} />
            ) : viewCashOutflow ? (
                <CashOutflowDetailsView
                    selectedCashOutflow={viewCashOutflow}
                    setCashOutflow={setViewCashOutflow}
                />
            ) : selectedCashOutflow ? (
                <Form
                    selectedCashOutflow={selectedCashOutflow}
                    handleCashOutflowUpdate={handleCashOutflowUpdate}
                    handleCashOutflowCreate={handleCashOutflowCreate}
                    setCashOutflow={setSelectedCashOutflow}
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
                            {user?.authorities.includes('CashOutflow.read') && (
                                <Button
                                    key={1}
                                    variant="primary"
                                    onClick={() => getReport({ report: 'cash-outflows' })}
                                >
                                    <MenuIcon className="h-4 w-4 mr-1" /> Reporte de Salidas
                                </Button>
                            )}
                            {user?.authorities.includes('CashOutflow.create') && (
                                <Button key={2} variant="primary" onClick={() => setSelectedCashOutflow({})}>
                                    <PlusIcon className="h-4 w-4 mr-1" /> Crear Salida de Efectivo
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
                onConfirm={confirmDeleteCashOutflow}
                title="Confirmar eliminación"
                message="¿Estás seguro de que deseas eliminar esta salida de efectivo?"
            />
        </main>
    );
}