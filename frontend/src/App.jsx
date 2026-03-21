import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'; // Contiene Navbar, Footer y Carrito
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Categories from './pages/Categories';
import Success from './pages/Success';
import Failure from './pages/Failure';
import Profile from './pages/Profile';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Products />} />
          <Route path="/productos/:id" element={<ProductDetail />} />
          <Route path="/categorias" element={<Categories />} />
          <Route path="/success" element={<Success />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/failure" element={<Failure />} />
        </Routes>
      </Layout>
    </Router>
  );
}