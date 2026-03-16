/* eslint-disable react/prop-types */
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeftIcon } from '../ui/icons';

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'PYG',
  maximumFractionDigits: 0,
});

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);
const formatNullableCurrency = (value) => (value === null || value === undefined ? '-' : formatCurrency(value));
const formatDate = (value) => (value ? new Date(`${value}T00:00:00`).toLocaleDateString('es-ES') : '-');

const summaryItems = (summary) => [
  { label: 'Apertura', value: formatCurrency(summary?.openingAmount) },
  { label: 'Ventas', value: formatCurrency(summary?.salesTotal) },
  { label: 'Entradas', value: formatCurrency(summary?.cashInflowTotal) },
  { label: 'Compras', value: formatCurrency(summary?.purchasesTotal) },
  { label: 'Salidas', value: formatCurrency(summary?.cashOutflowTotal) },
  { label: 'Saldo esperado', value: formatCurrency(summary?.expectedAmount) },
  { label: 'Saldo contado', value: formatNullableCurrency(summary?.closingAmount) },
  { label: 'Diferencia', value: formatNullableCurrency(summary?.differenceAmount) },
];

const CashRegisterView = ({ viewCashRegister, setViewCashRegister }) => {
  const { register, summary, movements } = viewCashRegister;

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex items-center">
        <Button variant="outline" size="icon" className="mr-4" onClick={() => setViewCashRegister(null)}>
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-2xl font-bold">Caja #{register.id}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {summaryItems(summary).map((item) => (
          <Card key={item.label}>
            <CardContent className="py-4">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="mt-2 text-xl font-semibold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la caja</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          <p><span className="font-semibold">Estado:</span> {summary?.status || register.status}</p>
          <p><span className="font-semibold">Fecha apertura:</span> {formatDate(summary?.openingDate || register.openingDate)}</p>
          <p><span className="font-semibold">Fecha cierre:</span> {formatDate(summary?.closingDate || register.closingDate)}</p>
          <p><span className="font-semibold">Abierta por:</span> {summary?.openedBy || '-'}</p>
          <p><span className="font-semibold">Cerrada por:</span> {summary?.closedBy || '-'}</p>
          <p><span className="font-semibold">Observacion:</span> {summary?.observation || '-'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Libro de movimientos</CardTitle>
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
                {movements.map((movement, index) => (
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
    </div>
  );
};

export default CashRegisterView;
