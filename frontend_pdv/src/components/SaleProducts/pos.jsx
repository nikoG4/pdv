/* eslint-disable react/prop-types */
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Select from 'react-select';
import { ArrowLeftIcon, DeleteIcon, LogoutIcon, SearchIcon } from '../ui/icons';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import ProductImage from '../ui/product-image';
import ClientService from '../../services/ClientService';
import ProductService from '../../services/ProductService';
import nextgenIcon from '../../assets/nextgen.svg';
import axiosInstance from '../../services/axiosConfig';
import { AuthContext } from '../../services/Auth/AuthContext';

const quickCashAmounts = [5000, 10000, 20000, 50000, 100000];
const productPageSize = 12;

const currencyFormatter = new Intl.NumberFormat('es-PY', {
  style: 'currency',
  currency: 'PYG',
  maximumFractionDigits: 0,
});

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0).replace('PYG', 'Gs.');

const getInitialClient = (selectedSale, clients) => {
  if (!selectedSale?.client) {
    return null;
  }

  return clients.find((client) => client.id === selectedSale.client.id) || selectedSale.client;
};

const getFullImageUrl = (url) => {
  if (!url) {
    return '';
  }

  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  const baseUrl = axiosInstance.defaults.baseURL || '';
  const serverBaseUrl = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
  return `${serverBaseUrl}${url}`;
};

