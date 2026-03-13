import { useContext, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Input } from '../ui/input';
import { TableData } from '../ui/table';
import { DeleteIcon, EditIcon, MenuIcon, PlusIcon, PrintIcon, SearchIcon, ViewIcon } from '../ui/icons';
import { AuthContext } from '../../services/Auth/AuthContext';
import SaleService from '../../services/SaleService';
import Form from './form';
import SaleProductsPos from './pos';
import SaleProductsReport from './report';
import SaleProductsView from './view';

const SALE_MODE_STORAGE_KEY = 'sales-mode';
const SALES_LAYOUT_EVENT = 'sales-pos-layout-changed';

const parseConfiguredUsers = (value) =>
  (value || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const getInitialMode = (username, canCreate) => {
  if (!canCreate) {
    return 'table';
  }

  const configuredUsers = parseConfiguredUsers(localStorage.getItem('salesPosDefaultUsers'));
  if (configuredUsers.includes((username || '').toLowerCase())) {
    return 'pos';
  }

  return localStorage.getItem(SALE_MODE_STORAGE_KEY) === 'pos' ? 'pos' : 'table';
};

const modeButtonClassName = (isActive) =>
  `rounded-lg px-4 py-2 text-sm shadow-none ${
    isActive
      ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
      : 'bg-transparent text-slate-500 hover:bg-white/70 hover:text-slate-900'
  }`;

const SaleProducts = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [viewSale, setViewSale] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isReportVisible, setIsReportVisible] = useState(false);
  const { user } = useContext(AuthContext);
  const canCreate = user?.authorities.includes('ProductSale.create');
  const canRead = user?.authorities.includes('ProductSale.read');
  const canUpdate = user?.authorities.includes('ProductSale.update');
  const canDelete = user?.authorities.includes('ProductSale.delete');
  const [saleMode, setSaleMode] = useState(() => getInitialMode(user?.username, canCreate));

  const fetchSales = async (page) => {
    try {
      const response = await SaleService.getAllSales({ page, size: pageSize, q: searchQuery });
      setSales(response.content);
      setFilteredSales(response.content);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  useEffect(() => {
    fetchSales(currentPage);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    localStorage.setItem(SALE_MODE_STORAGE_KEY, saleMode);
  }, [saleMode]);

  useEffect(() => {
    setSaleMode(getInitialMode(user?.username, canCreate));
  }, [user, canCreate]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePrint = async (id) => {
    if (localStorage.getItem('printOnServer') === 'true') {
      await SaleService.print(id)
        .then(() => {
          alert('Impreso');
        })
        .catch((error) => {
          alert('Error en la impresion');
          console.error('Error printing sale:', error);
        });
      return;
    }

    const params = {
      id,
      report: 'ticket',
    };

    await SaleService.getReport(params)
      .then((response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const newWindow = window.open(url, '_blank');

        if (newWindow) {
          newWindow.onload = () => {
            newWindow.print();
          };
          newWindow.onbeforeunload = () => window.URL.revokeObjectURL(url);
        }
      })
      .catch((error) => {
        alert('Error en la impresion');
        console.error('Error printing sale:', error);
      });
  };

  const handleSaleCreate = async (sale, printOnSave) => {
    try {
      const createdSale = await SaleService.save(sale);
      setSales((prevSales) => [...prevSales, createdSale]);
      setFilteredSales((prevSales) => [...prevSales, createdSale]);
      setTotalElements((prevTotal) => prevTotal + 1);

      if (printOnSave) {
        await handlePrint(createdSale.id);
      }

      setSelectedSale(null);
      return createdSale;
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  };

  const handleSaleUpdate = async (updatedSale) => {
    try {
      const sale = await SaleService.update(updatedSale.id, updatedSale);
      const updatedSales = sales.map((item) => (item.id === updatedSale.id ? sale : item));
      setSales(updatedSales);
      setFilteredSales(updatedSales);
      setSelectedSale(null);
      return sale;
    } catch (error) {
      console.error('Error updating sale:', error);
      throw error;
    }
  };

  const handleSaleDelete = async (saleId) => {
    try {
      await SaleService.delete(saleId);
      const updatedSales = sales.filter((item) => item.id !== saleId);
      setSales(updatedSales);
      setFilteredSales(updatedSales);
      setTotalElements((prevTotal) => Math.max(prevTotal - 1, 0));
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

  const openPosMode = () => {
    setViewSale(null);
    setIsReportVisible(false);
    setSelectedSale({});
    setSaleMode('pos');
  };

  const openTableMode = () => {
    setSelectedSale(null);
    setSaleMode('table');
  };

  const getActions = () => {
    const actions = [];

    if (canRead) {
      actions.push({
        label: 'Ver',
        icon: <ViewIcon className="h-4 w-4" />,
        onClick: (sale) => setViewSale(sale),
      });
    }

    if (canRead) {
      actions.push({
        label: 'Imprimir',
        icon: <PrintIcon className="h-4 w-4" />,
        onClick: (sale) => handlePrint(sale.id),
      });
    }

    if (canUpdate) {
      actions.push({
        label: 'Editar',
        icon: <EditIcon className="h-4 w-4" />,
        onClick: (sale) => {
          setSelectedSale(sale);
          setSaleMode('table');
        },
      });
    }

    if (canDelete) {
      actions.push({
        label: 'Eliminar',
        icon: <DeleteIcon className="h-4 w-4" />,
        onClick: (sale) => openConfirmModal(sale),
      });
    }

    return actions;
  };

  const columns = [
    { name: 'id', label: 'ID' },
    {
      name: 'date',
      label: 'Fecha',
      callback: (date) => new Date(`${date} `).toLocaleDateString('es-ES', { timeZone: 'America/Asuncion' }),
    },
    { name: 'invoiceNumber', label: 'Numero de Factura' },
    { name: 'client.name', label: 'Cliente' },
    {
      name: 'total',
      label: 'Total',
      callback: (total) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'PYG' }).format(total),
    },
  ];

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const showPosMode = canCreate && saleMode === 'pos' && !viewSale && !isReportVisible;

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(SALES_LAYOUT_EVENT, { detail: { active: showPosMode } }));

    return () => {
      window.dispatchEvent(new CustomEvent(SALES_LAYOUT_EVENT, { detail: { active: false } }));
    };
  }, [showPosMode]);

  return (
    <main className={showPosMode ? 'min-h-screen' : 'flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6'}>
      {viewSale ? (
        <SaleProductsView selectedSale={viewSale} setSale={setViewSale} />
      ) : isReportVisible ? (
        <SaleProductsReport setIsReportVisible={setIsReportVisible} />
      ) : showPosMode ? (
        <SaleProductsPos
          selectedSale={selectedSale || {}}
          handleSaleUpdate={handleSaleUpdate}
          handleSaleCreate={handleSaleCreate}
          onBack={openTableMode}
        />
      ) : selectedSale ? (
        <Form
          selectedSale={selectedSale}
          handleSaleUpdate={handleSaleUpdate}
          handleSaleCreate={handleSaleCreate}
          setSale={setSelectedSale}
        />
      ) : (
        <div className="grid gap-4 md:gap-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="relative w-full lg:w-80">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Busqueda"
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full bg-background pl-8 shadow-none"
                />
              </div>

              {canCreate && (
                <div className="inline-flex w-fit rounded-xl bg-slate-100 p-1">
                  <button type="button" className={modeButtonClassName(saleMode === 'table')} onClick={openTableMode}>
                    Table
                  </button>
                  <button type="button" className={modeButtonClassName(saleMode === 'pos')} onClick={openPosMode}>
                    POS
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {canRead && (
                <Button variant="primary" onClick={() => setIsReportVisible(true)}>
                  <MenuIcon className="mr-1 h-4 w-4" />
                  Reporte
                </Button>
              )}
              {canCreate && (
                <>
                  <Button variant="secondary" onClick={openPosMode}>
                    <PlusIcon className="mr-1 h-4 w-4" />
                    Modo POS
                  </Button>
                  <Button variant="primary" onClick={() => setSelectedSale({})}>
                    <PlusIcon className="mr-1 h-4 w-4" />
                    Nueva venta
                  </Button>
                </>
              )}
            </div>
          </div>

          <Card>
            <CardContent>
              <TableData
                data={filteredSales}
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
        onConfirm={confirmDeleteSale}
        title="Confirmar eliminacion"
        message="Estas seguro de que deseas eliminar esta venta?"
      />
    </main>
  );
};

export default SaleProducts;
