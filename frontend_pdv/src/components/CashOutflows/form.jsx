import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeftIcon } from '../ui/icons';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

const Form = ({ selectedCashOutflow, handleCashOutflowUpdate, handleCashOutflowCreate, setCashOutflow }) => {

    return (
        <div className="grid gap-4 md:gap-8">
            <div className="flex items-center">
                <Button
                    variant="outline"
                    size="icon"
                    className="mr-4"
                    onClick={() => setCashOutflow(null)}
                >
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <h1 className="text-2xl font-bold">
                    {selectedCashOutflow?.id ? 'Editar Salida de Efectivo' : 'Nueva Salida de Efectivo'}
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Detalles de la Salida de Efectivo</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const cashOutflow = {
                                id: selectedCashOutflow?.id || null,
                                description: formData.get('description'),
                                amount: parseFloat(formData.get('amount')),
                                date: formData.get('date'),
                                observation: formData.get('observation') || null,
                            };
                            if (selectedCashOutflow?.id) {
                                handleCashOutflowUpdate(cashOutflow);
                            } else {
                                handleCashOutflowCreate(cashOutflow);
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
                                    defaultValue={selectedCashOutflow?.description || ''}
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
                                        defaultValue={selectedCashOutflow?.amount || ''}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="date">Fecha</Label>
                                    <Input
                                        id="date"
                                        name="date"
                                        type="date"
                                        defaultValue={selectedCashOutflow?.date ? selectedCashOutflow.date.slice(0, 10) : ''}
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
                                    defaultValue={selectedCashOutflow?.observation || ''}
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
