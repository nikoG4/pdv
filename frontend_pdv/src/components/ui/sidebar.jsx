// Sidebar.js
import { Link } from "wouter";
import { useState } from "react";
import { PackageIcon, ClipboardIcon, UsersIcon, SettingsIcon, CurrenciesIcon, CartIcon, XIcon, MenuIcon } from "./icons";
import { useContext } from "react";
import nextgenIcon from '../../assets/nextgen.svg';

import { AuthContext } from "./../../services/Auth/AuthContext";

const menuItems = [
  { path: "/sales", text: "Ventas", icon: <CartIcon className="h-6 w-6" />, permission: "ProductSale.all" },
  { path: "/purchases", text: "Compras", icon: <CurrenciesIcon className="h-6 w-6" />, permission: "ProductPurchase.all" },
  { path: "/products", text: "Productos", icon: <PackageIcon className="h-6 w-6" />, permission: "Product.all" },
  { path: "/clients", text: "Clientes", icon: <UsersIcon className="h-6 w-6" />, permission: "Client.all" },
  { path: "/suppliers", text: "Proveedores", icon: <UsersIcon className="h-6 w-6" />, permission: "Supplier.all" },
  { path: "/categories", text: "Categorías", icon: <ClipboardIcon className="h-6 w-6" />, permission: "Category.all" },
  { path: "/cash-outflows", text: "Salidas de Efectivo", icon: <CurrenciesIcon className="h-6 w-6" />, permission: "CashOutflow.all" },
  { path: "/cash-inflows", text: "Entradas de Efectivo", icon: <CurrenciesIcon className="h-6 w-6" />, permission: "CashInflow.all" },
  { path: "/roles", text: "Roles", icon: <SettingsIcon className="h-6 w-6" />, permission: "Role.all" },
  { path: "/users", text: "Usuarios", icon: <UsersIcon className="h-6 w-6" />, permission: "User.all" },
  { path: "/settings", text: "Configuración", icon: <SettingsIcon className="h-6 w-6" />, permission: "User.all" }
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useContext(AuthContext);

  const hasPermission = (permission) => {
    return user?.authorities?.includes(permission);
  };

  return (
    <div className={`border-r bg-base-100 dark:bg-base-800  transition-all duration-300 ${isOpen ? 'w-50' : 'w-18'} lg:block h-full`}>
      <div className="flex h-full max-h-screen flex-col gap-2 transition-all">
        <div className="flex items-center justify-between h-[60px] border-b px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <img src={nextgenIcon} className="w-8 mx-auto transition-all" alt="Next Gen Icon" />
            {isOpen && (<span className="ml-2 transition-all">Punto de venta</span>)}
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-2 items-start px-2 text-sm font-medium">
            {menuItems.map((item) => (
              hasPermission(item.permission) && (
                <Link
                  key={item.path}
                  href={item.path}
                  className={(active) => 
                    (active ? 'text-primary' : ' text-muted-foreground') + 
                    " flex items-center gap-3 rounded-lg bg-muted px-3 py-2 transition-all hover:text-primary"
                  }
                >
                  {item.icon}
                  {isOpen && <span>{item.text}</span>}
                </Link>
              )
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