const SaleProductsPos = ({ selectedSale, handleSaleUpdate, handleSaleCreate, onBack }) => {
  const { logout } = useContext(AuthContext);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(selectedSale?.client || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [productPage, setProductPage] = useState(0);
  const [productTotalPages, setProductTotalPages] = useState(0);
  const [productTotalElements, setProductTotalElements] = useState(0);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState(selectedSale?.items || []);
  const [saleDate, setSaleDate] = useState(selectedSale?.date || new Date().toISOString().split('T')[0]);
  const [invoiceNumber, setInvoiceNumber] = useState(selectedSale?.invoiceNumber || '');
  const [printOnSave, setPrintOnSave] = useState(true);
  const [cash, setCash] = useState(selectedSale?.total || 0);
  const [barcode, setBarcode] = useState('');
  const [lastKeyTime, setLastKeyTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoUrl, setLogoUrl] = useState(localStorage.getItem('logoUrl') || '');
  const [appName, setAppName] = useState(localStorage.getItem('appName') || 'Punto de Venta');
  const isNewSale = useMemo(() => Object.keys(selectedSale || {}).length === 0, [selectedSale]);
  const searchInputRef = useRef(null);

  const total = useMemo(
    () => selectedProducts.reduce((acc, product) => acc + Number(product.quantity) * Number(product.price), 0),
    [selectedProducts]
  );

  const itemsCount = useMemo(
    () => selectedProducts.reduce((acc, item) => acc + Number(item.quantity || 0), 0),
    [selectedProducts]
  );

  const change = cash - total;

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const result = await ClientService.getAllClients({ size: 100 });
        setClients(result.content);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    const syncConfig = () => {
      setLogoUrl(localStorage.getItem('logoUrl') || '');
      setAppName(localStorage.getItem('appName') || 'Punto de Venta');
    };

    window.addEventListener('app-config-changed', syncConfig);
    window.addEventListener('storage', syncConfig);
    return () => {
      window.removeEventListener('app-config-changed', syncConfig);
      window.removeEventListener('storage', syncConfig);
    };
  }, []);

  useEffect(() => {
    setSelectedClient(getInitialClient(selectedSale, clients));
  }, [clients, selectedSale]);

  useEffect(() => {
    setSelectedProducts(selectedSale?.items || []);
    setSaleDate(selectedSale?.date || new Date().toISOString().split('T')[0]);
    setInvoiceNumber(selectedSale?.invoiceNumber || '');
    setCash(selectedSale?.total || 0);
  }, [selectedSale]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const result = await ProductService.searchProducts({
          q: searchQuery,
          page: productPage,
          size: productPageSize,
          criteria: 'ranked',
        });
        setProducts(result.content);
        setProductTotalPages(result.totalPages);
        setProductTotalElements(result.totalElements);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [searchQuery, productPage]);

  useEffect(() => {
    setProductPage(0);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const tagName = document.activeElement?.tagName;
      const isTypingField = tagName === 'INPUT' || tagName === 'TEXTAREA';

      if (isTypingField && document.activeElement !== searchInputRef.current) {
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 100) {
        setBarcode('');
      }

      if (event.key === 'Enter') {
        if (barcode.trim()) {
          searchProductByBarcode(barcode.trim());
        }
        setBarcode('');
        return;
      }

      if (event.key.length === 1) {
        setBarcode((prevBarcode) => prevBarcode + event.key);
        setLastKeyTime(currentTime);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [barcode, lastKeyTime]);

  const searchProductByBarcode = async (code) => {
    try {
      const result = await ProductService.getProductByCode({ code });
      if (result) {
        handleProductSelect(result);
      } else {
        alert(`Producto con codigo de barras ${code} no encontrado`);
      }
    } catch (error) {
      console.error('Error buscando producto por codigo de barras:', error);
    }
  };

  const handleProductSelect = (product) => {
    const existingProductIndex = selectedProducts.findIndex((item) => item.product.id === product.id);

    if (existingProductIndex !== -1) {
      const existingProduct = selectedProducts[existingProductIndex];
      const newQuantity = Number(existingProduct.quantity) + 1;

      if (product.stockControl && newQuantity > product.stock) {
        alert('No se puede agregar mas productos, el stock disponible es insuficiente.');
        setSearchQuery('');
        return;
      }

      const updatedProducts = [...selectedProducts];
      const updatedProduct = {
        ...existingProduct,
        quantity: newQuantity,
        subtotal: newQuantity * Number(existingProduct.price),
      };
      updatedProducts.splice(existingProductIndex, 1);
      updatedProducts.unshift(updatedProduct);
      setSelectedProducts(updatedProducts);
    } else {
      if (product.stockControl && product.stock < 1) {
        alert('No se puede agregar el producto, no hay stock disponible.');
        return;
      }

      setSelectedProducts((prevProducts) => [
        {
          product,
          quantity: 1,
          price: Number(product.price),
          subtotal: Number(product.price),
        },
        ...prevProducts,
      ]);
    }

    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const handleProductQuantityChange = (index, nextQuantity) => {
    const normalizedQuantity = Number(nextQuantity) || 0;
    const updatedProducts = [...selectedProducts];
    const productItem = updatedProducts[index];

    if (normalizedQuantity <= 0) {
      updatedProducts.splice(index, 1);
      setSelectedProducts(updatedProducts);
      return;
    }

    if (productItem.product.stockControl && normalizedQuantity > productItem.product.stock) {
      alert('No se puede agregar mas productos, el stock disponible es insuficiente.');
      return;
    }

    updatedProducts[index] = {
      ...productItem,
      quantity: normalizedQuantity,
      subtotal: normalizedQuantity * Number(productItem.price),
    };

    setSelectedProducts(updatedProducts);
  };

  const handleRemoveProduct = (index) => {
    setSelectedProducts((prevProducts) => prevProducts.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleAddCash = (amount) => {
    setCash((prevCash) => Number(prevCash || 0) + amount);
  };

  const handleClearCart = () => {
    setSelectedProducts([]);
    setCash(0);
  };

  const submitSale = async () => {
    if (!saleDate) {
      alert('Fecha es requerido');
      return;
    }

    if (!selectedClient) {
      alert('Cliente es requerido');
      return;
    }

    if (selectedProducts.length === 0) {
      alert('Debe agregar al menos un producto');
      return;
    }

    if (total <= 0) {
      alert('El total es requerido');
      return;
    }

    if (change < 0) {
      alert('El efectivo recibido no alcanza para completar la venta.');
      return;
    }

    const salePayload = {
      id: selectedSale?.id,
      date: saleDate,
      client: selectedClient,
      invoiceNumber,
      items: selectedProducts.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        price: Number(item.price),
        subtotal: Number(item.quantity) * Number(item.price),
      })),
      total,
    };

    setIsSubmitting(true);
    try {
      if (isNewSale) {
        await handleSaleCreate(salePayload, printOnSave);
        setCash(0);
        setSelectedProducts([]);
      } else {
        await handleSaleUpdate(salePayload, printOnSave);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSession = () => {
    logout();
  };

  const goToPreviousPage = () => {
    setProductPage((currentPage) => Math.max(currentPage - 1, 0));
  };

  const goToNextPage = () => {
    setProductPage((currentPage) => {
      if (productTotalPages === 0) {
        return currentPage;
      }
      return Math.min(currentPage + 1, productTotalPages - 1);
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-3 md:p-5">
      <div className="grid gap-4 xl:h-[calc(100vh-2.5rem)] xl:grid-cols-[88px_minmax(0,1fr)_420px]">
        <aside className="hidden xl:flex xl:h-full xl:flex-col xl:items-center xl:rounded-[2rem] xl:bg-gradient-to-b xl:from-cyan-600 xl:to-sky-800 xl:px-3 xl:py-5 xl:text-white xl:shadow-xl">
          <div className="mb-8 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white/20 p-2">
            <img
              src={getFullImageUrl(logoUrl) || nextgenIcon}
              alt={appName}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-cyan-700 shadow-md">
              <SearchIcon className="h-5 w-5" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <span className="text-xs font-semibold">GS</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <span className="text-xs font-semibold">{itemsCount}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCloseSession}
            className="mt-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 transition hover:bg-red-500"
            title="Cerrar caja y sesion"
          >
            <LogoutIcon className="h-5 w-5" />
          </button>
        </aside>

        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100 shadow-xl xl:flex xl:h-full xl:flex-col">
          <div className="border-b border-slate-200/80 px-4 py-4 md:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="small" className="rounded-xl" onClick={onBack}>
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Volver
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    {isNewSale ? 'Modo POS' : `Editar venta #${selectedSale.id}`}
                  </h1>
                  <p className="text-sm text-slate-500">
                    Interfaz inspirada en Tailwind POS, conectada al modulo real de ventas.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="danger"
                size="small"
                className="rounded-xl"
                onClick={handleCloseSession}
              >
                <LogoutIcon className="mr-2 h-4 w-4" />
                Cerrar caja y sesion
              </Button>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label htmlFor="sale-date" className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">
                    Fecha
                  </Label>
                  <Input
                    id="sale-date"
                    type="date"
                    value={saleDate}
                    onChange={(event) => setSaleDate(event.target.value)}
                    className="rounded-xl border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="sale-invoice" className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">
                    Factura
                  </Label>
                  <Input
                    id="sale-invoice"
                    type="text"
                    value={invoiceNumber}
                    onChange={(event) => setInvoiceNumber(event.target.value)}
                    placeholder="001-001-000123"
                    className="rounded-xl border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="sale-client" className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">
                    Cliente
                  </Label>
                  <Select
                    inputId="sale-client"
                    options={clients}
                    value={selectedClient}
                    onChange={setSelectedClient}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => String(option.id)}
                    placeholder="Seleccionar cliente"
                    className="text-sm"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '42px',
                        borderRadius: '0.75rem',
                        borderColor: '#e2e8f0',
                        boxShadow: 'none',
                      }),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-4 md:px-6 xl:flex-1 xl:overflow-y-auto">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-700" />
              <Input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar producto por nombre o escanear codigo de barras"
                className="h-14 rounded-2xl border-0 bg-white pl-12 text-base shadow-md"
              />
            </div>

            <div className="mt-4">
              {!isLoadingProducts && products.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center text-slate-500">
                  {searchQuery.trim()
                    ? `No se encontraron productos para "${searchQuery}".`
                    : 'No hay productos disponibles para mostrar.'}
                </div>
              ) : (
                <>
                  {isLoadingProducts && (
                    <div className="mb-4 rounded-2xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                      Cargando productos...
                    </div>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                    {products.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleProductSelect(product)}
                        className="group overflow-hidden rounded-[1.5rem] bg-white text-left shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                      >
                        <ProductImage src={product.image} alt={product.name} className="h-40 w-full rounded-none object-cover" />
                        <div className="space-y-2 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold text-slate-800 group-hover:text-cyan-700">{product.name}</h3>
                              <p className="text-xs text-slate-500">{product.code || 'Sin codigo'}</p>
                            </div>
                            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                              {formatCurrency(product.price)}
                            </span>
                          </div>
                          <p className="max-h-10 overflow-hidden text-sm text-slate-500">
                            {product.description || 'Sin descripcion'}
                          </p>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>{product.stockControl ? `Stock: ${product.stock}` : 'Sin control de stock'}</span>
                            <span className="font-semibold text-slate-700">Agregar</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-col gap-3 rounded-[1.5rem] bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-slate-500">
                      {searchQuery.trim()
                        ? `Resultados ordenados por ranking de ventas: ${productTotalElements}`
                        : `Productos mas rankeados: ${productTotalElements}`}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="small"
                        className="rounded-xl"
                        onClick={goToPreviousPage}
                        disabled={productPage === 0}
                      >
                        Anterior
                      </Button>
                      <span className="min-w-24 text-center text-sm font-medium text-slate-700">
                        Pagina {productTotalPages === 0 ? 0 : productPage + 1} de {productTotalPages}
                      </span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="small"
                        className="rounded-xl"
                        onClick={goToNextPage}
                        disabled={productTotalPages === 0 || productPage >= productTotalPages - 1}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <aside className="flex min-h-[720px] flex-col overflow-hidden rounded-[2rem] bg-white shadow-xl xl:h-full xl:min-h-0">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Carrito</p>
                <h2 className="text-xl font-bold text-slate-800">{itemsCount} items</h2>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="small"
                className="rounded-xl"
                onClick={handleClearCart}
                disabled={selectedProducts.length === 0}
              >
                Limpiar
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {selectedProducts.length === 0 ? (
              <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 text-center text-slate-500">
                <p className="text-lg font-semibold text-slate-700">El carrito esta vacio</p>
                <p className="mt-2 text-sm">Busca productos y agregalos para comenzar la venta.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedProducts.map((item, index) => (
                  <div key={`${item.product.id}-${index}`} className="rounded-[1.5rem] bg-slate-50 p-3">
                    <div className="flex gap-3">
                      <ProductImage src={item.product.image} alt={item.product.name} className="h-16 w-16 rounded-2xl" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold text-slate-800">{item.product.name}</h3>
                            <p className="truncate text-xs text-slate-500">{item.product.code || item.product.description || 'Producto'}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(index)}
                            className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <DeleteIcon className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 rounded-2xl bg-white p-1 shadow-sm">
                            <button
                              type="button"
                              onClick={() => handleProductQuantityChange(index, Number(item.quantity) - 1)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-lg font-semibold text-slate-700"
                            >
                              -
                            </button>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(event) => handleProductQuantityChange(index, event.target.value)}
                              className="h-9 w-16 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                            />
                            <button
                              type="button"
                              onClick={() => handleProductQuantityChange(index, Number(item.quantity) + 1)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600 text-lg font-semibold text-white"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">{formatCurrency(item.price)} c/u</p>
                            <p className="font-semibold text-slate-800">{formatCurrency(item.subtotal)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 border-t border-slate-200 bg-slate-50 px-5 py-4 shadow-[0_-10px_30px_rgba(15,23,42,0.08)]">
            <div className="space-y-4">
              <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
                  <span>Total de productos</span>
                  <span>{itemsCount}</span>
                </div>
                <div className="flex items-center justify-between text-2xl font-bold text-slate-900">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
                <Label htmlFor="cash-received" className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-500">
                  Efectivo recibido
                </Label>
                <Input
                  id="cash-received"
                  type="number"
                  min="0"
                  value={cash}
                  onChange={(event) => setCash(Number(event.target.value) || 0)}
                  className="h-12 rounded-xl border-slate-200 text-right text-lg font-semibold"
                />
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {quickCashAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleAddCash(amount)}
                      className="rounded-xl bg-slate-100 px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-700"
                    >
                      + {formatCurrency(amount)}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className={`rounded-[1.5rem] px-4 py-3 text-sm font-semibold ${
                  change < 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {change < 0 ? `Faltan ${formatCurrency(Math.abs(change))}` : `Vuelto ${formatCurrency(change)}`}
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={printOnSave}
                  onChange={(event) => setPrintOnSave(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                Imprimir al guardar
              </label>

              <Button
                type="button"
                variant="success"
                size="large"
                className="w-full rounded-2xl bg-cyan-600 text-base hover:bg-cyan-700 focus:ring-cyan-500 disabled:bg-slate-300"
                onClick={submitSale}
                disabled={selectedProducts.length === 0 || total <= 0 || change < 0 || isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : isNewSale ? 'Completar venta POS' : 'Actualizar venta'}
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SaleProductsPos;
