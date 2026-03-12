import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { ArrowLeftIcon } from '../ui/icons';

const RoleView = ({ selectedRole, permissions, setRole }) => {
    const [openModules, setOpenModules] = useState({});

    // Agrupar permisos por módulo
    const groupedPermissions = permissions.reduce((acc, permission) => {
        const { module } = permission;
        if (!acc[module]) {
            acc[module] = [];
        }
        acc[module].push(permission);
        return acc;
    }, {});

    const toggleModule = (module) => {
        setOpenModules((prev) => ({ ...prev, [module]: !prev[module] }));
    };

    return (
        <div className="grid gap-4 md:gap-8">
            <div className="flex items-center">
                <Button
                    variant="outline"
                    size="icon"
                    className="mr-4"
                    onClick={() => setRole(null)}
                >
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span className="sr-only">Regresar</span>
                </Button>
                <h1 className="text-2xl font-bold">
                    {selectedRole.id ? 'Detalles del Rol' : 'Nuevo Rol'}
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Detalles del rol</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre del Rol</Label>
                            <span>{selectedRole?.name || 'No disponible'}</span>
                        </div>
                        <div className="grid gap-4">
                            <Label>Permisos</Label>
                            {Object.entries(groupedPermissions).map(([module, perms]) => (
                                <div key={module}>
                                    <button
                                        type="button"
                                        onClick={() => toggleModule(module)}
                                        className="flex items-center justify-between w-full text-left bg-gray-200 p-2 rounded"
                                    >
                                        <h3 className="font-bold">{module}</h3>
                                        <span>{openModules[module] ? '−' : '+'}</span>
                                    </button>
                                    {openModules[module] && (
                                        <table className="min-w-full bg-white">
                                            <thead>
                                                <tr>
                                                    <th className="px-4 py-2">Permiso</th>
                                                    <th className="px-4 py-2" style={{ width: '100px' }}>Asignado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {perms.map((permission) => (
                                                    <tr key={permission.id}>
                                                        <td className="border px-4 py-2">{permission.description}</td>
                                                        <td className="border px-4 py-2 text-center">
                                                            <Checkbox
                                                                id={`permission_${permission.id}`}
                                                                name={`permission_${permission.id}`}
                                                                checked={
                                                                    selectedRole?.permissions?.some(p => p.id === permission.id) || false
                                                                }
                                                                disabled // Deshabilitar el checkbox ya que es una vista
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default RoleView;
