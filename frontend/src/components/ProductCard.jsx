import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, Heart } from "lucide-react";
import { useWishlist } from '../context/WishlistContext';
import { motion, AnimatePresence } from 'framer-motion';

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-AR', { 
    style: 'currency', 
    currency: 'ARS', 
    maximumFractionDigits: 0 
  }).format(price);
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  // Validamos que existan variantes antes de asignar la primera
  const hasVariants = product.variantes && product.variantes.length > 0;
  const [selectedVariant, setSelectedVariant] = useState(hasVariants ? product.variantes[0] : null);

  // Verificamos el stock de la variante seleccionada
  const outOfStock = selectedVariant ? selectedVariant.stock_disponible <= 0 : true;
  const { toggleFavorite, isFavorite } = useWishlist();
  const favorited = isFavorite(product.id);

  return (
 <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group flex flex-col h-full bg-white rounded-3xl p-4 border border-transparent hover:border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 transition-all"
    >
      
      {/* Contenedor relativo de la Imagen y el Botón */}
      <div className="relative aspect-square mb-4 overflow-hidden bg-gray-50 rounded-2xl block">
        
        {/* BOTÓN DE FAVORITO (Flota sobre la imagen) */}
        <button 
          onClick={(e) => {
            e.preventDefault(); // Evita que al hacer clic en el corazón te lleve al detalle del producto
            toggleFavorite(product);
          }}
          className="absolute top-4 right-4 z-20 p-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-white transition-colors"
        >
          <motion.div
            animate={{ scale: favorited ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart 
              size={20} 
              className={favorited ? "fill-red-500 text-red-500" : "text-gray-400"} 
            />
          </motion.div>
        </button>

        {/* Imagen (Clickeable hacia el Detalle) */}
        <Link to={`/productos/${product.id}`} className="block w-full h-full">
          <img 
            src={product.image || 'https://via.placeholder.com/800'} 
            alt={product.nombre} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out mix-blend-multiply"
          />
          {outOfStock && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center pointer-events-none">
              <span className="bg-black text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest">Agotado</span>
            </div>
          )}
        </Link>
      </div>

      {/* Info y Controles */}
      <div className="flex flex-col flex-grow px-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{product.categoria_nombre}</span>
          <div className="flex items-center gap-1 text-xs font-bold text-yellow-500">
             <Star size={12} className="fill-yellow-500" /> 5.0
          </div>
        </div>
        
        <Link to={`/productos/${product.id}`}>
          <h3 className="text-lg font-bold leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {product.nombre}
          </h3>
        </Link>
        
        <p className="font-black text-2xl mb-4 text-black">
          {formatPrice(selectedVariant ? selectedVariant.precio_base : 0)}
        </p>

        {/* Selector de variantes (adaptado a los nombres de Django en español) */}
        {hasVariants && (
          <div className="mt-auto mb-4">
            <select 
              className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl p-3 text-sm font-medium focus:ring-black focus:border-black transition-colors"
              value={selectedVariant?.id || ''}
              onChange={(e) => {
                const variant = product.variantes.find(v => v.id === parseInt(e.target.value));
                setSelectedVariant(variant);
              }}
            >
              {product.variantes.map((variant) => (
                <option key={variant.id} value={variant.id} disabled={variant.stock_disponible <= 0}>
                  {variant.talle || 'Único'} - {variant.color || 'Estándar'} {variant.stock_disponible <= 0 ? '(Agotado)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <button 
          onClick={() => addToCart(product, selectedVariant)}
          disabled={outOfStock}
          className={`w-full px-6 py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
            outOfStock 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-black text-white hover:bg-gray-800 shadow-md active:scale-95'
          }`}
        >
          <ShoppingCart size={16} /> 
          {outOfStock ? 'Sin Stock' : 'Agregar'}
        </button>
      </div>
    </motion.div>
  );
}