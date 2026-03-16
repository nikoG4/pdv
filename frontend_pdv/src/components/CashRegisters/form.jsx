/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeftIcon } from '../ui/icons';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { getTodayLocalDate, normalizeDateInputValue } from '../../lib/date';

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'PYG',
  maximumFractionDigits: 0,
});

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

const CashRegisterForm = ({
  selectedCashRegister,
  cashRegisterSummary,
  handleCashRegisterOpen,
  handleCashRegisterClose,
  setCashRegister,
}) => {
  const isClosing = Boolean(selectedCashRegister?.id && selectedCashRegister?.mode === 'close');
  const [openingDate, setOpeningDate] = useState(
    normalizeDateInputValue(selectedCashRegister?.openingDate)
  );
  const [openingAmount, setOpeningAmount] = useState(selectedCashRegister?.openingAmount || '');
  const [closingDate, setClosingDate] = useState(
    normalizeDateInputValue(selectedCashRegister?.closingDate)
  );
  const [closingAmount, setClosingAmount] = useState(selectedCashRegister?.closingAmount || '');
  const [observation, setObservation] = useState(selectedCashRegister?.observation || '');

  const expectedAmount = useMemo(
    () => Number(cashRegisterSummary?.expectedAmount || 0),
    [cashRegisterSummary]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isClosing) {
      if (!closingAmount) {
        alert('El monto de cierre es obligatorio.');
        return;
      }

      await handleCashRegisterClose(selectedCashRegister.id, {
        closingDate,
        closingAmount: Number(closingAmount),
        observation,
      });
      return;
    }

    if (!openingAmount) {
      alert('El monto de apertura es obligatorio.');
      return;
    }

    await handleCashRegisterOpen({
      openingDate,
      openingAmount: Number(openingAmount),
      observation,
    });
  };

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex items-center">
        <Button variant="outline" size="icon" className="mr-4" onClick={() => setCashRegister(null)}>
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-2xl font-bold">{isClosing ? 'Cerrar caja' : 'Abrir caja'}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isClosing ? 'Datos del cierre de caja' : 'Datos de apertura de caja'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6" onSubmit={handleSubmit}>
            {isClosing ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="closingDate">Fecha de cierre</Label>
                  <Input
                    id="closingDate"
                    type="date"
                    value={closingDate || getTodayLocalDate()}
                    onChange={(event) => setClosingDate(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expectedAmount">Saldo esperado</Label>
                  <Input
                    id="expectedAmount"
                    type="text"
                    value={formatCurrency(expectedAmount)}
                    readOnly
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="closingAmount">Saldo contado</Label>
                  <Input
                    id="closingAmount"
                    type="number"
                    min="0"
                    value={closingAmount}
                    onChange={(event) => setClosingAmount(event.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="openingDate">Fecha de apertura</Label>
                  <Input
                    id="openingDate"
                    type="date"
                    value={openingDate || getTodayLocalDate()}
                    onChange={(event) => setOpeningDate(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="openingAmount">Monto inicial</Label>
                  <Input
                    id="openingAmount"
                    type="number"
                    min="0"
                    value={openingAmount}
                    onChange={(event) => setOpeningAmount(event.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="observation">Observacion</Label>
              <Textarea
                id="observation"
                rows={4}
                value={observation}
                onChange={(event) => setObservation(event.target.value)}
                placeholder={isClosing ? 'Detalle del cierre de caja' : 'Detalle de apertura de caja'}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">
                {isClosing ? 'Confirmar cierre' : 'Abrir caja'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashRegisterForm;
