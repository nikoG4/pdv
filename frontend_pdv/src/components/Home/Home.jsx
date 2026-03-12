import { useState, useContext, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import Sidebar from '../ui/sidebar';
import Navbar from '../ui/navbar';
import Products from '../Products';
import Categories from '../Categories';
import Clients from '../Clients';
import Login from '../Auth/Login';
import { AuthContext } from '../../services/Auth/AuthContext';
import Suppliers from '../Supliers';
import Roles from '../Roles';
import PurchaseProducts from '../PurchaseProducts';
import Users from '../Users';
import QuickAccess from './QuickAccess';
import SaleProducts from '../SaleProducts';
import Config from '../Config/Config';
import CashOutflows from '../CashOutflows';
import CashInflows from '../CashInflows';

const ROUTES = [
  { path: '/', title: 'Home', component: QuickAccess },
  { path: '/products', title: 'Productos', component: Products },
  { path: '/categories', title: 'Categorías', component: Categories },
  { path: '/clients', title: 'Clientes', component: Clients },
  { path: '/suppliers', title: 'Proveedores', component: Suppliers },
  { path: '/purchases', title: 'Compras', component: PurchaseProducts },
  { path: '/sales', title: 'Ventas', component: SaleProducts },
  { path: '/roles', title: 'Roles', component: Roles },
  { path: '/users', title: 'Usuarios', component: Users },
  { path: '/settings', title: 'Configuración', component: Config },
  { path: '/cash-outflows', title: 'Salidas de Efectivo', component: CashOutflows },
  { path: '/cash-inflows', title: 'Entradas de Efectivo', component: CashInflows },
];

const Home = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [location] = useLocation();

  // Detectar si está en móvil
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Actualizar título según la ruta usando el mismo array de rutas
  useEffect(() => {
    const route = ROUTES.find(r => r.path === location);
    setTitle(route?.title || '');
  }, [location]);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="drawer lg:drawer-open min-h-screen">
      <input id="main-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <Navbar
          title={title}
          isOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          canToggle={!isMobile}
        />
        <main className="p-4 flex-1 overflow-y-auto">
          <Switch>
            {ROUTES.map(({ path, component: Component }) => (
              <Route key={path} path={path} component={Component} />
            ))}
          </Switch>
        </main>
      </div>
      <div className="drawer-side">
        <label htmlFor="main-drawer" className="drawer-overlay"></label>
        <Sidebar isOpen={isMobile ? true : sidebarOpen} canToggle={!isMobile} />
      </div>
    </div>
  );
};

export default Home;
