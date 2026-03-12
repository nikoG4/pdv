import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeftIcon } from '../ui/icons';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import Select from 'react-select';
import RoleService from '../../services/RoleService'; // Asegúrate de tener un servicio para manejar roles

const UserForm = ({ selectedUser, handleUserUpdate, handleUserCreate, setUser }) => {
  const [roles, setRoles] = useState([]);
  const [isNewUser, setIsNewUser] = useState(Object.keys(selectedUser).length === 0);

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

  // Actualiza el estado del formulario
  const [formValues, setFormValues] = useState({
    username: selectedUser?.username || '',
    email: selectedUser?.email || '',
    password: selectedUser?.password || '',
    role: selectedUser?.role || null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleRoleChange = (selectedOption) => {
    setFormValues({ ...formValues, role: selectedOption });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updatedUser = {
      id: selectedUser?.id,
      ...formValues,
    };

    if (isNewUser) {
      handleUserCreate(updatedUser);
    } else {
      handleUserUpdate(updatedUser);
    }
  };

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
        <h1 className="text-2xl font-bold">{isNewUser ? 'Crear Usuario' : selectedUser.username}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{isNewUser ? 'Crear Usuario' : 'Editar Usuario'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formValues.username}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formValues.email}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formValues.password}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  options={roles}
                  id="role"
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.id}
                  value={formValues.role}
                  onChange={handleRoleChange}
                  name="role"
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <Button type="submit">{isNewUser ? 'Crear' : 'Guardar'}</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserForm;
