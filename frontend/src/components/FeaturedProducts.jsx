import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton'; // <-- NUEVO: Importamos el esqueleto

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Le agregué un setTimeout pequeñito (500ms) solo para que aprecies 
    // lo lindo que se ve el esqueleto cargando. ¡Podés sacarlo después si querés!
    setTimeout(() => {
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
    }, 500);
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Encabezado */}
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

        {/* LÓGICA DE RENDERIZADO: ESQUELETOS VS PRODUCTOS */}
        {isLoading ? (
          // Mientras carga, dibujamos 3 esqueletos
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
            {[1, 2, 3].map((num) => (
              <ProductSkeleton key={num} />
            ))}
          </div>
        ) : products.length > 0 ? (
          // Cuando termina de cargar, dibujamos los productos reales
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
            {products.map((producto) => (
              <ProductCard key={producto.id} product={producto} />
            ))}
          </div>
        ) : (
          // Si no hay productos en la base de datos
          <p className="text-gray-500 text-center py-10 font-medium">
            No hay productos destacados por ahora.
          </p>
        )}
      </div>
    </section>
  );
}