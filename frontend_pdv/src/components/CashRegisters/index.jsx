import { useContext, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableData } from '../ui/table';
import { Input } from '../ui/input';
import { AuthContext } from '../../services/Auth/AuthContext';
import CashRegisterService from '../../services/CashRegisterService';
import CashRegisterForm from './form';
import CashRegisterView from './view';
import CashRegistersReport from './report';
import { MenuIcon, PlusIcon, SearchIcon, ViewIcon } from '../ui/icons';

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'PYG',
  maximumFractionDigits: 0,
});

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);
const formatNullableCurrency = (value) => (value === null || value === undefined ? '-' : formatCurrency(value));
const formatDate = (value) => (value ? new Date(`${value}T00:00:00`).toLocaleDateString('es-ES') : '-');

const summaryCards = (summary) => [
  { label: 'Apertura', value: formatCurrency(summary?.openingAmount), tone: 'text-slate-900' },
  { label: 'Ventas', value: formatCurrency(summary?.salesTotal), tone: 'text-emerald-600' },
  { label: 'Entradas', value: formatCurrency(summary?.cashInflowTotal), tone: 'text-emerald-600' },
  { label: 'Compras', value: formatCurrency(summary?.purchasesTotal), tone: 'text-red-600' },
  { label: 'Salidas', value: formatCurrency(summary?.cashOutflowTotal), tone: 'text-red-600' },
  { label: 'Saldo esperado', value: formatCurrency(summary?.expectedAmount), tone: 'text-slate-900' },
  { label: 'Saldo contado', value: formatNullableCurrency(summary?.closingAmount), tone: 'text-slate-900' },
  { label: 'Diferencia', value: formatNullableCurrency(summary?.differenceAmount), tone: 'text-slate-900' },
];

