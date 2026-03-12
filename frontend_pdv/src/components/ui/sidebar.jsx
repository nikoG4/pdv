// Sidebar.js
import { Link } from "wouter";
import { useState, useEffect, useContext } from "react";
import nextgenIcon from '../../assets/nextgen.svg';
import { AuthContext } from "./../../services/Auth/AuthContext";
import { MODULE_GROUPS } from './../../services/modules';
import { INDEPENDENT_MODULES } from './../../services/modules';



const Sidebar = ({ isOpen }) => {
  const { user } = useContext(AuthContext);
  const [appName, setAppName] = useState('Punto de venta');
  const [logoUrl, setLogoUrl] = useState('');

  // Inicializar todos los grupos abiertos
  const initialOpenGroups = MODULE_GROUPS.reduce((acc, group) => {
    acc[group.group] = true;
    return acc;
  }, {});
  const [openGroups, setOpenGroups] = useState(initialOpenGroups);

  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return url;
  };

  useEffect(() => {
    const storedAppName = localStorage.getItem('appName');
    const storedLogoUrl = localStorage.getItem('logoUrl');
    if (storedAppName) setAppName(storedAppName);
    if (storedLogoUrl) setLogoUrl(getFullImageUrl(storedLogoUrl));

    const handleStorageChange = () => {
      const newAppName = localStorage.getItem('appName');
      const newLogoUrl = localStorage.getItem('logoUrl');
      if (newAppName) setAppName(newAppName);
      if (newLogoUrl) setLogoUrl(getFullImageUrl(newLogoUrl));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('app-config-changed', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('app-config-changed', handleStorageChange);
    };
  }, []);

  const toggleGroup = (groupName) => {
    setOpenGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const hasPermission = (permission) => !permission || user?.authorities?.includes(permission);

  const displayLogo = logoUrl || nextgenIcon;
  const displayName = appName || 'Punto de venta';

  return (
    <div className={`border-r bg-base-100 dark:bg-base-800 transition-all duration-300 ${isOpen ? 'w-50' : 'w-18'} lg:block h-full`}>
      <div className="flex h-full max-h-screen flex-col gap-2 transition-all">
        {/* Logo y nombre */}
        <div className="flex items-center justify-between h-[60px] border-b px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <img src={displayLogo} className="w-8 h-8 mx-auto transition-all object-contain" alt={displayName} />
            {isOpen && (<span className="ml-2 transition-all truncate">{displayName}</span>)}
          </Link>
        </div>

        {/* Módulos independientes */}
        <div className="flex flex-col py-2">
          {INDEPENDENT_MODULES.filter(m => hasPermission(m.permission)).map(module => (
            <Link
              key={module.path}
              href={module.path}
              className="flex items-center gap-2 px-4 py-2 rounded hover:bg-base-200 text-sm"
            >
              {module.icon && <module.icon className="h-7 w-7" />}
              {isOpen && <span className="text-sm font-semibold">{module.title}</span>}
            </Link>
          ))}
        </div>

        {/* Grupos de módulos */}
        <div className="flex-1 overflow-auto py-2">
          {MODULE_GROUPS.map(group => {
            const visibleItems = group.items.filter(item => hasPermission(item.permission));
            if (visibleItems.length === 0) return null;

            const isOpenGroup = openGroups[group.group];

            return (
              <div key={group.group}>
                <button
                  onClick={() => toggleGroup(group.group)}
                  className="flex items-center justify-between w-full px-4 py-2 font-semibold text-left hover:bg-muted rounded"
                >
                  <span className="text-sm">{group.group}</span>
                  <span className="text-sm">{isOpenGroup ? '▼' : '▲'}</span>
                </button>

                <div
                  style={{
                    maxHeight: isOpenGroup ? `${visibleItems.length * 2.5}rem` : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease'
                  }}
                  className="flex flex-col pl-6 mt-1 text-sm"
                >
                  {visibleItems.map(item => (
                    <Link
                      key={item.path}
                      href={item.path}
                      className="flex items-center gap-2 px-3 py-2 rounded hover:bg-base-200 text-sm"
                    >
                      {item.icon && <item.icon className="h-5 w-5" />}
                      {isOpen && <span>{item.title}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;