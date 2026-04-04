import React, { useState } from 'react';
import WhatsAppButton from './WhatsAppButton';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, User, Instagram, Facebook, Twitter, MapPin, Phone, Mail, ArrowRight, Star, Gift, TrendingUp, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';


const formatPrice = (price) => {
  return new Intl.NumberFormat('es-AR', { 
    style: 'currency', 
    currency: 'ARS', 
    maximumFractionDigits: 0 
  }).format(price);
};

export default function Layout({ children }) {
  const { cart, removeFromCart, cartCount, cartTotal } = useCart(); 
  const { isAuthenticated, isAdmin } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // NUEVO: Lógica del envío gratis
  const FREE_SHIPPING_THRESHOLD = 50000; // Puse 50.000, pero cambialo al valor que quieras
  const progressPercentage = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountMissing = FREE_SHIPPING_THRESHOLD - cartTotal;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#111111] font-sans selection:bg-black selection:text-white relative">
      
     {/* NAVBAR ANIMADA Y PREMIUM */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-100 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* LOGO ANIMADO */}
          <Link to="/" className="group text-2xl font-black tracking-tighter uppercase flex items-center gap-2">
            <motion.div 
              whileHover={{ rotate: -10, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-9 h-9 bg-black text-white rounded-xl flex items-center justify-center shadow-md group-hover:bg-[#009EE3] transition-colors duration-300"
            >
              <ShoppingCart size={18} strokeWidth={2.5} />
            </motion.div>
            <span className="group-hover:text-[#009EE3] transition-colors duration-300">
              Prime<span className="text-gray-300 group-hover:text-black">.</span>
            </span>
          </Link>

          {/* LINKS CON SUBRAYADO MÁGICO */}
          <nav className="hidden md:flex gap-10 text-xs font-black tracking-[0.2em] uppercase text-gray-500">
            <Link to="/" className="relative group hover:text-black transition-colors py-2">
              INICIO
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#009EE3] transition-all duration-300 ease-out group-hover:w-full"></span>
            </Link>
            <Link to="/productos" className="relative group hover:text-black transition-colors py-2">
              CATÁLOGO
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#009EE3] transition-all duration-300 ease-out group-hover:w-full"></span>
            </Link>
          </nav>

 {/* ICONOS INTERACTIVOS */}
          <div className="flex items-center gap-6 text-gray-700">
            
            {/* NUEVO: BOTÓN PANEL ADMIN (Oculto para mortales, visible para admins) */}
            {isAdmin && (
              <Link to="/admin" className="hidden sm:block group relative">
                <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }} className="text-gray-400 hover:text-[#009EE3] transition-colors">
                  <Shield size={22} strokeWidth={2.5} />
                </motion.div>
                {/* Tooltip que aparece al pasar el mouse */}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Admin
                </span>
              </Link>
            )}

            <motion.button whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }} className="hover:text-[#009EE3] transition-colors hidden sm:block">
              <Search size={22} strokeWidth={2} />
            </motion.button>
            
            <Link to={isAuthenticated ? "/perfil" : "/auth"} className="hidden sm:block">
              <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }} className="hover:text-[#009EE3] transition-colors">
                <User size={24} strokeWidth={2} />
              </motion.div>
            </Link>

            {/* BOTÓN DE CARRITO CON BADGE QUE SALTA */}
            <motion.button 
              whileHover={{ scale: 1.1, y: -2 }} 
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsCartOpen(true)}
              className="relative hover:text-[#009EE3] transition-colors flex items-center gap-2"
            >
              <ShoppingCart size={24} strokeWidth={2} />
              
              {/* Esta key={cartCount} es el truco para que la animación se dispare cada vez que cambia el número */}
              {cartCount > 0 && (
                <motion.span 
                  key={cartCount} 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="absolute -top-2.5 -right-2.5 bg-[#009EE3] text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg border-2 border-white"
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.button>

            {/* BOTÓN HAMBURGUESA PARA CELULARES */}
            <button className="md:hidden hover:text-[#009EE3] transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </motion.header>
{/* NUEVO: MENÚ MÓVIL DESPLEGABLE */}
      <div 
        className={`fixed top-20 left-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 z-30 shadow-xl overflow-hidden transition-all duration-300 ease-in-out md:hidden flex flex-col ${
          isMobileMenuOpen ? 'max-h-96 opacity-100 py-6' : 'max-h-0 opacity-0 py-0'
        }`}
      >
        <nav className="flex flex-col gap-6 px-6 text-sm font-black tracking-widest uppercase text-gray-800">
          <Link 
            to="/" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="hover:text-[#009EE3] transition-colors"
          >
            Inicio
          </Link>
          <Link 
            to="/productos" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="hover:text-[#009EE3] transition-colors"
          >
            Catálogo
          </Link>
          
          {/* Línea divisoria */}
          <div className="w-full h-px bg-gray-100 my-2"></div>
          
          <Link 
            to={isAuthenticated ? "/perfil" : "/auth"} 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="flex items-center gap-3 text-gray-500 hover:text-black transition-colors"
          >
            <User size={20} />
            {isAuthenticated ? 'Mi Perfil' : 'Iniciar Sesión'}
          </Link>
        </nav>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-grow pt-20">
        {children}
      </main>     

     
      {/* FOOTER NUEVO */}
      <footer className="bg-black text-white pt-16 pb-8 px-6 mt-auto">
        <div className="max-w-7xl mx-auto">
          {/* SECCIÓN SUPERIOR: 4 Columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Columna 1: Marca y Redes */}
            <div className="flex flex-col gap-4">
              <div className="text-2xl font-black tracking-tighter uppercase flex items-center gap-2 mb-2">
                Prime Logic LT<span className="text-[#009EE3]">.</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Elevando tu día a día con tecnología premium. Diseñado para quienes buscan excelencia, rendimiento y estilo.
              </p>
              <div className="flex gap-4 mt-2">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center hover:bg-[#009EE3] transition-colors"><Instagram size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center hover:bg-[#009EE3] transition-colors"><Facebook size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center hover:bg-[#009EE3] transition-colors"><Twitter size={18} /></a>
              </div>
            </div>

            {/* Columna 2: Navegación */}
            <div className="flex flex-col gap-4">
              <h4 className="text-lg font-bold uppercase tracking-widest mb-2">Navegación</h4>
              <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">Inicio</Link>
              <Link to="/productos" className="text-gray-400 hover:text-white transition-colors text-sm">Catálogo</Link>
              <Link to={isAuthenticated ? "/perfil" : "/auth"} className="text-gray-400 hover:text-white transition-colors text-sm">Mi Perfil</Link>
            </div>

            {/* Columna 3: Contacto */}
            <div className="flex flex-col gap-4">
              <h4 className="text-lg font-bold uppercase tracking-widest mb-2">Contacto</h4>
              <div className="flex items-center gap-3 text-gray-400 text-sm hover:text-white transition-colors cursor-pointer">
                <MapPin size={16} className="text-[#009EE3]" />
                Godoy Cruz, Mendoza
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm hover:text-white transition-colors cursor-pointer">
                <Phone size={16} className="text-[#009EE3]" />
                +54 9 261 123 4567
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm hover:text-white transition-colors cursor-pointer">
                <Mail size={16} className="text-[#009EE3]" />
                hola@primelogic.com.ar
              </div>
            </div>

            {/* Columna 4: Newsletter */}
            <div className="flex flex-col gap-4">
              <h4 className="text-lg font-bold uppercase tracking-widest mb-2">Newsletter</h4>
              <p className="text-gray-400 text-sm">
                Suscribite para recibir ofertas exclusivas y novedades antes que nadie.
              </p>
              <div className="flex mt-2">
                <input 
                  type="email" 
                  placeholder="Tu email..." 
                  className="bg-gray-900 text-white px-4 py-3 rounded-l-xl outline-none focus:ring-1 focus:ring-[#009EE3] w-full text-sm placeholder-gray-600 border border-gray-800 focus:border-[#009EE3] transition-all"
                />
                <button className="bg-[#009EE3] hover:bg-blue-600 px-4 py-3 rounded-r-xl font-bold transition-colors flex items-center justify-center">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

          </div>

          {/* SECCIÓN INFERIOR: Copyright & Pagos */}
          <div className="pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest text-center md:text-left">
              © 2026 Prime Logic LT. Todos los derechos reservados.
            </p>
            <div className="flex gap-2 items-center">
              <div className="px-3 py-1.5 bg-gray-900 rounded-md text-[10px] font-black tracking-wider text-gray-400 border border-gray-800">VISA</div>
              <div className="px-3 py-1.5 bg-gray-900 rounded-md text-[10px] font-black tracking-wider text-gray-400 border border-gray-800">MASTERCARD</div>
              <div className="px-3 py-1.5 bg-gray-900 rounded-md text-[10px] font-black tracking-wider text-[#009EE3] border border-gray-800">MERCADO PAGO</div>
            </div>
          </div>
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
        {/* NUEVO: BARRA DE ENVÍO GRATIS - VERSIÓN ANIMADA Y CREATIVA */}
        {cart.length > 0 && (
          <div className="bg-gray-50 px-6 py-5 border-b border-gray-100 relative overflow-hidden">
            {/* Fondo decorativo sutil */}
            <div className="absolute inset-0 opacity-5">
              <Star size={100} className="absolute -top-10 -left-10 text-blue-100" />
              <Star size={80} className="absolute -bottom-10 -right-10 text-blue-100" />
            </div>

            {cartTotal >= FREE_SHIPPING_THRESHOLD ? (
              // ESTADO: ENVÍO GRATIS LOGRADO (CON ANIMACIÓN)
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative z-10 text-center flex flex-col items-center gap-2"
              >
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1.1, 1] }}
                  transition={{ duration: 0.8, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }}
                >
                  <Gift size={32} className="text-[#009EE3]" />
                </motion.div>
                <p className="text-xs font-black text-gray-900 flex flex-col items-center justify-center gap-1 uppercase tracking-widest">
                  <span className="text-[#009EE3]">¡Felicidades, Luciano!</span>
                  <span className="text-xl font-extrabold text-black">Envío Gratis</span>
                  <span className="text-[10px] font-medium text-gray-500 normal-case">para toda tu tecnología premium.</span>
                </p>
              </motion.div>
            ) : (
              // ESTADO: PROGRESO HACIA EL ENVÍO GRATIS
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex flex-col items-center gap-1.5">
                  <TrendingUp size={16} className="text-[#009EE3]" />
                  <p className="text-[10px] font-bold text-gray-600 text-center uppercase tracking-widest">
                    Estás a <span className="text-black text-xs font-black">{formatPrice(amountMissing)}</span> de desbloquear
                  </p>
                  <p className="text-xl font-extrabold text-black uppercase tracking-tight">
                    Envío Gratis
                  </p>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden shadow-inner border border-gray-100">
                  <div 
                    className="bg-green-500 h-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        
        )}

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
            <span className="font-bold text-gray-500 uppercase tracking-widest text-sm">Subtotal:</span>
            <span className="text-3xl font-black text-black">{formatPrice(cartTotal)}</span>
          </div>
          
          <Link 
            to="/carrito"
            onClick={() => setIsCartOpen(false)}
            className={`w-full py-4 flex justify-center items-center rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-md ${
              cart.length === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none' 
                : 'bg-black text-white hover:bg-gray-800 active:scale-95'
            }`}
          >
            Ir al Checkout
          </Link>
        </div>
      </div>
      <WhatsAppButton />
    </div>
  );
}