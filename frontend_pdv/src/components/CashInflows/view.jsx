import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeftIcon } from '../ui/icons';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

const CashInflowDetailsView = ({ selectedCashInflow, setCashInflow }) => {
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
                <h1 className="text-2xl font-bold">{selectedCashInflow.description}</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Detalles de la Entrada de Efectivo</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Input
                                id="description"
                                name="description"
                                type="text"
                                value={selectedCashInflow.description}
                                readOnly
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Monto</Label>
                                <Input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    value={selectedCashInflow.amount}
                                    readOnly
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="date">Fecha</Label>
                                <Input
                                    id="date"
                                    name="date"
                                    type="date"
                                    value={selectedCashInflow.date ? selectedCashInflow.date.slice(0, 10) : ''}
                                    readOnly
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="observation">Observación</Label>
                            <Input
                                id="observation"
                                name="observation"
                                type="text"
                                value={selectedCashInflow.observation || ''}
                                readOnly
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CashInflowDetailsView;
