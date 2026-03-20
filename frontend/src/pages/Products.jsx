import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard'; // Tu componente extraído
import { Search, Filter } from 'lucide-react';

export default function Products() {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Estados para los filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [maxPrice, setMaxPrice] = useState(1000000);

  useEffect(() => {
    // 1. Traemos productos
    fetch('http://127.0.0.1:8000/api/productos/')
      .then(res => res.json())
      .then(data => setAllProducts(data));
      
    // 2. Traemos categorías para el menú lateral
    fetch('http://127.0.0.1:8000/api/categorias/')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  // Lógica pesada de Filtrado en el Frontend
  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || product.categoria_nombre === selectedCategory;
    
    // Obtenemos el precio más bajo de las variantes para filtrar
    const minProductPrice = product.variantes?.length > 0 
      ? Math.min(...product.variantes.map(v => parseFloat(v.precio_base))) 
      : 0;
    const matchesPrice = minProductPrice <= maxPrice;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-8 min-h-screen">
      
      {/* SIDEBAR DE FILTROS */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
        <div>
          <h3 className="font-black text-lg mb-4 flex items-center gap-2"><Filter size={18}/> Filtros</h3>
          
          {/* Buscador */}
          <div className="relative mb-6">
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-black focus:ring-black"
            />
            <Search size={16} className="absolute left-4 top-3.5 text-gray-400" />
          </div>

          {/* Categorías */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Categorías</h4>
            <div className="space-y-2">
              <button 
                onClick={() => setSelectedCategory('Todas')}
                className={`block w-full text-left text-sm ${selectedCategory === 'Todas' ? 'font-bold text-black' : 'text-gray-600 hover:text-black'}`}
              >
                Todas las categorías
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.nombre)}
                  className={`block w-full text-left text-sm ${selectedCategory === cat.nombre ? 'font-bold text-black' : 'text-gray-600 hover:text-black'}`}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Rango de Precio */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Precio Máximo: ${maxPrice}</h4>
            <input 
              type="range" 
              min="0" 
              max="200000" 
              step="5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-black"
            />
          </div>
        </div>
      </aside>

      {/* RESULTADOS */}
      <div className="flex-1">
        <h1 className="text-3xl font-black mb-6">Resultados ({filteredProducts.length})</h1>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="font-bold text-gray-500">No se encontraron productos con estos filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}