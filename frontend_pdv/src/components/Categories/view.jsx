import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeftIcon } from '../ui/icons';
import { Label } from '../ui/label';

const CategoryView = ({ selectedCategory, setCategory }) => {
  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex items-center">
        <Button
          variant="outline"
          size="icon"
          className="mr-4"
          onClick={() => setCategory(null)}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-2xl font-bold">Ver Categoría: {selectedCategory.name}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Detalles de la Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Nombre</Label>
              <p>{selectedCategory.name || 'N/A'}</p>
            </div>
            <div className="grid gap-2">
              <Label>Descripción</Label>
              <p>{selectedCategory.description || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryView;
