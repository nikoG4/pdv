import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeftIcon } from '../ui/icons';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

const ClientDetailsView = ({ selectedClient, setClient }) => {
    return (
        <div className="grid gap-4 md:gap-8">
            <div className="flex items-center">
                <Button
                    variant="outline"
                    size="icon"
                    className="mr-4"
                    onClick={() => setClient(null)}
                >
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <h1 className="text-2xl font-bold">{selectedClient.name}</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Detalles del cliente</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                value={selectedClient.name}
                                readOnly
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="ruc">RUC</Label>
                                <Input
                                    id="ruc"
                                    name="ruc"
                                    type="text"
                                    value={selectedClient.ruc}
                                    readOnly
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="text"
                                    value={selectedClient.phone}
                                    readOnly
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Dirección</Label>
                            <Input
                                id="address"
                                name="address"
                                type="text"
                                value={selectedClient.address}
                                readOnly
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={selectedClient.email}
                                readOnly
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ClientDetailsView;
