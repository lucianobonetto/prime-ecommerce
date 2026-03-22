import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';

// Formateador seguro: si le llega algo raro, lo maneja bien
const formatPrice = (price) => {
  if (!price || isNaN(price)) return 'Ver opciones';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
};

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/productos/')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.slice(0, 3));
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error cargando productos:', err);
        setIsLoading(false);
      });
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  if (isLoading) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 text-[#009EE3] font-bold text-xs tracking-widest uppercase mb-3">
              <TrendingUp size={16} className="text-[#009EE3]" /> Tendencias
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-black tracking-tight">
              Destacados del Mes
            </h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link 
              to="/productos" 
              className="group flex items-center gap-2 text-gray-500 font-bold text-sm hover:text-black transition-colors"
            >
              Ver todos 
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {products.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10"
          >
            {products.map((producto) => {
              // LOGICA DE PRECIOS BLINDADA
              // Atajamos si Tomás le puso "precio" o "precio_base"
              const rawPrecio = producto.precio_base || producto.precio || 0;
              const rawPrecioFinal = producto.precio_final || producto.precio_descuento || rawPrecio;
              
              const precioBase = parseFloat(rawPrecio);
              const precioFinal = parseFloat(rawPrecioFinal);

              const tieneDescuento = precioBase > 0 && precioFinal < precioBase;
              const porcentajeDescuento = tieneDescuento 
                ? Math.round(((precioBase - precioFinal) / precioBase) * 100) 
                : 0;

              return (
                <motion.div key={producto.id} variants={itemVariants} className="h-full">
                  <Link 
                    to={`/productos/${producto.id}`} 
                    className="group block h-full bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_10px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col relative"
                  >
                    
                    {tieneDescuento && (
                      <div className="absolute top-6 left-6 z-10 bg-black text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                        {porcentajeDescuento}% OFF
                      </div>
                    )}

                    <div className="relative w-full h-48 sm:h-56 bg-[#F8F9FA] rounded-xl overflow-hidden mb-5 flex items-center justify-center">
                      <img 
                        src={producto.image || producto.imagen || 'https://via.placeholder.com/300'} 
                        alt={producto.nombre} 
                        className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="flex flex-col flex-grow px-2">
                      <h3 className="text-base font-black text-gray-900 leading-snug mb-2 group-hover:text-[#009EE3] transition-colors line-clamp-2">
                        {producto.nombre}
                      </h3>
                      
                      <div className="mt-auto flex items-end justify-between pt-4">
                        <div className="flex flex-col">
                          {tieneDescuento && (
                            <span className="text-xs font-bold text-gray-400 line-through mb-0.5">
                              {formatPrice(precioBase)}
                            </span>
                          )}
                          <span className="text-xl font-black text-black">
                            {precioBase > 0 ? formatPrice(precioFinal) : 'Ver opciones'}
                          </span>
                        </div>
                        
                        <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-[#009EE3] group-hover:text-white transition-all duration-300">
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    </div>

                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <p className="text-gray-500 text-center py-10 font-medium animate-pulse">Cargando productos...</p>
        )}
      </div>
    </section>
  );
}