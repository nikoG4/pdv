import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeftIcon } from '../ui/icons';
import {Label} from '../ui/label';
import {Input} from '../ui/input';

const Form = ({ selectedClient, handleClientUpdate, handleClientCreate, setClient}) => {


    return <div className="grid gap-4 md:gap-8">
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
                <CardTitle>Detalles del cliente </CardTitle>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        const formData = new FormData(e.target)
                        const Client = {
                            id: selectedClient ? selectedClient.id : null,
                            name: formData.get('name'),
                            ruc: formData.get('ruc'),
                            address: formData.get('address'),
                            phone: formData.get('phone'),
                            email: formData.get('email'),
                        }
                        Client.id === null ? handleClientUpdate(Client) : handleClientCreate(Client)
                    }}
                >

                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input id="name" name="name" type="text" defaultValue={selectedClient.name} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="ruc">RUC</Label>
                                <Input
                                    id="ruc" name="ruc" type="text" defaultValue={selectedClient.ruc}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telefono</Label>
                                <Input
                                    id="phone" type="number" name="phone" defaultValue={selectedClient.phone}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Dirección</Label>
                            <Input
                                id="address"
                                type="text"
                                name="address"
                                defaultValue={selectedClient.address}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="price">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                defaultValue={selectedClient.email}
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
}

export default Form