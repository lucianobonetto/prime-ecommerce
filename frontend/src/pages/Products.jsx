import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // <-- NUEVO: Para leer la URL
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton'; // <-- NUEVO: Esqueletos
import { Search, Filter } from 'lucide-react';

export default function Products() {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Leemos si el usuario buscó algo desde el Navbar (ej: ?q=auriculares)
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('q') || '';

  // Estados para los filtros
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  
  // Arrancamos el maxPrice alto, pero luego lo ajustamos dinámicamente
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [absoluteMaxPrice, setAbsoluteMaxPrice] = useState(1000000);

  // Si el usuario vuelve a usar la lupita del Navbar, actualizamos el buscador de acá
  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    setIsLoading(true);
    // Traemos productos y categorías al mismo tiempo para que sea más rápido
    Promise.all([
      fetch('http://127.0.0.1:8000/api/productos/').then(res => res.json()),
      fetch('http://127.0.0.1:8000/api/categorias/').then(res => res.json())
    ])
    .then(([productsData, categoriesData]) => {
      setAllProducts(productsData);
      setCategories(categoriesData);
      
      // Magia: Calculamos automáticamente cuál es el producto más caro para ajustar la barra
      if (productsData.length > 0) {
        let highest = 0;
        productsData.forEach(p => {
          if (p.variantes && p.variantes.length > 0) {
            const maxVar = Math.max(...p.variantes.map(v => parseFloat(v.precio_base)));
            if (maxVar > highest) highest = maxVar;
          }
        });
        const finalMax = Math.ceil(highest / 1000) * 1000; // Redondeamos para que quede lindo
        setAbsoluteMaxPrice(finalMax);
        setMaxPrice(finalMax);
      }
      setIsLoading(false);
    })
    .catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, []);

  // Lógica pesada de Filtrado
  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || product.categoria_nombre === selectedCategory;
    
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
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-28">
          <h3 className="font-black text-lg mb-6 flex items-center gap-2 uppercase tracking-widest"><Filter size={18}/> Filtros</h3>
          
          {/* Buscador Local */}
          <div className="relative mb-8">
            <input 
              type="text" 
              placeholder="Buscar producto..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:border-black focus:ring-black transition-colors"
            />
            <Search size={16} className="absolute left-4 top-3.5 text-gray-400" />
          </div>

          {/* Categorías */}
          <div className="mb-8">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Categorías</h4>
            <div className="space-y-3">
              <button 
                onClick={() => setSelectedCategory('Todas')}
                className={`block w-full text-left text-sm transition-colors ${selectedCategory === 'Todas' ? 'font-black text-[#009EE3]' : 'font-semibold text-gray-600 hover:text-black'}`}
              >
                Todas
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.nombre)}
                  className={`block w-full text-left text-sm transition-colors ${selectedCategory === cat.nombre ? 'font-black text-[#009EE3]' : 'font-semibold text-gray-600 hover:text-black'}`}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Rango de Precio */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Precio Máximo</h4>
            <p className="text-xl font-black text-black mb-4">${maxPrice.toLocaleString('es-AR')}</p>
            <input 
              type="range" 
              min="0" 
              max={absoluteMaxPrice} 
              step="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
          </div>
        </div>
      </aside>

      {/* RESULTADOS */}
      <div className="flex-1">
        <div className="flex justify-between items-end mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Catálogo</h1>
          <span className="text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{filteredProducts.length} resultados</span>
        </div>

        {isLoading ? (
          // Esqueletos mientras carga
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(num => <ProductSkeleton key={num} />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          // Mensaje si no hay resultados
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Search size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="font-black text-xl text-gray-800 mb-2">No encontramos nada</p>
            <p className="text-sm font-medium text-gray-500">Probá ajustando el precio o buscando con otras palabras.</p>
            <button onClick={() => {setSearchTerm(''); setSelectedCategory('Todas'); setMaxPrice(absoluteMaxPrice);}} className="mt-6 text-sm font-bold text-[#009EE3] hover:underline">Limpiar todos los filtros</button>
          </div>
        ) : (
          // Tarjetas reales
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