import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Success() {
  const { clearCart } = useCart();

  useEffect(() => {
    // Apenas carga la página de éxito, vaciamos el carrito del navegador
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100">
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} />
        </div>
        <h1 className="text-3xl font-black tracking-tighter mb-4 text-gray-900">¡Pago Exitoso!</h1>
        <p className="text-gray-500 mb-8 font-medium">
          Tu pago fue procesado correctamente. En breve recibirás un correo con los detalles del envío.
        </p>
        <Link 
          to="/productos"
          className="w-full py-4 bg-black text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-colors hover:bg-gray-800 flex justify-center items-center gap-2"
        >
          <ShoppingBag size={18} /> Seguir Comprando
        </Link>
      </div>
    </div>
  );
}