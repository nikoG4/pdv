import { Link } from "wouter";
import { ClipboardIcon, PackageIcon, UsersIcon, CurrenciesIcon } from "../ui/icons";
import { useContext } from "react";
import { AuthContext } from "./../../services/Auth/AuthContext"; // Importar el contexto de autenticación

const quickAccessItems = [
  { path: "/sales", text: "Ventas", icon: <ClipboardIcon className="h-8 w-8" />, permission: "ProductSale.all" },
  { path: "/purchases", text: "Compras", icon: <ClipboardIcon className="h-8 w-8" />, permission: "ProductPurchase.all" },
  { path: "/products", text: "Productos", icon: <PackageIcon className="h-8 w-8" />, permission: "Product.all" },
  { path: "/clients", text: "Clientes", icon: <UsersIcon className="h-8 w-8" />, permission: "Client.all" },
  { path: "/suppliers", text: "Proveedores", icon: <CurrenciesIcon className="h-8 w-8" />, permission: "Supplier.all" },
  { path: "/categories", text: "Categorías", icon: <ClipboardIcon className="h-8 w-8" />, permission: "Category.all" },
  { path: "/roles", text: "Roles", icon: <ClipboardIcon className="h-8 w-8" />, permission: "Role.all" },
  { path: "/users", text: "Usuarios", icon: <UsersIcon className="h-8 w-8" />, permission: "User.all" },
];

const QuickAccess = () => {
  const { user } = useContext(AuthContext); // Obtener el usuario del contexto

  // Verificar si el usuario tiene permiso
  const hasPermission = (permission) => {
    return user?.authorities?.includes(permission);
  };

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 p-4">
      {quickAccessItems.map((item) => (
        hasPermission(item.permission) && (
          <Link 
            key={item.path} 
            href={item.path} 
            className="flex flex-col items-center justify-center p-4 border rounded-lg shadow hover:text-primary transition-all"
          >
            <div className="mb-2">{item.icon}</div>
            <span className="text-center text-sm font-medium">{item.text}</span>
          </Link>
        )
      ))}
    </div>
  );
};

export default QuickAccess;
