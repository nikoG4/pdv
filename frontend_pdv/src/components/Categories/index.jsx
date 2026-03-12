import { useState, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TableData } from '../ui/table';
import Form from './form';
import { DeleteIcon, EditIcon, MenuIcon, PlusIcon, SearchIcon, ViewIcon } from '../ui/icons';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { AuthContext } from '../../services/Auth/AuthContext';
import CategoryService from '../../services/CategoryService';
import { Input } from '../ui/input';
import CategoryView from './view';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]); // Para la lista filtrada
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [viewCategory, setViewCategory] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [searchQuery, setSearchQuery] = useState(''); // Estado para la búsqueda
    const { user } = useContext(AuthContext);

    const fetchCategories = async (page) => {
        try {
            const response = await CategoryService.getAllCategories({ page, size: pageSize }, { q: searchQuery });
            setCategories(response.content);
            setFilteredCategories(response.content); 
            setTotalElements(response.totalElements);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchCategories(currentPage);
    }, [currentPage, searchQuery]);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < Math.ceil(totalElements / pageSize)) {
            setCurrentPage(newPage);
        }
    };

    const handleCategoryCreate = async (newCategory) => {
        try {
            const createdCategory = await CategoryService.save(newCategory);
            setCategories([...categories, createdCategory]);
            setFilteredCategories([...categories, createdCategory]); // Actualizar lista filtrada
            setSelectedCategory(null);
        } catch (error) {
            console.error('Error creating category:', error);
        }
    };

    const handleCategoryUpdate = async (updatedCategory) => {
        try {
            const category = await CategoryService.update(updatedCategory.id, updatedCategory);
            const updatedCategories = categories.map((cat) =>
                cat.id === updatedCategory.id ? category : cat
            );
            setCategories(updatedCategories);
            setFilteredCategories(updatedCategories); // Actualizar lista filtrada
            setSelectedCategory(null);
        } catch (error) {
            console.error('Error updating category:', error);
        }
    };

    const handleCategoryDelete = async (categoryId) => {
        try {
            await CategoryService.delete(categoryId);
            const updatedCategories = categories.filter((category) => category.id !== categoryId);
            setCategories(updatedCategories);
            setFilteredCategories(updatedCategories); // Actualizar lista filtrada
            setSelectedCategory(null);
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const openConfirmModal = (category) => {
        setCategoryToDelete(category);
        setIsModalOpen(true);
    };

    const confirmDeleteCategory = () => {
        if (categoryToDelete) {
            handleCategoryDelete(categoryToDelete.id);
        }
        setIsModalOpen(false);
    };

    const getActions = () => {
        const actions = [];  

        if (user?.authorities.includes('Category.read')) {
            actions.push({
                label: "Ver",
                icon: <ViewIcon className="h-4 w-4" />,
                onClick: (category) => setViewCategory(category),
            });
        }

        if (user?.authorities.includes('Category.update')) {
            actions.push({
                label: "Editar",
                icon: <EditIcon className="h-4 w-4" />,
                onClick: (category) => setSelectedCategory(category),
            });
        }

        if (user?.authorities.includes('Category.delete')) {
            actions.push({
                label: "Eliminar",
                icon: <DeleteIcon className="h-4 w-4" />,
                onClick: (category) => openConfirmModal(category),
            });
        }

        return actions;
    };

    const columns = [
        { name: "id", label: "ID" },
        { name: "name", label: "Nombre" },
        { name: "description", label: "Descripción" },
    ];

    // Función para manejar la búsqueda
    const handleSearch = (event) => {
        const q = event.target.value;
        setSearchQuery(q);

        // // Filtrar categorías por el nombre (agregando validación)
        // const filtered = categories.filter((category) => 
        //     category.name && category.name.toLowerCase().includes(searchQuery.toLowerCase())
        // );
        // setFilteredCategories(filtered);
    };

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            {viewCategory ? (
                <CategoryView  
                    selectedCategory={viewCategory} 
                    setCategory={setViewCategory}
                /> 
            ) : selectedCategory ? (
                <Form
                    selectedCategory={selectedCategory}
                    handleCategoryUpdate={handleCategoryUpdate}
                    handleCategoryCreate={handleCategoryCreate}
                    setCategory={setSelectedCategory}
                />
            ) : (
                <div className="grid gap-4 md:gap-8">
                    {/*<Toolbar 
                        dataArray={categories} 
                        setDataArray={setCategories} 
                        searchableColumns={["id", "name", "description"]} 
                        buttons={getToolButtons()}
                    /> */}
                    <div className="flex justify-between items-center">
                        <div className="relative w-80">
                            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Búsqueda"
                                value={searchQuery}
                                onChange={handleSearch} // Escuchar cambios en el input
                                className="w-full bg-background shadow-none appearance-none pl-8 md:w-2/3 lg:w-3/3"
                            />
                        </div>
                        <div className="flex gap-2">

                            {user?.authorities.includes('Category.create') && (
                                <Button key={2} variant="primary" onClick={() => setSelectedCategory({})}>
                                    <PlusIcon className="h-4 w-4 mr-1" />Crear Categoría
                                </Button>
                            )}
                        </div>
                    </div>
                    <Card>
                        <CardContent>
                            <TableData 
                                data={filteredCategories} // Mostrar solo categorías filtradas
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
                onConfirm={confirmDeleteCategory}
                title="Confirmar eliminación"
                message="¿Estás seguro de que deseas eliminar esta categoría?"
            />
        </main>
    );
}
