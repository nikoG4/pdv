import { useEffect, useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TableData } from '../ui/table';
import { PlusIcon, DeleteIcon, EditIcon, SearchIcon, ViewIcon } from '../ui/icons';
import Form from './form';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import UserService from '../../services/UserService'; 
import { AuthContext } from '../../services/Auth/AuthContext';
import { Input } from '../ui/input';
import UserView from './view';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]); // Estado para usuarios filtrados
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewUser, setViewUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(0); 
    const [pageSize] = useState(10); 
    const [totalElements, setTotalElements] = useState(0); 
    const { user } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState(""); // Estado para la barra de búsqueda

    const fetchUsers = async (page) => {
        try {
            const response = await UserService.getAllUsers({ page, size: pageSize });
            setUsers(response.content); 
            setTotalElements(response.totalElements); 
            setFilteredUsers(response.content); // Inicializar también los usuarios filtrados
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage); // Llamada a la función de carga de usuarios
    }, [currentPage]);

    useEffect(() => {
        // Filtrar usuarios basados en el término de búsqueda
        const filtered = users.filter(user => {
            const searchLower = searchTerm.toLowerCase();
            return (
                user.username.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower) ||
                user.role.name.toLowerCase().includes(searchLower)
            );
        });
        setFilteredUsers(filtered);
    }, [searchTerm, users]); // Dependencias: término de búsqueda y lista de usuarios

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage); // Actualizar la página actual
    };

    const handleUserCreate = async (newUser) => {
        try {
            const createdUser = await UserService.save(newUser);
            setUsers([...users, createdUser]);
            setSelectedUser(null);
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    const handleUserUpdate = async (updatedUser) => {
        try {
            const user = await UserService.update(updatedUser.id, updatedUser);
            const updatedUsers = users.map((u) => 
                u.id === updatedUser.id ? user : u
            );
            setUsers(updatedUsers);
            setSelectedUser(null);
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handleUserDelete = async (userId) => {
        try {
            await UserService.delete(userId);
            const updatedUsers = users.filter((u) => u.id !== userId);
            setUsers(updatedUsers);
            setSelectedUser(null);
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const openConfirmModal = (user) => {
        setUserToDelete(user);
        setIsModalOpen(true);
    };
    
    const confirmDeleteUser = () => {
        if (userToDelete) {
            handleUserDelete(userToDelete.id);
        }
        setIsModalOpen(false);
    };

    const getActions = () => {
        const actions = [];
        if (user?.authorities.includes('User.read')) {
            actions.push({
                label: "Ver",
                icon: <ViewIcon className="h-4 w-4"/>,
                onClick: (user) => setViewUser(user),
            });
        }
        if (user?.authorities.includes('User.update')) {
            actions.push({
                label: "Editar",
                icon: <EditIcon className="h-4 w-4"/>,
                onClick: (user) => setSelectedUser(user),
            });
        }
        if (user?.authorities.includes('User.delete')) {
            actions.push({
                label: "Eliminar",
                icon: <DeleteIcon className="h-4 w-4"/>,
                onClick: (user) => openConfirmModal(user),
            });
        }
        return actions;
    };

    const columns = [
        { name: "id", label: "ID" },
        { name: "username", label: "Usuario" },
        { name: "email", label: "Email" },
        { name: "role.name", label: "Rol" },
    ];

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            { viewUser ?  (
                <UserView selectedUser={viewUser} setUser={setViewUser} />
            ) : selectedUser ? (
                <Form
                    selectedUser={selectedUser}
                    handleUserUpdate={handleUserUpdate}
                    handleUserCreate={handleUserCreate}
                    setUser={setSelectedUser}
                />
            ) : (
                <div className="grid gap-4 md:gap-8">
                    <div className="flex justify-between items-center">
                        <div className="relative w-80">
                            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Búsqueda"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-background shadow-none appearance-none pl-8 md:w-2/3 lg:w-3/3"
                            />
                        </div>
                        {user?.authorities.includes('User.create') && (
                            <Button variant="primary" onClick={() => setSelectedUser({})}>
                                <PlusIcon className="h-4 w-4 mr-1" /> Crear Usuario
                            </Button>
                        )}
                    </div>

                    <Card>
                        <CardContent>
                            <TableData 
                                data={filteredUsers} // Usar usuarios filtrados
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
                onConfirm={confirmDeleteUser}
                title="Confirmar eliminación"
                message="¿Estás seguro de que deseas eliminar este usuario?"
            />
        </main>
    );
}
