import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeftIcon } from '../ui/icons';
import { Label } from '../ui/label';

const ProductView = ({ selectedProduct, setProduct }) => {

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex items-center">
        <Button
          variant="outline"
          size="icon"
          className="mr-4"
          onClick={() => setProduct(null)}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-2xl font-bold">{selectedProduct.name}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Detalles del Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Código</Label>
              <p>{selectedProduct.code}</p>
            </div>
            <div className="grid gap-2">
              <Label>Nombre</Label>
              <p>{selectedProduct.name}</p>
            </div>
            <div className="col-span-2">
              <Label>Descripción</Label>
              <p>{selectedProduct.description}</p>
            </div>
            <div className="grid gap-2">
              <Label>Categoría</Label>
              <p>{selectedProduct.category.name}</p>
            </div>
            <div className="grid gap-2">
              <Label>Precio</Label>
              <p>{selectedProduct.price.toFixed(2)} €</p>
            </div>
            <div className="grid gap-2">
              <Label>IVA %</Label>
              <p>{selectedProduct.iva} %</p>
            </div>
            <div className="grid gap-2">
              <Label>Controlar Stock?</Label>
              <p>{selectedProduct.stockControl ? 'Sí' : 'No'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductView;
