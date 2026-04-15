import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { Search, Filter, Check } from 'lucide-react'; // <-- Agregamos Check para el nuevo filtro

export default function Products() {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('q') || '';

  // --- ESTADOS DE FILTROS ---
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  
  // Rango de Precios
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [absoluteMaxPrice, setAbsoluteMaxPrice] = useState(1000000);

  // Sugerencia: Filtro de Stock
  const [inStockOnly, setInStockOnly] = useState(false);

  // Ordenamiento
  const [sortBy, setSortBy] = useState('relevance'); // 'price-asc', 'price-desc', 'name-asc', 'name-desc'

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch('http://127.0.0.1:8000/api/productos/').then(res => res.json()),
      fetch('http://127.0.0.1:8000/api/categorias/').then(res => res.json())
    ])
    .then(([productsData, categoriesData]) => {
      setAllProducts(productsData);
      setCategories(categoriesData);
      
      if (productsData.length > 0) {
        let highest = 0;
        productsData.forEach(p => {
          if (p.variantes && p.variantes.length > 0) {
            const maxVar = Math.max(...p.variantes.map(v => parseFloat(v.precio_base)));
            if (maxVar > highest) highest = maxVar;
          }
        });
        const finalMax = Math.ceil(highest / 1000) * 1000; 
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

  // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---
  let resultProducts = allProducts.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || product.categoria?.nombre === selectedCategory || product.categoria_nombre === selectedCategory;
    
    // Obtenemos el precio mínimo de las variantes para filtrar
    const productPrices = product.variantes?.length > 0 
      ? product.variantes.map(v => parseFloat(v.precio_base || v.precio_final)) 
      : [0];
    const minProductPrice = Math.min(...productPrices);
    
    // Filtro Precio Desde - Hasta
    const matchesPrice = minProductPrice >= (minPrice || 0) && minProductPrice <= (maxPrice || absoluteMaxPrice);

    // Filtro Stock
    const hasStock = product.variantes?.some(v => v.stock_disponible > 0);
    const matchesStock = inStockOnly ? hasStock : true;

    return matchesSearch && matchesCategory && matchesPrice && matchesStock;
  });

  // Ordenamiento
  resultProducts.sort((a, b) => {
    const priceA = a.variantes?.length > 0 ? Math.min(...a.variantes.map(v => parseFloat(v.precio_base || v.precio_final))) : 0;
    const priceB = b.variantes?.length > 0 ? Math.min(...b.variantes.map(v => parseFloat(v.precio_base || v.precio_final))) : 0;

    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    if (sortBy === 'name-asc') return a.nombre.localeCompare(b.nombre);
    if (sortBy === 'name-desc') return b.nombre.localeCompare(a.nombre);
    return 0; // relevance
  });

  const filteredProducts = resultProducts;

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-8 min-h-screen">
      
      {/* --- SIDEBAR DE FILTROS --- */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-28">
          <h3 className="font-black text-lg mb-6 flex items-center gap-2 uppercase tracking-widest"><Filter size={18}/> Filtros</h3>
          
          {/* Buscador Local */}
          <div className="relative mb-8">
            <Search size={16} className="absolute left-4 top-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar producto..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:border-black focus:ring-black transition-colors outline-none"
            />
          </div>

          {/* Categorías */}
          <div className="mb-8">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Categorías</h4>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
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

          {/* Rango de Precio (Desde - Hasta) */}
          <div className="mb-8">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Precio</h4>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
                <input 
                  type="number" 
                  min="0"
                  placeholder="Min"
                  value={minPrice || ''}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-7 pr-2 text-xs font-bold focus:border-black focus:ring-black outline-none"
                />
              </div>
              <span className="text-gray-300 font-black">-</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
                <input 
                  type="number" 
                  min="0"
                  placeholder="Max"
                  value={maxPrice || ''}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-7 pr-2 text-xs font-bold focus:border-black focus:ring-black outline-none"
                />
              </div>
            </div>
          </div>

          {/* Filtro: Solo en Stock */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Disponibilidad</h4>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${inStockOnly ? 'bg-black border-black' : 'bg-gray-50 border-gray-300 group-hover:border-black'}`}>
                {inStockOnly && <Check size={14} className="text-white" strokeWidth={3} />}
              </div>
              <span className={`text-sm font-bold transition-colors ${inStockOnly ? 'text-black' : 'text-gray-600 group-hover:text-black'}`}>
                Mostrar solo en stock
              </span>
              <input type="checkbox" className="hidden" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
            </label>
          </div>

        </div>
      </aside>

      {/* --- RESULTADOS --- */}
      <div className="flex-1">
        
        {/* Cabecera y Ordenamiento */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Catálogo</h1>
            <p className="text-sm font-bold text-gray-400 mt-2">{filteredProducts.length} productos encontrados</p>
          </div>
          
          <div className="w-full sm:w-auto">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-black cursor-pointer appearance-none shadow-sm"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em', paddingRight: '2.5rem' }}
            >
              <option value="relevance">Relevancia</option>
              <option value="price-asc">Menor Precio</option>
              <option value="price-desc">Mayor Precio</option>
              <option value="name-asc">Nombre (A-Z)</option>
              <option value="name-desc">Nombre (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Grilla de Productos */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(num => <ProductSkeleton key={num} />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Search size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="font-black text-xl text-gray-800 mb-2">No encontramos nada</p>
            <p className="text-sm font-medium text-gray-500">Probá ajustando el precio o buscando con otras palabras.</p>
            <button 
              onClick={() => {
                setSearchTerm(''); 
                setSelectedCategory('Todas'); 
                setMinPrice(0); 
                setMaxPrice(absoluteMaxPrice);
                setInStockOnly(false);
                setSortBy('relevance');
              }} 
              className="mt-6 text-sm font-bold text-[#009EE3] hover:underline"
            >
              Limpiar todos los filtros
            </button>
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