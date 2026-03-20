import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
};

export default function ProductDetail() {
  const { id } = useParams(); // Obtenemos el ID de la URL
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Django ViewSet permite buscar por ID automáticamente agregando /id/ al final
    fetch(`http://127.0.0.1:8000/api/productos/${id}/`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        if (data.variantes && data.variantes.length > 0) {
          setSelectedVariant(data.variantes[0]); // Seleccionamos la primera variante por defecto
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="pt-32 text-center font-bold">Cargando producto...</div>;
  if (!product) return <div className="pt-32 text-center font-bold">Producto no encontrado</div>;

  // Usamos el precio final de la variante si existe, sino el base del producto
  const displayPrice = selectedVariant?.precio_final || selectedVariant?.precio_base || 0;

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-6 min-h-screen">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-black mb-8 font-bold text-sm uppercase tracking-widest transition-colors">
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Imagen del Producto */}
        <div className="bg-gray-100 rounded-3xl aspect-square overflow-hidden flex items-center justify-center">
          <img 
            src={product.image || 'https://via.placeholder.com/800'} 
            alt={product.nombre} 
            className="w-full h-full object-cover mix-blend-multiply"
          />
        </div>

        {/* Detalles y Lógica */}
        <div className="flex flex-col justify-center">
          <span className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-2">
            {product.categoria_nombre}
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 leading-tight">
            {product.nombre}
          </h1>
          <p className="text-3xl font-black mb-6 border-b border-gray-100 pb-6">
            {formatPrice(displayPrice)}
          </p>
          
          <div className="mb-8 text-gray-600 leading-relaxed">
            <h3 className="font-bold text-black mb-2 uppercase tracking-widest text-sm">Descripción</h3>
            <p>{product.descripcion}</p>
          </div>

          {/* Selector de Variantes */}
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
    </div>
  );
}