const CashRegisters = () => {
  const { user } = useContext(AuthContext);
  const [cashRegisters, setCashRegisters] = useState([]);
  const [selectedCashRegister, setSelectedCashRegister] = useState(null);
  const [viewCashRegister, setViewCashRegister] = useState(null);
  const [reportState, setReportState] = useState({ visible: false, title: '', file: null });
  const [currentCashRegister, setCurrentCashRegister] = useState(null);
  const [currentSummary, setCurrentSummary] = useState(null);
  const [currentMovements, setCurrentMovements] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const canCreate = user?.authorities.includes('CashRegister.create');
  const canRead = user?.authorities.includes('CashRegister.read');
  const canUpdate = user?.authorities.includes('CashRegister.update');

  const fetchCashRegisters = async (page) => {
    try {
      const response = await CashRegisterService.getAllCashRegisters({ page, size: pageSize, q: searchQuery });
      setCashRegisters(response.content);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Error fetching cash registers:', error);
    }
  };

  const loadRegisterDetails = async (cashRegister) => {
    const [summary, movements] = await Promise.all([
      CashRegisterService.getSummary(cashRegister.id),
      CashRegisterService.getMovements(cashRegister.id),
    ]);

    return {
      register: cashRegister,
      summary,
      movements,
    };
  };

  const fetchCurrentCashRegister = async () => {
    try {
      const current = await CashRegisterService.getCurrent();
      setCurrentCashRegister(current);

      if (!current) {
        setCurrentSummary(null);
        setCurrentMovements([]);
        return;
      }

      const details = await loadRegisterDetails(current);
      setCurrentSummary(details.summary);
      setCurrentMovements(details.movements);
    } catch (error) {
      console.error('Error fetching current cash register:', error);
    }
  };

  useEffect(() => {
    fetchCashRegisters(currentPage);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchCurrentCashRegister();
  }, []);

  const refreshModule = async () => {
    await Promise.all([
      fetchCashRegisters(currentPage),
      fetchCurrentCashRegister(),
    ]);
  };

  const handleCashRegisterOpen = async (cashRegister) => {
    try {
      await CashRegisterService.open(cashRegister);
      setSelectedCashRegister(null);
      await refreshModule();
    } catch (error) {
      console.error('Error opening cash register:', error);
    }
  };

  const handleCashRegisterClose = async (id, payload) => {
    try {
      await CashRegisterService.close(id, payload);
      setSelectedCashRegister(null);
      await refreshModule();
    } catch (error) {
      console.error('Error closing cash register:', error);
    }
  };

  const handleOpenView = async (cashRegister) => {
    try {
      const details = await loadRegisterDetails(cashRegister);
      setViewCashRegister(details);
    } catch (error) {
      console.error('Error loading cash register details:', error);
    }
  };

  const handleOpenSummaryReport = async (cashRegister) => {
    try {
      const file = await CashRegisterService.getSummaryReport(cashRegister.id);
      setReportState({
        visible: true,
        title: `Resumen de Caja #${cashRegister.id}`,
        file,
      });
    } catch (error) {
      console.error('Error loading cash register summary report:', error);
    }
  };

  const handleOpenMovementsReport = async (cashRegister) => {
    try {
      const file = await CashRegisterService.getMovementsReport(cashRegister.id);
      setReportState({
        visible: true,
        title: `Libro de Movimientos de Caja #${cashRegister.id}`,
        file,
      });
    } catch (error) {
      console.error('Error loading cash register movements report:', error);
    }
  };

  const getActions = () => {
    const actions = [];

    if (canRead) {
      actions.push({
        label: 'Ver',
        icon: <ViewIcon className="h-4 w-4" />,
        onClick: (cashRegister) => handleOpenView(cashRegister),
      });

      actions.push({
        label: 'Reporte resumen',
        icon: <MenuIcon className="h-4 w-4" />,
        onClick: (cashRegister) => handleOpenSummaryReport(cashRegister),
      });

      actions.push({
        label: 'Reporte movimientos',
        icon: <MenuIcon className="h-4 w-4" />,
        onClick: (cashRegister) => handleOpenMovementsReport(cashRegister),
      });
    }

    if (canUpdate) {
      actions.push({
        label: 'Cerrar caja',
        icon: <PlusIcon className="h-4 w-4" />,
        visible: (cashRegister) => cashRegister.status === 'OPEN',
        onClick: (cashRegister) => setSelectedCashRegister({ ...cashRegister, mode: 'close' }),
      });
    }

    return actions;
  };

  const historyColumns = [
    { name: 'id', label: 'ID' },
    { name: 'openingDate', label: 'Apertura', callback: formatDate },
    { name: 'closingDate', label: 'Cierre', callback: formatDate },
    { name: 'status', label: 'Estado' },
    { name: 'openingAmount', label: 'Monto inicial', callback: formatCurrency, align: 'right' },
    { name: 'expectedAmount', label: 'Esperado', callback: formatCurrency, align: 'right' },
    { name: 'closingAmount', label: 'Contado', callback: formatNullableCurrency, align: 'right' },
    { name: 'differenceAmount', label: 'Diferencia', callback: formatNullableCurrency, align: 'right' },
  ];

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      {reportState.visible ? (
        <CashRegistersReport setReportState={setReportState} reportState={reportState} />
      ) : viewCashRegister ? (
        <CashRegisterView viewCashRegister={viewCashRegister} setViewCashRegister={setViewCashRegister} />
      ) : selectedCashRegister ? (
        <CashRegisterForm
          selectedCashRegister={selectedCashRegister}
          cashRegisterSummary={currentSummary}
          handleCashRegisterOpen={handleCashRegisterOpen}
          handleCashRegisterClose={handleCashRegisterClose}
          setCashRegister={setSelectedCashRegister}
        />
      ) : (
        <div className="grid gap-4 md:gap-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Caja</h1>
              <p className="text-sm text-slate-500">
                Consolida ventas, compras, entradas y salidas para tener una caja operativa real.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {currentCashRegister && canRead && (
                <>
                  <Button variant="secondary" onClick={() => handleOpenView(currentCashRegister)}>
                    <ViewIcon className="mr-1 h-4 w-4" /> Ver detalle
                  </Button>
                  <Button variant="secondary" onClick={() => handleOpenSummaryReport(currentCashRegister)}>
                    <MenuIcon className="mr-1 h-4 w-4" /> Resumen PDF
                  </Button>
                  <Button variant="secondary" onClick={() => handleOpenMovementsReport(currentCashRegister)}>
                    <MenuIcon className="mr-1 h-4 w-4" /> Movimientos PDF
                  </Button>
                </>
              )}
              {!currentCashRegister && canCreate && (
                <Button variant="primary" onClick={() => setSelectedCashRegister({ mode: 'open' })}>
                  <PlusIcon className="mr-1 h-4 w-4" /> Abrir caja
                </Button>
              )}
              {currentCashRegister && canUpdate && (
                <Button variant="primary" onClick={() => setSelectedCashRegister({ ...currentCashRegister, mode: 'close' })}>
                  <PlusIcon className="mr-1 h-4 w-4" /> Cerrar caja
                </Button>
              )}
            </div>
          </div>

          {currentCashRegister ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {summaryCards(currentSummary).map((item) => (
                  <Card key={item.label}>
                    <CardContent className="py-4">
                      <p className="text-sm text-slate-500">{item.label}</p>
                      <p className={`mt-2 text-xl font-semibold ${item.tone}`}>{item.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Caja abierta</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  <p><span className="font-semibold">Fecha apertura:</span> {formatDate(currentSummary?.openingDate)}</p>
                  <p><span className="font-semibold">Abierta por:</span> {currentSummary?.openedBy || '-'}</p>
                  <p><span className="font-semibold">Estado:</span> {currentSummary?.status || currentCashRegister.status}</p>
                  <p><span className="font-semibold">Movimientos registrados:</span> {currentSummary?.movementCount || 0}</p>
                  <p className="xl:col-span-2"><span className="font-semibold">Observacion:</span> {currentSummary?.observation || '-'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Libro de movimientos de la caja actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500">Fecha</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500">Tipo</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500">Referencia</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500">Parte</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500">Descripcion</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-gray-500">Ingreso</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-gray-500">Egreso</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-gray-500">Saldo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {currentMovements.map((movement, index) => (
                          <tr key={`${movement.reference}-${index}`}>
                            <td className="px-4 py-2 text-sm text-gray-600">{formatDate(movement.date)}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{movement.movementType}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{movement.reference}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{movement.party}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{movement.description}</td>
                            <td className="px-4 py-2 text-right text-sm text-emerald-600">{formatCurrency(movement.inflow)}</td>
                            <td className="px-4 py-2 text-right text-sm text-red-600">{formatCurrency(movement.outflow)}</td>
                            <td className="px-4 py-2 text-right text-sm font-medium text-gray-700">{formatCurrency(movement.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-10">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-slate-900">No hay una caja abierta</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Abre una caja para empezar a consolidar ventas, compras, entradas y salidas de efectivo.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <div className="relative w-80">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar cajas"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full bg-background pl-8 shadow-none"
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Historial de cajas</CardTitle>
              </CardHeader>
              <CardContent>
                <TableData
                  data={cashRegisters}
                  columns={historyColumns}
                  actions={getActions()}
                  totalElements={totalElements}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </main>
  );
};

export default CashRegisters;
