import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

// Formateador de moneda estilo argentino
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-AR', { 
    style: 'currency', 
    currency: 'ARS', 
    maximumFractionDigits: 0 
  }).format(price);
};

export default function Layout({ children }) {
  const { cart, removeFromCart, cartCount, cartTotal } = useCart(); 
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Lógica de pago conectada a tu backend de Django
  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const items = cart.map(item => ({
        id: item.variante.id, // ¡Importante! Enviamos el ID de la variante a Django
        title: `${item.producto.nombre} - ${item.variante.color} ${item.variante.talle}`,
        quantity: item.cantidad,
        unit_price: item.variante.precio_base
      }));

      const response = await fetch('http://127.0.0.1:8000/api/create_preference/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert('Error al generar el pago: ' + (data.error || 'Desconocido'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al conectar con el servidor de pagos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#111111] font-sans selection:bg-black selection:text-white relative">
      
      {/* NAVBAR */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl font-black tracking-tighter uppercase flex items-center gap-2">
            <div className="w-8 h-8 bg-black text-white rounded-md flex items-center justify-center">
              <ShoppingCart size={16} strokeWidth={3} />
            </div>
            Prime<span className="text-gray-400">.</span>
          </Link>

          <nav className="hidden md:flex gap-8 text-sm font-bold tracking-widest uppercase text-gray-500">
            <Link to="/" className="hover:text-black transition-colors">Inicio</Link>
            <Link to="/productos" className="hover:text-black transition-colors">Catálogo</Link>
          </nav>

          <div className="flex items-center gap-5 text-gray-800">
            <button className="hover:text-black transition-colors hidden sm:block">
              <Search size={20} />
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative hover:text-black transition-colors flex items-center gap-2"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL (Acá se inyectan las páginas) */}
      <main className="flex-grow pt-20">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-black text-white py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-black tracking-tighter uppercase flex items-center gap-2">
            Prime Logic LT<span className="text-gray-600">.</span>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest text-center md:text-left">
            © 2026 Prime Logic LT. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* CARRITO LATERAL */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 transition-opacity backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      )}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
            <ShoppingCart size={20}/> Tu Carrito
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-black transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
              <ShoppingCart size={48} strokeWidth={1} />
              <p className="text-center font-medium">Tu carrito está vacío</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.variante.id} className="flex gap-4 border-b border-gray-100 pb-4">
                <img src={item.producto.image || 'https://via.placeholder.com/80'} alt={item.producto.nombre} className="w-20 h-20 object-cover rounded-xl bg-gray-100" />
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="font-bold text-gray-800 text-sm leading-tight">{item.producto.nombre}</h3>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{item.variante.color} - {item.variante.talle}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm font-bold text-black">{item.cantidad} x {formatPrice(item.variante.precio_base)}</span>
                    <button onClick={() => removeFromCart(item.variante.id)} className="text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-red-500 transition-colors">
                      Quitar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-gray-500 uppercase tracking-widest text-sm">Total a pagar:</span>
            <span className="text-3xl font-black text-black">{formatPrice(cartTotal)}</span>
          </div>
          <button 
            onClick={handlePayment}
            disabled={cart.length === 0 || isLoading}
            className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all ${cart.length === 0 || isLoading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#009EE3] text-white hover:bg-[#008ACB] shadow-lg shadow-blue-200/50 active:scale-95'}`}
          >
            {isLoading ? 'Conectando...' : 'Pagar con Mercado Pago'}
          </button>
        </div>
      </div>
    </div>
  );
}