import React, { useEffect, useState } from 'react';
import { useCart } from './context/CartContext';
import { motion } from "framer-motion";
import { 
  ShoppingCart, Search, Menu, X, ArrowRight, 
  Star, Truck, ShieldCheck, CreditCard, ChevronRight 
} from "lucide-react";

// Formateador de moneda estilo argentino
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-AR', { 
    style: 'currency', 
    currency: 'ARS', 
    maximumFractionDigits: 0 
  }).format(price);
};

// --- COMPONENTE PRODUCTO (Diseño Tomás + Lógica Luciano) ---
const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || null);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group flex flex-col h-full"
    >
      {/* Imagen */}
      <div className="relative aspect-square mb-4 overflow-hidden bg-gray-100 rounded-2xl">
        <img 
          src={product.image || 'https://via.placeholder.com/800'} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
      </div>

      {/* Info y Controles */}
      <div className="flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">{product.category_name}</span>
          <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
             <Star size={12} className="fill-gray-300" /> Nuevo
          </div>
        </div>
        
        <h3 className="text-lg font-bold leading-tight mb-2 group-hover:text-gray-600 transition-colors">
          {product.name}
        </h3>
        <p className="font-black text-xl mb-4">
          {formatPrice(product.base_price)}
        </p>

        {/* Tu selector de variantes */}
        <div className="mt-auto mb-3">
          <select 
            className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-lg p-2 text-sm focus:ring-black focus:border-black transition-colors"
            value={selectedVariant?.id || ''}
            onChange={(e) => {
              const variant = product.variants.find(v => v.id === parseInt(e.target.value));
              setSelectedVariant(variant);
            }}
          >
            {product.variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.color} - {variant.size} 
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => addToCart(product, selectedVariant)}
          className="w-full bg-black text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-md active:scale-95"
        >
          <ShoppingCart size={16} /> Agregar
        </button>
      </div>
    </motion.div>
  );
};

// --- APLICACIÓN PRINCIPAL ---
export default function App() {
  const [products, setProducts] = useState([]);
  const { cart, removeFromCart, cartCount, cartTotal } = useCart(); 
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // --- NUEVO: Estado para saber si está cargando el pago ---
  const [isLoading, setIsLoading] = useState(false);

  // Tu Fetch a la base de datos de Django
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/products/')
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error('Error fetching products:', error));
  }, []);

  // --- NUEVA FUNCIÓN: Procesar el pago ---
  const handlePayment = async () => {
    setIsLoading(true);
    try {
      // 1. Preparamos los datos del carrito para enviarlos a Django
      const items = cart.map(item => ({
        title: `${item.product.name} - ${item.variant.color} ${item.variant.size}`,
        quantity: item.quantity,
        unit_price: item.product.base_price
      }));

      // 2. Hacemos la petición a nuestra nueva vista de Mercado Pago
      const response = await fetch('http://127.0.0.1:8000/api/create_preference/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();

      // 3. Si Django nos devuelve el link mágico, redirigimos al cliente
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
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] font-sans selection:bg-black selection:text-white relative">
      
      {/* NAVBAR DE TOMÁS */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#" className="text-2xl font-black tracking-tighter uppercase flex items-center gap-2">
            <div className="w-8 h-8 bg-black text-white rounded-md flex items-center justify-center">
              <ShoppingCart size={16} strokeWidth={3} />
            </div>
            Prime<span className="text-gray-400">.</span>
          </a>

          <nav className="hidden md:flex gap-8 text-sm font-bold tracking-widest uppercase text-gray-500">
            <a href="#" className="hover:text-black transition-colors">Inicio</a>
            <a href="#productos" className="hover:text-black transition-colors">Catálogo</a>
          </nav>

          <div className="flex items-center gap-5 text-gray-800">
            <button className="hover:text-black transition-colors hidden sm:block">
              <Search size={20} />
            </button>
            {/* Botón del carrito conectado a tu estado */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative hover:text-black transition-colors flex items-center gap-2"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
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

      <main className="pt-20">
        {/* HERO SECTION DE TOMÁS */}
        <section className="relative w-full h-[80vh] min-h-[600px] flex items-center bg-gray-100 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1600" 
              alt="Hero E-commerce" 
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl text-white">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight mb-6">
                Tecnología que <br /> te acompaña.
              </h1>
              <p className="text-lg text-gray-200 mb-8 max-w-lg font-medium">
                Descubrí nuestra selección de productos premium diseñados para elevar tu día a día.
              </p>
              <a href="#productos" className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-gray-200 transition-colors">
                Comprar Ahora <ArrowRight size={18} />
              </a>
            </motion.div>
          </div>
        </section>

        {/* BENEFICIOS */}
        <section className="bg-white py-12 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {[
              { icon: <Truck />, title: "Envíos a todo el país", desc: "Despachamos en el día" },
              { icon: <CreditCard />, title: "Mercado Pago", desc: "Todas las tarjetas y cuotas" },
              { icon: <ShieldCheck />, title: "Compra segura", desc: "Protegemos tus datos" },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center pt-8 md:pt-0 px-4">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-black mb-4">{item.icon}</div>
                <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* GRILLA DE PRODUCTOS (Conectada a Django) */}
        <section id="productos" className="py-24 bg-[#FAFAFA]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-black tracking-tighter mb-2">Nuestro Catálogo.</h2>
                <p className="text-gray-500 font-medium">Lo último en tecnología y accesorios.</p>
              </div>
            </div>
            {/* Mapeo de TUS productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-black text-white py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-black tracking-tighter uppercase flex items-center gap-2">
            Prime Logic LT<span className="text-gray-600">.</span>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest text-center md:text-left">
            © 2026 Prime Logic LT. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* --- TU PANEL LATERAL DEL CARRITO --- */}
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
              <div key={item.variant.id} className="flex gap-4 border-b border-gray-100 pb-4">
                <img src={item.product.image || 'https://via.placeholder.com/80'} alt={item.product.name} className="w-20 h-20 object-cover rounded-xl bg-gray-100" />
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="font-bold text-gray-800 text-sm leading-tight">{item.product.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{item.variant.color} - {item.variant.size}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm font-bold text-black">{item.quantity} x {formatPrice(item.product.base_price)}</span>
                    <button onClick={() => removeFromCart(item.variant.id)} className="text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-red-500 transition-colors">
                      Quitar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-white">
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-gray-500 uppercase tracking-widest text-sm">Total a pagar:</span>
            <span className="text-3xl font-black text-black">{formatPrice(cartTotal)}</span>
          </div>
         <button 
            onClick={handlePayment}
            disabled={cart.length === 0 || isLoading}
            className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all ${cart.length === 0 || isLoading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#009EE3] text-white hover:bg-[#008ACB] shadow-lg shadow-blue-200/50'}`}
          >
            {isLoading ? 'Redirigiendo de forma segura...' : 'Pagar con Mercado Pago'}
          </button>
        </div>
      </div>

    </div>
  );
}