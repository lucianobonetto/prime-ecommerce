import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, Star, MessageSquare } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // --- NUEVO: ESTADOS PARA LAS RESEÑAS ---
  const [ratingHover, setRatingHover] = useState(0);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [reviews, setReviews] = useState([
    { id: 1, autor: 'Juan Pérez', fecha: '12 Feb 2026', rating: 5, comentario: '¡Excelente producto! La calidad es increíble y el envío fue súper rápido. 100% recomendado.' },
    { id: 2, autor: 'María Gómez', fecha: '28 Ene 2026', rating: 4, comentario: 'Me encantó el diseño. Le pongo 4 estrellas porque la caja del empaque llegó un poco doblada, pero el reloj está intacto.' }
  ]);

  useEffect(() => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    fetch(`http://127.0.0.1:8000/api/productos/${id}/`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        if (data.variantes && data.variantes.length > 0) {
          setSelectedVariant(data.variantes[0]);
        }
        return fetch('http://127.0.0.1:8000/api/productos/');
      })
      .then(res => res.json())
      .then(allProducts => {
        const filtered = allProducts.filter(p => p.id !== parseInt(id));
        setRelatedProducts(filtered.slice(0, 4));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  // --- NUEVO: MANEJADOR DEL FORMULARIO DE RESEÑAS ---
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (newReview.comment.trim() === '') return;
    
    const review = {
      id: Date.now(),
      autor: 'Usuario Invitado', // En el futuro acá irá el nombre del usuario logueado
      fecha: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }),
      rating: newReview.rating,
      comentario: newReview.comment
    };
    
    setReviews([review, ...reviews]); // Agregamos la reseña nueva al principio de la lista
    setNewReview({ rating: 5, comment: '' }); // Limpiamos el formulario
  };

  if (loading) return <div className="pt-32 text-center font-bold">Cargando producto...</div>;
  if (!product) return <div className="pt-32 text-center font-bold">Producto no encontrado</div>;

  const displayPrice = selectedVariant?.precio_final || selectedVariant?.precio_base || 0;

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-6 min-h-screen">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-black mb-8 font-bold text-sm uppercase tracking-widest transition-colors">
        <ArrowLeft size={16} /> Volver
      </button>

      {/* 1. SECCIÓN PRINCIPAL DEL PRODUCTO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Imagen */}
        <div className="bg-gray-100 rounded-3xl aspect-square overflow-hidden flex items-center justify-center">
          <img 
            src={product.image || 'https://via.placeholder.com/800'} 
            alt={product.nombre} 
            className="w-full h-full object-cover mix-blend-multiply"
          />
        </div>

        {/* Detalles */}
        <div className="flex flex-col justify-center">
          <span className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-2">
            {product.categoria_nombre}
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 leading-tight">
            {product.nombre}
          </h1>
          
          {/* Estrellitas debajo del título */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={18} className="fill-yellow-400" />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-500">5.0 ({reviews.length} opiniones)</span>
          </div>

          <p className="text-3xl font-black mb-6 border-b border-gray-100 pb-6">
            {formatPrice(displayPrice)}
          </p>
          
          <div className="mb-8 text-gray-600 leading-relaxed">
            <h3 className="font-bold text-black mb-2 uppercase tracking-widest text-sm">Descripción</h3>
            <p>{product.descripcion}</p>
          </div>

          {/* Variantes */}
          {product.variantes && product.variantes.length > 0 && (
            <div className="mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <label className="block text-sm font-bold uppercase tracking-widest mb-3">
                Seleccionar Variante (Talle / Color)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {product.variantes.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const outOfStock = variant.stock_disponible <= 0;
                  
                  return (
                    <button
                      key={variant.id}
                      disabled={outOfStock}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 rounded-xl border text-sm font-bold flex flex-col items-center justify-center transition-all ${
                        isSelected 
                          ? 'border-black bg-black text-white shadow-lg' 
                          : outOfStock 
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'border-gray-200 bg-white hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      <span>{variant.talle || 'Único'} - {variant.color || 'Estándar'}</span>
                      {outOfStock ? (
                        <span className="text-[10px] mt-1 text-red-400">Sin Stock</span>
                      ) : (
                        <span className="text-[10px] mt-1 font-normal opacity-70">Stock: {variant.stock_disponible}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Botón Comprar */}
          <button 
            onClick={() => addToCart(product, selectedVariant)}
            disabled={!selectedVariant || selectedVariant.stock_disponible <= 0}
            className={`w-full py-5 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all flex justify-center items-center gap-2 ${
              !selectedVariant || selectedVariant.stock_disponible <= 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-[#009EE3] text-white hover:bg-[#008ACB] shadow-xl shadow-blue-200/50 active:scale-95'
            }`}
          >
            <ShoppingCart size={18} /> 
            {(!selectedVariant || selectedVariant.stock_disponible <= 0) ? 'Sin Stock Disponible' : 'Agregar al Carrito'}
          </button>

          {/* Confianza */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
              <ShieldCheck className="text-green-500" size={20} /> Compra Protegida
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
              <Truck className="text-blue-500" size={20} /> Envío Rápido
            </div>
          </div>
        </div>
      </div>

      {/* 2. NUEVA SECCIÓN: RESEÑAS Y OPINIONES */}
      <div className="mt-24 pt-12 border-t border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Columna Izquierda: Formulario para dejar reseña */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <MessageSquare size={24} /> Dejanos tu opinión
            </h2>
            <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Calificación</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      onMouseEnter={() => setRatingHover(star)}
                      onMouseLeave={() => setRatingHover(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star 
                        size={28} 
                        className={`transition-colors ${
                          star <= (ratingHover || newReview.rating) 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Tu comentario</label>
                <textarea 
                  rows="4" 
                  required
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="¿Qué te pareció el producto?"
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:border-black focus:ring-black resize-none"
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full bg-black text-white font-bold py-3 rounded-xl text-sm hover:bg-gray-800 transition-colors"
              >
                Publicar Opinión
              </button>
            </form>
          </div>

          {/* Columna Derecha: Lista de Reseñas */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-6">Opiniones de clientes ({reviews.length})</h3>
            <div className="space-y-6">
              {reviews.map((rev) => (
                <div key={rev.id} className="border-b border-gray-100 pb-6 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-black block">{rev.autor}</span>
                      <span className="text-xs text-gray-400">{rev.fecha}</span>
                    </div>
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={14} 
                          className={star <= rev.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mt-2">{rev.comentario}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 3. SECCIÓN: TAMBIÉN TE PUEDE INTERESAR */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 pt-12 border-t border-gray-100">
          <h2 className="text-3xl font-black mb-8 text-center md:text-left">También te puede interesar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
}