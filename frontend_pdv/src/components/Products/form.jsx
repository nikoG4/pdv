import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeftIcon } from '../ui/icons';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import Select from 'react-select';
import CategoryService from '../../services/CategoryService';

const Form = ({ selectedProduct, handleProductUpdate, handleProductCreate, setProduct }) => {
  const [categories, setCategories] = useState([]);
  const [isNewProduct, setIsNewProduct] = useState(Object.keys(selectedProduct).length === 0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await CategoryService.getCategories();
        console.log(data);
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Actualiza el estado del formulario
  const [formValues, setFormValues] = useState({
    code: selectedProduct?.code || '',
    name: selectedProduct?.name || '',
    description: selectedProduct?.description || '',
    category: selectedProduct?.category || null,
    price: selectedProduct?.price || '',
    iva: selectedProduct?.iva || '',
    stockControl: selectedProduct?.stockControl || false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCategoryChange = (selectedOption) => {
    setFormValues({ ...formValues, category: selectedOption });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updatedProduct = {
      id: selectedProduct?.id,
      ...formValues,
      stock: selectedProduct?.stock || 0,
      price: parseFloat(formValues.price),
      iva: parseInt(formValues.iva),
    };


    if(updatedProduct.name === '' || updatedProduct.name === null) {
      alert('Nombre no valido');
      return;
    }else if(updatedProduct.category === null || updatedProduct.category === undefined) {
      alert('Seleccione una categoria');
      return;
    }else if(!updatedProduct.price || updatedProduct.price <= 0) {
      alert('El precio no es valido');
      return;
    }

    if (isNewProduct) {
      handleProductCreate(updatedProduct);
    } else {
      handleProductUpdate(updatedProduct);
    }
  };

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
        <h1 className="text-2xl font-bold">{isNewProduct ? '' : selectedProduct.name}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{isNewProduct ? 'Crear Producto' : 'Editar Producto'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  value={formValues.code}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formValues.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formValues.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category_id">Categoría</Label>
                <Select
                  options={categories}
                  id="category_id"
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.id}
                  value={formValues.category} 
                  onChange={handleCategoryChange} 
                  name="category_id"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formValues.price}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="iva">IVA %</Label>
                <Input
                  id="iva"
                  name="iva"
                  type="number"
                  value={formValues.iva}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center mt-5">
                  <Checkbox
                    id="stockControl"
                    name="stockControl"
                    checked={formValues.stockControl}
                    onChange={handleInputChange} // Usar el manejador de cambios
                  />
                  <Label htmlFor="stockControl" className="ml-2">
                    Controlar Stock?
                  </Label>
                </div>
              </div>

              <div className="col-span-2 flex justify-end">
                <Button type="submit">{isNewProduct ? 'Crear' : 'Guardar'}</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Form;
