import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext'; 
import { AuthProvider, useAuth } from './context/AuthContext'; 
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Categories from './pages/Categories';
import Success from './pages/Success';
import Failure from './pages/Failure';
import Profile from './pages/Profile';
import CartPage from './pages/CartPage';
import AuthPage from './pages/AuthPage';

// NUEVO: Importamos el Dashboard real
import AdminDashboard from './pages/AdminDashboard'; 

// Componente Guardián (Lo mantenemos igual)
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400">Verificando seguridad...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <AuthProvider> 
        <CartProvider>
          <Layout>
            <Routes>
              {/* Rutas Públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/productos" element={<Products />} />
              <Route path="/productos/:id" element={<ProductDetail />} />
              <Route path="/categorias" element={<Categories />} />
              <Route path="/success" element={<Success />} />
              <Route path="/failure" element={<Failure />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/carrito" element={<CartPage />} />
              
              {/* Ruta Privada: Cliente Normal */}
              <Route path="/perfil" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              {/* Ruta Privada: SOLO ADMIN */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard /> {/* ACÁ REEMPLAZAMOS EL PLACEHOLDER */}
                </ProtectedRoute>
              } />
              
            </Routes>
          </Layout>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}