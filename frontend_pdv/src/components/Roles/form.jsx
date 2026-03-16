import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { ArrowLeftIcon } from '../ui/icons';

const RoleForm = ({ selectedRole, permissions, handleRoleUpdate, handleRoleCreate, setRole }) => {
    const [openModules, setOpenModules] = useState({});
    const [roleName, setRoleName] = useState('');
    const [selectedPermissionIds, setSelectedPermissionIds] = useState(new Set());

    useEffect(() => {
        setRoleName(selectedRole?.name || '');
        setSelectedPermissionIds(new Set((selectedRole?.permissions || []).map((permission) => permission.id)));
    }, [selectedRole]);

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

    const togglePermission = (permissionId, isChecked) => {
        setSelectedPermissionIds((prev) => {
            const next = new Set(prev);

            if (isChecked) {
                next.add(permissionId);
            } else {
                next.delete(permissionId);
            }

            return next;
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const updatedRole = {
            id: selectedRole?.id,
            name: roleName,
            permissions: permissions
                .filter((permission) => selectedPermissionIds.has(permission.id))
                .map((permission) => ({ id: permission.id })),
        };

        if (selectedRole?.id) {
            handleRoleUpdate(updatedRole);
            return;
        }

        handleRoleCreate(updatedRole);
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
                    {selectedRole?.id ? 'Editar Rol' : 'Crear Rol'}
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Detalles del rol</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre del Rol</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={roleName}
                                    onChange={(event) => setRoleName(event.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-4">
                                <Label>Permisos</Label>
                                {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                                    <div key={module}>
                                        <button
                                            type="button"
                                            onClick={() => toggleModule(module)}
                                            className="flex w-full items-center justify-between rounded bg-gray-200 p-2 text-left"
                                        >
                                            <h3 className="font-bold">{module}</h3>
                                            <span>{openModules[module] ? '-' : '+'}</span>
                                        </button>
                                        {openModules[module] && (
                                            <table className="min-w-full bg-white">
                                                <thead>
                                                    <tr>
                                                        <th className="px-4 py-2">Permiso</th>
                                                        <th className="px-4 py-2" style={{ width: '100px' }}>Asignar</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {modulePermissions.map((permission) => (
                                                        <tr key={permission.id}>
                                                            <td className="border px-4 py-2">{permission.description}</td>
                                                            <td className="border px-4 py-2 text-center">
                                                                <Checkbox
                                                                    id={`permission_${permission.id}`}
                                                                    name={`permission_${permission.id}`}
                                                                    checked={selectedPermissionIds.has(permission.id)}
                                                                    onChange={(event) =>
                                                                        togglePermission(permission.id, event.target.checked)
                                                                    }
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
                            <div className="flex justify-end">
                                <Button type="submit">Guardar</Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default RoleForm;
