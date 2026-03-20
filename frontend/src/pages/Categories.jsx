import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/categorias/')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando categorías:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 min-h-screen">
      <div className="flex items-center gap-3 mb-12">
        <LayoutGrid size={32} />
        <h1 className="text-4xl font-black tracking-tighter">Categorías</h1>
      </div>

      {loading ? (
        <p className="text-gray-500 font-bold">Cargando...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              to={`/productos?categoria=${cat.nombre}`}
              className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-black hover:shadow-xl transition-all group flex items-center justify-between"
            >
              <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                {cat.nombre}
              </h3>
              <span className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}