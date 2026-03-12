import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { ArrowLeftIcon } from "../ui/icons"; // Asumiendo que tienes un icono de basura
import SupplierService from "./../../services/SupplierService";

const PurchaseProductsView = ({ selectedPurchase, setViewPurchase }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(selectedPurchase.supplier || null);
  const [total, setTotal] = useState(selectedPurchase.total || 0);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const result = await SupplierService.getAllSuppliers();
        setSuppliers(result.content);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };

    fetchSuppliers();
  }, []);

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
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Fecha</Label>
                <span>
                  {new Date(selectedPurchase.date).toLocaleDateString("es-ES")}
                </span>
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
              <div className="flex justify-end mt-4 font-semibold text-red-600 text-xl">
                Total: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'PYG' }).format(total).replace('PYG', '₲')}
              </div>
              <Label className="font-semibold">Productos</Label>
              <p className="text-sm text-muted-foreground">
                Lista de productos comprados
              </p>
              <div className="border rounded-lg mt-2 p-4">
                {/* Tabla de productos */}
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left pb-2 w-58">Producto</th>
                      <th className="text-center pb-2 w-24">Cantidad</th>
                      <th className="text-center pb-2 w-40">Precio de Compra</th>
                      <th className="text-right pb-2 w-40">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPurchase.items.map((item) => (
                      <tr key={item.product.id} className="border-b">
                        <td className="py-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100">
                              {/* Aquí podrías agregar una imagen del producto si está disponible */}
                            </div>
                            <div>
                              <h4 className="font-medium">
                                {item.product.name}
                                <span className="text-xs ml-1">
                                  ({item.product.code})
                                </span>
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {item.product.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-2">{item.quantity}</td>
                        <td className="text-center py-2">
                          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'PYG' }).format(item.price).replace('PYG', '₲')}
                        </td>
                        <td className="text-right py-2">
                          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'PYG' }).format(item.subtotal).replace('PYG', '₲')}
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
