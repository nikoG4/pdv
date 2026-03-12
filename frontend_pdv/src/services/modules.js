
import { PackageIcon, ClipboardIcon, UsersIcon, SettingsIcon, CurrenciesIcon, CartIcon, HomeIcon } from '../components/ui/icons';
import Products from '../components/Products';
import Categories from '../components/Categories';
import Clients from '../components/Clients';
import Suppliers from '../components/Supliers';
import Roles from '../components/Roles';
import PurchaseProducts from '../components/PurchaseProducts';
import Users from '../components/Users';
import SaleProducts from '../components/SaleProducts';
import Config from '../components/Config/Config';
import CashOutflows from '../components/CashOutflows';
import CashInflows from '../components/CashInflows';
import QuickAccess from '../components/Home/QuickAccess';


export const INDEPENDENT_MODULES = [
  { path: '/', title: 'Inicio', component: QuickAccess, icon: HomeIcon, permission: null, }
];


export const MODULE_GROUPS = [
  {
    group: 'Movimientos',
    items: [
      { path: '/sales', title: 'Ventas', component: SaleProducts, icon: CartIcon, permission: 'ProductSale.all' },
      { path: '/purchases', title: 'Compras', component: PurchaseProducts, icon: CurrenciesIcon, permission: 'ProductPurchase.all' },
      { path: '/cash-outflows', title: 'Salidas de Efectivo', component: CashOutflows, icon: CurrenciesIcon, permission: 'CashOutflow.all' },
      { path: '/cash-inflows', title: 'Entradas de Efectivo', component: CashInflows, icon: CurrenciesIcon, permission: 'CashInflow.all' },
    ]
  },
  {
    group: 'Catálogos',
    items: [
      { path: '/products', title: 'Productos', component: Products, icon: PackageIcon, permission: 'Product.all' },
      { path: '/categories', title: 'Categorías', component: Categories, icon: ClipboardIcon, permission: 'Category.all' },
      { path: '/clients', title: 'Clientes', component: Clients, icon: UsersIcon, permission: 'Client.all' },
      { path: '/suppliers', title: 'Proveedores', component: Suppliers, icon: UsersIcon, permission: 'Supplier.all' },
    ]
  },
  {
    group: 'Ajustes',
    items: [
      { path: '/users', title: 'Usuarios', component: Users, icon: UsersIcon, permission: 'User.all' },
      { path: '/roles', title: 'Roles', component: Roles, icon: SettingsIcon, permission: 'Role.all' },
      { path: '/settings', title: 'Configuración', component: Config, icon: SettingsIcon, permission: 'AppConfig.read' },
    ]
  }
];