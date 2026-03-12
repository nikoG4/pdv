import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeftIcon } from '../ui/icons';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

const Form = ({ selectedCashInflow, handleCashInflowUpdate, handleCashInflowCreate, setCashInflow }) => {

    return (
        <div className="grid gap-4 md:gap-8">
            <div className="flex items-center">
                <Button
                    variant="outline"
                    size="icon"
                    className="mr-4"
                    onClick={() => setCashInflow(null)}
                >
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <h1 className="text-2xl font-bold">
                    {selectedCashInflow?.id ? 'Editar Entrada de Efectivo' : 'Nueva Entrada de Efectivo'}
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Detalles de la Entrada de Efectivo</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const cashInflow = {
                                id: selectedCashInflow?.id || null,
                                description: formData.get('description'),
                                amount: parseFloat(formData.get('amount')),
                                date: formData.get('date'),
                                observation: formData.get('observation') || null,
                            };
                            if (selectedCashInflow?.id) {
                                handleCashInflowUpdate(cashInflow);
                            } else {
                                handleCashInflowCreate(cashInflow);
                            }
                        }}
                    >
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Input
                                    id="description"
                                    name="description"
                                    type="text"
                                    defaultValue={selectedCashInflow?.description || ''}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Monto</Label>
                                    <Input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        defaultValue={selectedCashInflow?.amount || ''}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="date">Fecha</Label>
                                    <Input
                                        id="date"
                                        name="date"
                                        type="date"
                                        defaultValue={selectedCashInflow?.date ? selectedCashInflow.date.slice(0, 10) : ''}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="observation">Observación (opcional)</Label>
                                <Input
                                    id="observation"
                                    name="observation"
                                    type="text"
                                    defaultValue={selectedCashInflow?.observation || ''}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit">Guardar</Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Form;
