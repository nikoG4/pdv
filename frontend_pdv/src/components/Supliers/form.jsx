import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeftIcon } from '../ui/icons';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import Select from 'react-select';
import SupplierService from '../../services/SupplierService'; // Asegúrate de ajustar el path si es necesario

const Form = ({ selectedSupplier, handleSupplierUpdate, handleSupplierCreate, setSupplier }) => {
  const [isNewSupplier, setIsNewSupplier] = useState(Object.keys(selectedSupplier).length === 0);

  useEffect(() => {
    // Aquí podrías hacer una llamada para obtener información adicional si es necesario
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const updatedSupplier = {
      id: selectedSupplier?.id,
      name: formData.get('name'),
      contactName: formData.get('contactName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address')
    };

    if (isNewSupplier) {
      handleSupplierCreate(updatedSupplier);
    } else {
      handleSupplierUpdate(updatedSupplier);
    }
  };

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex items-center">
        <Button
          variant="outline"
          size="icon"
          className="mr-4"
          onClick={() => setSupplier(null)}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-2xl font-bold">{isNewSupplier ? '' : selectedSupplier.name}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{isNewSupplier ? 'Crear Proveedor' : 'Editar Proveedor'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={selectedSupplier?.name || ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactName">Nombre de Contacto</Label>
                <Input
                  id="contactName"
                  name="contactName"
                  type="text"
                  defaultValue={selectedSupplier?.contactName || ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={selectedSupplier?.email || ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="text"
                  defaultValue={selectedSupplier?.phone || ''}
                />
              </div>
              <div className="grid gap-2 col-span-2">
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                  id="address"
                  name="address"
                  defaultValue={selectedSupplier?.address || ''}
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <Button type="submit">{isNewSupplier ? 'Crear' : 'Guardar'}</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Form;
