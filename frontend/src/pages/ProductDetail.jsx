import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, Star, MessageSquare } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { toast } from 'sonner';

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

  // --- NUEVO ESTADO: GALERÍA DE IMÁGENES ---
  const [activeImage, setActiveImage] = useState('');
  const [availableImages, setAvailableImages] = useState([]);

  // --- ESTADOS PARA LAS RESEÑAS ---
  const { isAuthenticated } = useAuth();
  const [ratingHover, setRatingHover] = useState(0);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [reviews, setReviews] = useState([]);
  const [canComment, setCanComment] = useState(false); 

  useEffect(() => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    fetch(`http://127.0.0.1:8000/api/productos/${id}/`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setReviews(data.resenas || []);
        
        // Configuramos la variante inicial y sus fotos
        if (data.variantes && data.variantes.length > 0) {
          const defaultVariant = data.variantes[0];
          setSelectedVariant(defaultVariant);
          updateGallery(data.image, defaultVariant);
        } else {
          // Si no hay variantes, solo mostramos la foto principal
          setActiveImage(data.image || 'https://via.placeholder.com/800');
          setAvailableImages([data.image].filter(Boolean));
        }

        // --- VERIFICAR SI PUEDE COMENTAR ---
        const token = localStorage.getItem('token');
        if (isAuthenticated && token) {
          fetch(`http://127.0.0.1:8000/api/productos/${id}/puedo-comentar/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          .then(res => res.json())
          .then(data => {
            if (data.puede_comentar) setCanComment(true);
          })
          .catch(err => console.error("Error verificando permisos de reseña:", err));
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
  }, [id, isAuthenticated]);

  // --- FUNCIÓN PARA ACTUALIZAR LA GALERÍA CUANDO CAMBIA LA VARIANTE ---
  const updateGallery = (mainProductImage, variant) => {
    if (!variant) return;

    // Recolectamos todas las imágenes válidas: primero las de la variante, luego la del producto
    const images = [
      variant.imagen1,
      variant.imagen2,
      variant.imagen3,
      variant.imagen4,
      mainProductImage
    ].filter(Boolean); // Filter(Boolean) quita los nulos o undefined

    // Si hay imágenes, mostramos la primera por defecto
    if (images.length > 0) {
      setAvailableImages(images);
      setActiveImage(images[0]);
    } else {
      // Fallback si nadie subió nada
      setAvailableImages([]);
      setActiveImage('https://via.placeholder.com/800');
    }
  };

  // Escuchamos el cambio de variante para actualizar las fotitos
  useEffect(() => {
    if (product && selectedVariant) {
      updateGallery(product.image, selectedVariant);
    }
  }, [selectedVariant]);

  // --- MANEJADOR DEL FORMULARIO DE RESEÑAS ---
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (newReview.comment.trim() === '') return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/productos/${id}/resenas/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          rating: newReview.rating,
          comentario: newReview.comment
        })
      });

      if (res.ok) {
        const reviewData = await res.json();
        setReviews([reviewData, ...reviews]); 
        setNewReview({ rating: 5, comment: '' });
        toast.success("¡Gracias por tu opinión!"); 
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Ocurrió un error al publicar.");
      }
    } catch (error) {
      console.error("Error al publicar la reseña:", error);
      toast.error("Error de conexión con el servidor.");
    }
  };

  if (loading) return <div className="pt-32 text-center font-bold">Cargando producto...</div>;
  if (!product) return <div className="pt-32 text-center font-bold">Producto no encontrado</div>;

  const displayPrice = selectedVariant?.precio_final || selectedVariant?.precio_base || 0;
  const oldPrice = selectedVariant?.precio_base;
  const isOferta = selectedVariant && selectedVariant.precio_final < selectedVariant.precio_base;

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-6 min-h-screen">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-black mb-8 font-bold text-sm uppercase tracking-widest transition-colors">
        <ArrowLeft size={16} /> Volver
      </button>

      {/* 1. SECCIÓN PRINCIPAL DEL PRODUCTO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        
        {/* --- COLUMNA DE IMÁGENES --- */}
        <div className="flex flex-col gap-4">
          {/* Imagen Principal Grande */}
          <div className="bg-gray-50 rounded-3xl aspect-square overflow-hidden flex items-center justify-center border border-gray-100 relative group">
            {isOferta && (
              <span className="absolute top-6 left-6 bg-green-500 text-white font-black px-4 py-2 rounded-xl text-sm z-10 shadow-lg shadow-green-200">
                OFERTA
              </span>
            )}
            <img 
              src={activeImage} 
              alt={product.nombre} 
              className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Galería de Miniaturas */}
          {availableImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              {availableImages.map((imgUrl, index) => (
                <button 
                  key={index}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === imgUrl ? 'border-black scale-100 shadow-md' : 'border-transparent opacity-60 hover:opacity-100 scale-95'}`}
                >
                  <img src={imgUrl} alt={`Vista ${index + 1}`} className="w-full h-full object-cover mix-blend-multiply bg-gray-50" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- COLUMNA DE DETALLES --- */}
        <div className="flex flex-col justify-center">
          <span className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-2">
            {product.categoria_nombre}
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 leading-tight">
            {product.nombre}
          </h1>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={18} className="fill-yellow-400" />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-500">5.0 ({reviews.length} opiniones)</span>
          </div>

          {/* Precios: Si hay oferta tachamos el viejo */}
          <div className="mb-6 border-b border-gray-100 pb-6 flex items-end gap-4">
            <p className={`text-4xl font-black ${isOferta ? 'text-green-600' : 'text-black'}`}>
              {formatPrice(displayPrice)}
            </p>
            {isOferta && (
              <p className="text-xl font-bold text-gray-400 line-through mb-1">
                {formatPrice(oldPrice)}
              </p>
            )}
          </div>
          
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
            <div className="flex items-center gap-3 text-sm font-medium text-gray-600 bg-green-50 p-4 rounded-2xl border border-green-100">
              <ShieldCheck className="text-green-500 flex-shrink-0" size={24} /> 
              <span>Compra 100% Protegida</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-gray-600 bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <Truck className="text-blue-500 flex-shrink-0" size={24} /> 
              <span>Envío Seguro y Rápido</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECCIÓN DE RESEÑAS */}
      <div className="mt-16 pt-12 border-t border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <MessageSquare size={24} /> Dejanos tu opinión
            </h2>
            
            {!isAuthenticated ? (
              <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 text-center">
                <MessageSquare className="mx-auto text-gray-300 mb-4" size={40} />
                <h3 className="font-bold text-gray-700 mb-2">¿Querés dejar tu opinión?</h3>
                <p className="text-sm text-gray-500 mb-6">Iniciá sesión en tu cuenta para poder compartir tu experiencia.</p>
                <Link to="/auth" className="inline-block bg-black text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-gray-800 transition-colors">
                  Iniciar Sesión
                </Link>
              </div>
            ) : !canComment ? (
              <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100 text-center">
                <ShieldCheck className="mx-auto text-orange-400 mb-4" size={40} />
                <h3 className="font-bold text-orange-800 mb-2">Solo compras verificadas</h3>
                <p className="text-sm text-orange-600">Para mantener la transparencia, solo permitimos reseñas de clientes que hayan comprado y recibido este producto.</p>
              </div>
            ) : (
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
            )}
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-6">Opiniones de clientes ({reviews.length})</h3>
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <p className="text-gray-400 font-medium">Aún no hay reseñas para este producto. ¡Sé el primero en opinar!</p>
              ) : (
                reviews.map((rev) => (
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
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECCIÓN RECOMENDACIONES */}
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