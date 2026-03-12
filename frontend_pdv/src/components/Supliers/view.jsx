import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeftIcon } from '../ui/icons';
import { Label } from '../ui/label';

const SupplierView = ({ selectedSupplier, setSupplier }) => {
  const isNewSupplier = !selectedSupplier || Object.keys(selectedSupplier).length === 0;

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
        <h1 className="text-2xl font-bold">{isNewSupplier ? 'Nuevo Proveedor' : selectedSupplier.name}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{isNewSupplier ? 'Crear Proveedor' : 'Detalles del Proveedor'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Nombre</Label>
              <p className="border p-2 rounded">{selectedSupplier?.name || 'N/A'}</p>
            </div>
            <div className="grid gap-2">
              <Label>Nombre de Contacto</Label>
              <p className="border p-2 rounded">{selectedSupplier?.contactName || 'N/A'}</p>
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <p className="border p-2 rounded">{selectedSupplier?.email || 'N/A'}</p>
            </div>
            <div className="grid gap-2">
              <Label>Teléfono</Label>
              <p className="border p-2 rounded">{selectedSupplier?.phone || 'N/A'}</p>
            </div>
            <div className="grid gap-2 col-span-2">
              <Label>Dirección</Label>
              <p className="border p-2 rounded">{selectedSupplier?.address || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierView;
