/* eslint-disable react/prop-types */
import { createContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import { useLocation } from 'wouter';
import AppConfigService from '../AppConfigService';
import axiosInstance from '../axiosConfig';

// Crear el contexto
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // Nuevo estado para guardar datos del usuario
  const [location, setLocation] = useLocation();

  // Funcion para construir URL completa
  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const baseUrl = axiosInstance.defaults.baseURL || '';
    return `${baseUrl}${url}`;
  };

  // Funcion para cargar configuracion de la app
  const loadAppConfig = async () => {
    try {
      const response = await AppConfigService.getCurrentConfig();
      const config = response.data;
      // Guardar en localStorage
      localStorage.setItem('appName', config.appName || 'Punto de Venta');
      localStorage.setItem('logoUrl', config.logoUrl || '');
      localStorage.setItem('faviconUrl', config.faviconUrl || '');
      localStorage.setItem('salesPosDefaultUsers', config.posDefaultUsers || '');
      // Actualizar titulo del documento
      document.title = config.appName || 'Punto de Venta';
      // Actualizar favicon si existe
      if (config.faviconUrl) {
        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = getFullImageUrl(config.faviconUrl);
      }
      // Disparar evento para notificar cambios
      window.dispatchEvent(new Event('app-config-changed'));
    } catch (error) {
      console.error('Error cargando configuracion:', error);
    }
  };

  useEffect(() => {
    // Cargar los datos del usuario desde localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = storedUser?.token;

    if (token) {
      const decodedToken = jwtDecode(token);

      // Verificar si el token ha expirado
      if (decodedToken.exp * 1000 > Date.now()) {
        setIsAuthenticated(true);
        setUser(storedUser); // Establecer datos del usuario si el token es valido
        // Cargar configuracion de la app
        loadAppConfig();
      } else {
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        setLocation('/login');
      }
    } else {
      setLocation('/login');
    }
  }, [setLocation, location]);

  const login = (userData) => {
    // Guardar los datos del usuario y el token en el estado y localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData); // Actualizar datos del usuario en el estado
    // Cargar configuracion de la app despues de login
    loadAppConfig();
    setLocation('/');
  };

  const logout = () => {
    // Limpiar los datos del usuario del estado y localStorage
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setLocation('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
