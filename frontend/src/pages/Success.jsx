import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';



export default function Success() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="text-green-500 w-16 h-16" />
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-2">¡Pago Exitoso!</h1>
        <p className="text-gray-500 font-medium mb-8">
          Tu pedido ya está siendo procesado. Te enviaremos un mail con los detalles del envío en breve.
        </p>

        <div className="space-y-4">
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 w-full bg-black text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-all shadow-lg"
          >
            <ShoppingBag size={18} /> Seguir Comprando
          </Link>
          
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Gracias por confiar en Prime Logic LT
          </p>
        </div>
      </motion.div>
    </div>
  );
}