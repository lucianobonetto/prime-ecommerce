import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';


export default function Failure() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <XCircle className="text-red-500 w-16 h-16" />
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-2">¡Algo salió mal!</h1>
        <p className="text-gray-500 font-medium mb-8">
          No pudimos procesar tu pago. Puede deberse a fondos insuficientes o un error en la tarjeta. Por favor, intentá con otro medio de pago.
        </p>

        <div className="space-y-4">
          <Link
            to="/" 
            className="flex items-center justify-center gap-2 w-full bg-black text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-all shadow-lg"
          >
            <ArrowLeft size={18} /> Volver al catálogo
          </Link>
          
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Atención al cliente - Prime Logic LT
          </p>
        </div>
      </motion.div>
    </div>
  );
}