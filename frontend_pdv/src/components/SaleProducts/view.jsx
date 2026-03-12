import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { ArrowLeftIcon } from '../ui/icons';
import ProductService from '../../services/ProductService';
import ClientService from './../../services/ClientService';

const SaleProductsView = ({ selectedSale, setSale }) => {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const result = await ClientService.getAllClients();
        setClients(result.content);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (selectedSale.items.length > 0) {
        const productIds = selectedSale.items.map(item => item.product.id);
        try {
          const result = await ProductService.getProductsByIds(productIds);
          setProducts(result.content);
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      }
    };

    fetchProducts();
  }, [selectedSale]);

  const total = selectedSale.items.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex items-center">
        <Button variant="outline" size="icon" className="mr-4" onClick={() => setSale(null)}>
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-2xl font-bold">Detalles de la Venta</h1>
      </div>

      <Card className="w-full max-w-[100%]">
        <CardHeader>
          <CardTitle>Detalles de la Venta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedSale.date || new Date().toISOString().split('T')[0]}
                  readOnly
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client">Cliente</Label>
                <Input
                  id="client"
                  type="text"
                  value={clients.find(client => client.id === selectedSale.client?.id)?.name || ''}
                  readOnly
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="invoice">Nro. de Factura</Label>
                <Input
                  id="invoice"
                  type="text"
                  value={selectedSale.invoiceNumber || ''}
                  readOnly
                />
              </div>
            </div>

            <div>
              <div className="flex justify-end mt-4 font-semibold text-red-600 text-xl">
                Total: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'PYG' }).format(total).replace('PYG', '₲')}
              </div>
              <Label className="font-semibold">Productos</Label>
              <div className="border rounded-lg mt-2 p-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left pb-2">Producto</th>
                      <th className="text-center pb-2">Cantidad</th>
                      <th className="text-center pb-2">Precio de venta</th>
                      <th className="text-right pb-2">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.items.map(item => (
                      <tr key={item.product.id} className="border-b">
                        <td className="py-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100"></div>
                            <div>
                              <h4 className="font-medium">{item.product.name}</h4>
                              <p className="text-sm text-muted-foreground">{item.product.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-2">{item.quantity}</td>
                        <td className="text-center py-2">${item.price}</td>
                        <td className="text-right py-2">${item.subtotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SaleProductsView;
