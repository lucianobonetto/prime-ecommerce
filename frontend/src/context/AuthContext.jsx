import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // NUEVO
  const [isAuthLoading, setIsAuthLoading] = useState(true); // NUEVO: Evita parpadeos

  const checkUserStatus = async (token) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/mi-perfil/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setIsAdmin(data.is_admin); // Seteamos el superpoder
      } else {
        // Si el token expiró, lo limpiamos
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error al verificar sesión:", error);
    } finally {
      setIsAuthLoading(false); // Terminó de cargar
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkUserStatus(token);
    } else {
      setIsAuthLoading(false);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    setIsAuthLoading(true);
    checkUserStatus(token); // Al loguearse, preguntamos si es admin
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, isAuthLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);