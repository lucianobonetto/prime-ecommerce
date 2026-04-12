import React from 'react';

export default function ProductSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white rounded-3xl p-4 border border-gray-100 shadow-sm animate-pulse">
      
      {/* Silueta de la Imagen */}
      <div className="aspect-square mb-4 bg-gray-200 rounded-2xl w-full"></div>

      <div className="flex flex-col flex-grow px-2">
        {/* Silueta de la Categoría y Estrellas */}
        <div className="flex justify-between items-center mb-3">
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>

        {/* Silueta del Título (2 líneas) */}
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>

        {/* Silueta del Precio */}
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>

        {/* Silueta del Selector de Variante */}
        <div className="mt-auto mb-4">
          <div className="h-12 bg-gray-100 rounded-xl w-full border border-gray-50"></div>
        </div>

        {/* Silueta del Botón */}
        <div className="h-12 bg-gray-200 rounded-xl w-full mt-auto"></div>
      </div>
      
    </div>
  );
}