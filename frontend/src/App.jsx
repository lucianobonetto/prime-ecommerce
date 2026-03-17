import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ShoppingCart, Search, Menu, X, ArrowRight, 
  Star, Truck, ShieldCheck, CreditCard, ChevronRight 
} from "lucide-react";

/* --- DATOS DE PRODUCTOS GENÉRICOS --- */
const PRODUCTS = [
  {
    id: 1,
    name: "Auriculares Noise Cancelling",
    price: 125000,
    rating: 4.9,
    category: "Audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
    badge: "Más Vendido"
  },
  {
    id: 2,
    name: "Reloj Inteligente Serie X",
    price: 89000,
    rating: 4.7,
    category: "Wearables",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
    badge: "Nuevo"
  },
  {
    id: 3,
    name: "Cámara Mirrorless 4K",
    price: 450000,
    rating: 4.8,
    category: "Fotografía",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800",
    badge: null
  },
  {
    id: 4,
    name: "Lente Óptico 50mm",
    price: 180000,
    rating: 4.9,
    category: "Accesorios",
    image: "https://images.unsplash.com/photo-1617005082833-1eb585641496?auto=format&fit=crop&q=80&w=800",
    badge: "Oferta"
  }
];

export default function App() {
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Formateador de moneda (ARS)
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', { 
      style: 'currency', 
      currency: 'ARS', 
      maximumFractionDigits: 0 
    }).format(price);
  };

  const handleAddToCart = () => {
    setCartCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] font-sans selection:bg-black selection:text-white">
      
      {/* --- NAVBAR --- */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <a href="#" className="text-2xl font-black tracking-tighter uppercase flex items-center gap-2">
            <div className="w-8 h-8 bg-black text-white rounded-md flex items-center justify-center">
              <ShoppingCart size={16} strokeWidth={3} />
            </div>
            Store<span className="text-gray-400">.</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 text-sm font-bold tracking-widest uppercase text-gray-500">
            <a href="#" className="hover:text-black transition-colors">Inicio</a>
            <a href="#productos" className="hover:text-black transition-colors">Catálogo</a>
            <a href="#beneficios" className="hover:text-black transition-colors">Nosotros</a>
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-5 text-gray-800">
            <button className="hover:text-black transition-colors hidden sm:block">
              <Search size={20} />
            </button>
            <button className="relative hover:text-black transition-colors flex items-center gap-2">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4 shadow-lg absolute w-full">
            <a href="#" className="font-bold text-gray-800 uppercase text-sm tracking-widest">Inicio</a>
            <a href="#productos" className="font-bold text-gray-800 uppercase text-sm tracking-widest">Catálogo</a>
            <a href="#beneficios" className="font-bold text-gray-800 uppercase text-sm tracking-widest">Nosotros</a>
          </div>
        )}
      </header>

      <main className="pt-20">
        
        {/* --- HERO SECTION --- */}
        <section className="relative w-full h-[80vh] min-h-[600px] flex items-center bg-gray-100 overflow-hidden">
          {/* Imagen de fondo */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1600" 
              alt="Hero E-commerce" 
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl text-white"
            >
              <span className="inline-block py-1 px-3 border border-white/30 rounded-full text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm bg-white/10">
                Nueva Colección
              </span>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight mb-6">
                Redefiní tu <br /> estilo de vida.
              </h1>
              <p className="text-lg text-gray-200 mb-8 max-w-lg font-medium">
                Descubrí nuestra selección de productos premium diseñados para elevar tu día a día con tecnología y diseño de vanguardia.
              </p>
              <a 
                href="#productos" 
                className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-gray-200 transition-colors"
              >
                Comprar Ahora <ArrowRight size={18} />
              </a>
            </motion.div>
          </div>
        </section>

        {/* --- BENEFICIOS (TRUST BADGES) --- */}
        <section id="beneficios" className="bg-white py-12 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {[
              { icon: <Truck />, title: "Envío sin cargo", desc: "En compras mayores a $50.000" },
              { icon: <CreditCard />, title: "Cuotas fijas", desc: "Pagá con tu tarjeta preferida" },
              { icon: <ShieldCheck />, title: "Compra protegida", desc: "30 días para devoluciones" },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center pt-8 md:pt-0 px-4">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-black mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- GRILLA DE PRODUCTOS --- */}
        <section id="productos" className="py-24 bg-[#FAFAFA]">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-black tracking-tighter mb-2">Destacados.</h2>
                <p className="text-gray-500 font-medium">Lo más elegido por nuestros clientes.</p>
              </div>
              <a href="#" className="hidden md:flex items-center gap-1 text-sm font-bold uppercase tracking-widest hover:text-gray-500 transition-colors">
                Ver todo <ChevronRight size={16} />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {PRODUCTS.map((product) => (
                <motion.div 
                  key={product.id} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="group cursor-pointer"
                >
                  {/* Contenedor Imagen */}
                  <div className="relative aspect-square mb-4 overflow-hidden bg-gray-100 rounded-2xl">
                    {product.badge && (
                      <div className="absolute top-3 left-3 z-10 bg-black text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full">
                        {product.badge}
                      </div>
                    )}
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    
                    {/* Botón flotante para agregar al carrito */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart();
                        }}
                        className="bg-white text-black px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-black hover:text-white transition-colors shadow-lg"
                      >
                        <ShoppingCart size={14} /> Agregar
                      </button>
                    </div>
                  </div>

                  {/* Info del Producto */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">{product.category}</span>
                      <div className="flex items-center gap-1 text-xs font-bold">
                        <Star size={12} className="fill-black text-black" /> {product.rating}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold leading-tight mb-2 group-hover:text-gray-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="font-black text-xl">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-black text-white py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-black tracking-tighter uppercase flex items-center gap-2">
            Store<span className="text-gray-600">.</span>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest text-center md:text-left">
            © 2026 E-commerce Template. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}