import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  // Instanciamos el motor de redirección
  const navigate = useNavigate(); 

  const checkUserStatus = async (token) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/mi-perfil/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setIsAdmin(data.is_admin);
      } else {
        // Si el token expiró (pasaron las 12hs), limpiamos y pateamos al login
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setIsAdmin(false);
        navigate('/auth');
        window.scrollTo(0, 0); // Nos aseguramos de que quede arriba
      }
    } catch (error) {
      console.error("Error al verificar sesión:", error);
    } finally {
      setIsAuthLoading(false);
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
    checkUserStatus(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setIsAdmin(false);
    // Redirección inmediata al cerrar sesión manualmente
    navigate('/auth');
    window.scrollTo(0, 0);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, isAuthLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);