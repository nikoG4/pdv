import React, {useContext } from 'react';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { AuthContext } from "../../services/Auth/AuthContext";
import { Button } from '../ui/button';
import { ArrowLeftIcon } from '../ui/icons';
import { Card, CardTitle } from '../ui/card';
import { CardContent, CardHeader } from '@mui/material';
import { Label } from '../ui/label';
  

const UserProfile = () => {
    const { user } = useContext(AuthContext); 


    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage('Perfil actualizado exitosamente.');
        setIsEditing(false);
    };

    return (
        <div className="grid gap-4 md:gap-8">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="mr-4"
            onClick={() => {
              window.location.href = '/home';
            }}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Perfil de Usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Nombre de usuario</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={user.username}
                    autoComplete="off"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={user.email}
                    autoComplete="off"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                  />
                </div>
                <div className="grid gap-2">
                    <Checkbox
                        id="printOnServer"
                        name="printOnServer"
                        checked={localStorage.getItem('printOnServer') === 'true'}
                        onChange={() => {
                        if (localStorage.getItem('printOnServer') === 'true') {
                            localStorage.setItem('printOnServer', 'false');
                        } else {
                            localStorage.setItem('printOnServer', 'true');
                        }
                        }}
                    />
                  <Label htmlFor="printOnServer">Imprimir en servidor</Label>
                </div>
                <div className="col-span-2 flex justify-end">
                  <Button type="submit">Guardar</Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
};

export default UserProfile;
