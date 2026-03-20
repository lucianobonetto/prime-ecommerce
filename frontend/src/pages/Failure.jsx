import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function Failure() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={40} />
        </div>
        <h1 className="text-3xl font-black tracking-tighter mb-4 text-gray-900">Hubo un problema</h1>
        <p className="text-gray-500 mb-8 font-medium">
          No pudimos procesar tu pago. Puede que tu tarjeta haya sido rechazada o cerraste la ventana de Mercado Pago.
        </p>
        <Link 
          to="/productos"
          className="w-full py-4 bg-white border border-gray-200 text-black rounded-xl font-bold uppercase tracking-widest text-sm transition-colors hover:bg-gray-50 flex justify-center items-center gap-2"
        >
          <ArrowLeft size={18} /> Volver al Catálogo
        </Link>
      </div>
    </div>
  );
}