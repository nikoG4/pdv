import { useEffect, useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TableData } from '../ui/table';
import ProductService from '../../services/ProductService';
import Form from './form';
import { AuthContext } from '../../services/Auth/AuthContext';
import { DeleteIcon, EditIcon, MenuIcon, PlusIcon, SearchIcon, ViewIcon, BarcodeIcon } from '../ui/icons';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Input } from '../ui/input';
import ProductView from './view';
import ProductsReport from './report';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]); // Para la lista filtrada
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [viewProduct, setViewProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
    const [selectedBarcodeProduct, setSelectedBarcodeProduct] = useState(null);
    const [productToDelete, setProductToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(0); // Estado para la página actual
    const [pageSize] = useState(10); // Tamaño de página
    const [totalElements, setTotalElements] = useState(0); // Estado para el total de elementos
    const [searchQuery, setSearchQuery] = useState(''); // Estado para la búsqueda
    const { user } = useContext(AuthContext);
    const [isReportVisible, setIsReportVisible] = useState(false);
    const [file, setFile] = useState(null);


    const fetchProducts = async (page) => {
        try {
            const response = await ProductService.getAllProducts({ page, size: pageSize, q: searchQuery });
            setProducts(response.content); 
            setFilteredProducts(response.content); 
            setTotalElements(response.totalElements); 
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    useEffect(() => {
        fetchProducts(currentPage); // Llamada a la función de carga de productos
    }, [currentPage, searchQuery]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage); // Actualizar la página actual
    };

    const handleProductCreate = async (newProduct) => {
        try {
            await ProductService.save(newProduct);
            fetchProducts(currentPage);
            setSelectedProduct(null);
        } catch (error) {
            console.error('Error creating product:', error);
        }
    };

    const handleProductUpdate = async (updatedProduct) => {
        try {
            await ProductService.update(updatedProduct.id, updatedProduct);
            fetchProducts(currentPage);
            setSelectedProduct(null);
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    const handleProductDelete = async (productId) => {
        try {
            await ProductService.delete(productId);
            fetchProducts(currentPage);
            setSelectedProduct(null);
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const openConfirmModal = (product) => {
        setProductToDelete(product);
        setIsModalOpen(true);
    };
    
    const confirmDeleteProduct = () => {
        if (productToDelete) {
            handleProductDelete(productToDelete.id);
        }
        setIsModalOpen(false);
    };

    const handleBarcodePrint = (product) => {
        setSelectedBarcodeProduct(product);
        setIsBarcodeModalOpen(true);
    }

    const getActions = () => {
        const actions = [];
        if (user?.authorities.includes('Product.read')) {
            actions.push({
                label: "Ver",
                icon: <ViewIcon className="h-4 w-4"/>,
                onClick: (product) => setViewProduct(product),
            });
        }

        if (user?.authorities.includes('Product.read')) {
            actions.push({
                label: "Codigo de barras",
                icon: <BarcodeIcon className="h-4 w-4"/>,
                onClick: (product) => {handleBarcodePrint(product)},
            });
        }

        if (user?.authorities.includes('Product.update')) {
            actions.push({
                label: "Editar",
                icon: <EditIcon className="h-4 w-4"/>,
                onClick: (product) => setSelectedProduct(product),
            });
        }

        if (user?.authorities.includes('Product.delete')) {
            actions.push({
                label: "Eliminar",
                icon: <DeleteIcon className="h-4 w-4"/>,
                onClick: (product) => openConfirmModal(product),
            });
        }

        return actions;
    };

    const columns = [
        { name: "id", label: "ID" },
        { name: "code", label: "Código" },
        { name: "name", label: "Nombre" },
        { name: "price", label: "Precio",  callback: (total) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'PYG' }).format(total).replace('PYG', '₲'), align: 'right' },
        { name: "stock", label: "Stock", align: 'right'},
        { name: "category.name", label: "Categoría" },
    ];

    const getReport = async ( params ) => {
		
		try {
			const response = await ProductService.getReport(params);
			setFile(response);
            setIsReportVisible(true);
		} catch (error) {
			console.error('Error al obtener el reporte:', error);
		}
	};

    // Función para manejar la búsqueda
    const handleSearch = (event) => {
        const searchQuery = event.target.value;
        setSearchQuery(searchQuery);

        // Filtrar productos por el nombre o código (agregando validación)
        const filtered = products.filter((product) => 
            (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (product.code && product.code.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setFilteredProducts(filtered);
    };

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
             { viewProduct ? (
                <ProductView selectedProduct={viewProduct} setProduct={setViewProduct} />
             ):isReportVisible ? (
                <ProductsReport setIsReportVisible={setIsReportVisible} file={file}/>
             ) :  selectedProduct ? (
                <Form
                    selectedProduct={selectedProduct}
                    handleProductUpdate={handleProductUpdate}
                    handleProductCreate={handleProductCreate}
                    setProduct={setSelectedProduct}
                />
            ) : (
                <div className="grid gap-4 md:gap-8">
                    <div className="flex justify-between items-center">
                        <div className="relative w-80">
                            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Búsqueda"
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full bg-background shadow-none appearance-none pl-8 md:w-2/3 lg:w-3/3"
                            />
                        </div>      
                        <div className="flex gap-2">
                            {user?.authorities.includes('Product.read') && (
                                <Button 
                                    key={1} 
                                    variant="primary"  
                                    onClick={() => {
                                        getReport({report: 'products' })}
                                    }
                                >
                                    <MenuIcon className="h-4 w-4 mr-1"  />Reporte de Inventario
                                </Button>
                            )}
                            {user?.authorities.includes('Product.create') && (
                                <Button key={2} variant="primary" onClick={() => setSelectedProduct({})}>
                                    <PlusIcon className="h-4 w-4 mr-1" /> Nuevo Producto
                                </Button>
                            )}
                            
                        </div>                      

                    </div>
                    <Card>
                        <CardContent>
                            <TableData 
                                data={filteredProducts} // Mostrar solo productos filtrados
                                columns={columns} 
                                actions={getActions()} 
                                totalElements={totalElements}
                                pageSize={pageSize}
                                onPageChange={handlePageChange}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDeleteProduct}
                title="Confirmar eliminación"
                message="¿Estás seguro de que deseas eliminar este producto?"
            />
            <ConfirmModal
                isOpen={isBarcodeModalOpen}
                onClose={() => setIsBarcodeModalOpen(false)}
                onConfirm={(quantity) => {
                    getReport({ report: 'barcode', id: selectedBarcodeProduct.id, cant: quantity });
                    setIsBarcodeModalOpen(false);
                }}
                title="Ingresar cantidad"
                message="Por favor, ingresa la cantidad de códigos de barras a generar."
                inputConfig={{
                    type: "number",
                    placeholder: "Cantidad",
                    min: 1,
                    defaultValue: 0
                }}
            />
        </main>
    );
}
