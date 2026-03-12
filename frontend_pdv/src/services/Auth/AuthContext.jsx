import React, { createContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import { useLocation } from 'wouter';

// Crear el contexto
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // Nuevo estado para guardar datos del usuario
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Cargar los datos del usuario desde localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = storedUser?.token;

    if (token) {
      const decodedToken = jwtDecode(token);

      // Verificar si el token ha expirado
      if (decodedToken.exp * 1000 > Date.now()) {
        setIsAuthenticated(true);
        setUser(storedUser); // Establecer datos del usuario si el token es válido
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
