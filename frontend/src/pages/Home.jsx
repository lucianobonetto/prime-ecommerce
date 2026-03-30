import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, ShieldCheck, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import FeaturedProducts from '../components/FeaturedProducts'; // NUEVO IMPORT

export default function Home() {
  return (
    <div className="w-full">
      {/* HERO SECTION PREMIUM */}
      <section className="relative w-full h-[85vh] min-h-[600px] flex items-center bg-black overflow-hidden">
        
        {/* FONDO CON EFECTO KEN BURNS (Zoom lento) */}
        <motion.div 
          initial={{ scale: 1 }}
          animate={{ scale: 1.08 }}
          transition={{ duration: 25, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1550009158-9efff6c9e17b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Tecnología Premium" 
            className="w-full h-full object-cover opacity-50 mix-blend-luminosity"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80' }}
          />
          {/* Un gradiente más oscuro a la izquierda para que el texto sea súper legible */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-10">
          <div className="max-w-2xl text-white">
            
            {/* ETIQUETA NUEVA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.2 }} 
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-12 h-0.5 bg-[#009EE3]"></div>
              <span className="text-[#009EE3] font-black tracking-[0.2em] text-xs uppercase">Nueva Generación</span>
            </motion.div>

            {/* TÍTULO PRINCIPAL CON DEGRADADO */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.05] mb-6"
            >
              Tecnología <br /> que te <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">acompaña.</span>
            </motion.h1>

            {/* PÁRRAFO */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg text-gray-300 mb-10 max-w-lg font-medium leading-relaxed"
            >
              Descubrí nuestra selección de productos premium diseñados para elevar tu día a día con Prime Logic LT.
            </motion.p>

            {/* BOTÓN MÁGICO */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link 
                to="/productos" 
                className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-[#009EE3] hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(0,158,227,0.4)] hover:-translate-y-1"
              >
                Comprar Ahora 
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {[
            { icon: <Truck size={24} />, title: "Envíos a todo el país", desc: "Despachamos en el día" },
            { icon: <CreditCard size={24} />, title: "Mercado Pago", desc: "Todas las tarjetas y cuotas" },
            { icon: <ShieldCheck size={24} />, title: "Compra segura", desc: "Protegemos tus datos" },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center pt-8 md:pt-0 px-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-black mb-4">
                {item.icon}
              </div>
              <h3 className="font-bold text-lg mb-1">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NUEVO: PRODUCTOS DESTACADOS */}
      <FeaturedProducts />

    </div>
  );
}