import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext'; // Asegurate de tener este import
import { AuthProvider } from './context/AuthContext'; // NUEVO IMPORT
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

export default function App() {
  return (
    <Router>
      <AuthProvider> {/* <-- NUEVO WRAPPER */}
        <CartProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/productos" element={<Products />} />
              <Route path="/productos/:id" element={<ProductDetail />} />
              <Route path="/categorias" element={<Categories />} />
              <Route path="/success" element={<Success />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/carrito" element={<CartPage />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/failure" element={<Failure />} />
            </Routes>
          </Layout>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}