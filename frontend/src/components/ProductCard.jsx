import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useWishlist } from '../context/WishlistContext';
import { motion } from "framer-motion";

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-AR', { 
    style: 'currency', 
    currency: 'ARS', 
    maximumFractionDigits: 0 
  }).format(price);
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const hasVariants = product.variantes && product.variantes.length > 0;
  const [selectedVariant, setSelectedVariant] = useState(hasVariants ? product.variantes[0] : null);
  
  const outOfStock = selectedVariant ? selectedVariant.stock_disponible <= 0 : true;
  const { toggleFavorite, isFavorite } = useWishlist();
  const favorited = isFavorite(product.id);

  // LÓGICA DE PRECIOS
  const finalPrice = selectedVariant ? selectedVariant.precio_final : 0;
  const basePrice = selectedVariant ? selectedVariant.precio_base : 0;
  const discountPercentage = selectedVariant ? selectedVariant.descuento_porcentual : 0;

  // ==========================================
  // NUEVA LÓGICA: CARRUSEL DE IMÁGENES
  // ==========================================
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  // Si el usuario cambia de variante, reiniciamos el carrusel a la foto 1
  useEffect(() => {
    setCurrentImageIdx(0);
  }, [selectedVariant]);

  // Recolectamos las imágenes de la variante actual + la foto principal
  let images = [];
  if (selectedVariant) {
    images = [
      selectedVariant.imagen1,
      selectedVariant.imagen2,
      selectedVariant.imagen3,
      selectedVariant.imagen4,
    ].filter(Boolean); // Filter(Boolean) elimina los null/undefined
  }
  
  // Siempre agregamos la imagen principal del producto como respaldo al final
  if (product.image && !images.includes(product.image)) {
    images.push(product.image);
  }
  
  // Si por alguna razón no hay ninguna foto en absoluto
  if (images.length === 0) {
    images = ['https://via.placeholder.com/800'];
  }

  const nextImage = (e) => {
    e.preventDefault(); // Evita que se dispare el Link al producto
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group flex flex-col h-full bg-white rounded-3xl p-4 border border-transparent hover:border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 transition-all"
    >
      
      {/* Contenedor relativo de la Imagen, Botones y Carrusel */}
      <div className="relative aspect-square mb-4 overflow-hidden bg-gray-50 rounded-2xl block">
        
        {/* BOTÓN DE FAVORITO */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(product);
          }}
          className="absolute top-4 right-4 z-30 p-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-white transition-colors"
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

        {/* CONTROLES DEL CARRUSEL (Flechas) */}
        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage} 
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-md hover:bg-white rounded-full p-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-sm text-black"
            >
              <ChevronLeft size={20} strokeWidth={3} />
            </button>
            <button 
              onClick={nextImage} 
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-md hover:bg-white rounded-full p-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-sm text-black"
            >
              <ChevronRight size={20} strokeWidth={3} />
            </button>
          </>
        )}

        {/* Imagen con Link */}
        <Link to={`/productos/${product.id}`} className="block w-full h-full z-10 relative">
          <img 
            src={images[currentImageIdx]} 
            alt={product.nombre} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out mix-blend-multiply"
          />
          {outOfStock && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center pointer-events-none">
              <span className="bg-black text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest">Agotado</span>
            </div>
          )}
        </Link>

        {/* INDICADORES DEL CARRUSEL (Puntitos) */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
            {images.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentImageIdx ? 'w-4 bg-black' : 'w-1.5 bg-gray-400/60'
                }`} 
              />
            ))}
          </div>
        )}
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
        
        {/* BLOQUE DE PRECIOS VISUALES */}
        <div className="flex items-center flex-wrap gap-2 mb-4">
          {discountPercentage > 0 ? (
            <>
              <p className="font-black text-2xl text-black">
                {formatPrice(finalPrice)}
              </p>
              <p className="line-through text-gray-400 text-sm font-medium">
                {formatPrice(basePrice)}
              </p>
              <span className="bg-green-100 text-green-700 text-xs font-black px-2 py-1 rounded-md uppercase tracking-wider">
                {discountPercentage}% OFF
              </span>
            </>
          ) : (
            <p className="font-black text-2xl text-black">
              {formatPrice(basePrice)}
            </p>
          )}
        </div>

        {/* Selector de variantes */}
        {hasVariants && (
          <div className="mt-auto mb-4">
            <select 
              className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl p-3 text-sm font-medium focus:ring-black focus:border-black transition-colors outline-none cursor-pointer"
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