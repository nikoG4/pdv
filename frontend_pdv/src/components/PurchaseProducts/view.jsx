import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { ArrowLeftIcon } from "../ui/icons";
import SupplierService from "./../../services/SupplierService";
import ProductImage from "../ui/product-image";

const PurchaseProductsView = ({ selectedPurchase, setViewPurchase }) => {
  const [selectedSupplier, setSelectedSupplier] = useState(selectedPurchase.supplier || null);
  const [total, setTotal] = useState(selectedPurchase.total || 0);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const result = await SupplierService.getAllSuppliers();
        const supplier = result.content.find((item) => item.id === selectedPurchase.supplier?.id);
        setSelectedSupplier(supplier || selectedPurchase.supplier || null);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };

    fetchSuppliers();
  }, [selectedPurchase.supplier]);

  useEffect(() => {
    setTotal(selectedPurchase.total);
  }, [selectedPurchase]);

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex items-center">
        <Button
          variant="outline"
          size="icon"
          className="mr-4"
          onClick={() => setViewPurchase(null)}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-2xl font-bold">Detalles de la compra</h1>
      </div>

      <Card className="w-full max-w-[100%]">
        <CardHeader>
          <CardTitle>Compra de productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="date">Fecha</Label>
                <span>{new Date(selectedPurchase.date).toLocaleDateString("es-ES")}</span>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supplier">Proveedor</Label>
                <span>{selectedSupplier?.name}</span>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="invoice">Nro. de Factura</Label>
                <span>{selectedPurchase.invoiceNumber}</span>
              </div>
            </div>

            <div>
              <div className="mt-4 flex justify-end text-xl font-semibold text-red-600">
                Total: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'PYG' }).format(total).replace('PYG', 'Gs')}
              </div>
              <Label className="font-semibold">Productos</Label>
              <p className="text-sm text-muted-foreground">
                Lista de productos comprados
              </p>
              <div className="mt-2 rounded-lg border p-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="w-58 pb-2 text-left">Producto</th>
                      <th className="w-24 pb-2 text-center">Cantidad</th>
                      <th className="w-40 pb-2 text-center">Precio de Compra</th>
                      <th className="w-40 pb-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPurchase.items.map((item) => (
                      <tr key={item.product.id} className="border-b">
                        <td className="py-2">
                          <div className="flex items-center gap-3">
                            <ProductImage src={item.product.image} alt={item.product.name} className="h-10 w-10" />
                            <div>
                              <h4 className="font-medium">
                                {item.product.name}
                                <span className="ml-1 text-xs">
                                  ({item.product.code})
                                </span>
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {item.product.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 text-center">{item.quantity}</td>
                        <td className="py-2 text-center">
                          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'PYG' }).format(item.price).replace('PYG', 'Gs')}
                        </td>
                        <td className="py-2 text-right">
                          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'PYG' }).format(item.subtotal).replace('PYG', 'Gs')}
                        </td>
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

export default PurchaseProductsView;
