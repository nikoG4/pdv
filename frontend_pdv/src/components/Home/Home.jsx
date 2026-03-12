// Home.js
import { useState, useContext, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import Sidebar from '../ui/sidebar';
import Navbar from '../ui/navbar';
import { MODULE_GROUPS } from './../../services/modules';
import { INDEPENDENT_MODULES } from './../../services/modules';
import { AuthContext } from '../../services/Auth/AuthContext';
import Login from '../Auth/Login';


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

  // Flatten items para buscar el título según la ruta
  const allRoutes = MODULE_GROUPS.flatMap(group =>
    group.items.map(item => ({ path: item.path, title: item.title }))
  );

  // Actualizar título según la ruta
  useEffect(() => {
    const route = allRoutes.find(r => r.path === location);
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
            {MODULE_GROUPS.flatMap(group =>
              group.items.map(({ path, component: Component }) => (
                <Route key={path} path={path} component={Component} />
              ))
            )}
            {INDEPENDENT_MODULES.map(({ path, component: Component }) => (
              <Route key={path} path={path} component={Component} />
            ))}
          </Switch>
        </main>
      </div>

      <div className="drawer-side">
        <label htmlFor="main-drawer" className="drawer-overlay"></label>
        <Sidebar isOpen={isMobile ? true : sidebarOpen} />
      </div>
    </div>
  );
};

export default Home;