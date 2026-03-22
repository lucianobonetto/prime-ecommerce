import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, ShieldCheck, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import FeaturedProducts from '../components/FeaturedProducts'; // NUEVO IMPORT

export default function Home() {
  return (
    <div className="w-full">
      {/* HERO SECTION */}
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }} 
            className="max-w-2xl text-white"
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight mb-6">
              Tecnología que <br /> te acompaña.
            </h1>
            <p className="text-lg text-gray-200 mb-8 max-w-lg font-medium">
              Descubrí nuestra selección de productos premium diseñados para elevar tu día a día con Prime Logic LT.
            </p>
            <Link 
              to="/productos" 
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-gray-200 transition-colors"
            >
              Comprar Ahora <ArrowRight size={18} />
            </Link>
          </motion.div>
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