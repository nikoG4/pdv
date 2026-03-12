import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeftIcon } from '../ui/icons';
import { Label } from '../ui/label';
import Select from 'react-select';
import RoleService from '../../services/RoleService'; // Asegúrate de tener un servicio para manejar roles

const UserView = ({ selectedUser, setUser }) => {
  const [roles, setRoles] = useState([]);
  const isNewUser = !selectedUser || Object.keys(selectedUser).length === 0;

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await RoleService.getRoles(); // Obtener roles
        setRoles(data);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    fetchRoles();
  }, []);

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex items-center">
        <Button
          variant="outline"
          size="icon"
          className="mr-4"
          onClick={() => setUser(null)}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-2xl font-bold">{isNewUser ? 'Nuevo Usuario' : selectedUser.username}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{isNewUser ? 'Crear Usuario' : 'Detalles del Usuario'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Username</Label>
              <p className="border p-2 rounded">{selectedUser?.username || 'N/A'}</p>
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <p className="border p-2 rounded">{selectedUser?.email || 'N/A'}</p>
            </div>
            <div className="grid gap-2">
              <Label>Password</Label>
              <p className="border p-2 rounded">********</p> {/* Para ocultar la contraseña */}
            </div>
            <div className="grid gap-2">
              <Label>Rol</Label>
              <p className="border p-2 rounded">
                {selectedUser?.role ? selectedUser.role.name : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserView;
