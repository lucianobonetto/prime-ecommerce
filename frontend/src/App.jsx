import { useEffect, useState } from 'react';

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Acá hacemos la llamada a tu API de Django
    fetch('http://127.0.0.1:8000/api/products/')
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error('Error fetching products:', error));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900">Prime E-commerce</h1>
        <p className="text-gray-500 mt-2">Nuestros últimos ingresos</p>
      </header>

      {/* Grilla de productos */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            {/* Espacio para la futura imagen */}
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">Imagen del producto</span>
            </div>
            
            <div className="p-5">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                {product.category_name}
              </span>
              <h2 className="text-xl font-bold text-gray-800 mt-1">{product.name}</h2>
              <p className="text-gray-500 text-sm mt-2 line-clamp-2">{product.description}</p>
              <p className="text-2xl font-black text-gray-900 mt-4">${product.base_price}</p>
              
              {/* Variantes (Colores y talles) */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-2">Opciones disponibles:</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <span key={variant.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                      {variant.color} - {variant.size} (Stock: {variant.stock})
                    </span>
                  ))}
                </div>
              </div>
              
              <button className="w-full mt-5 bg-blue-600 text-white font-bold py-2 rounded-xl hover:bg-blue-700 transition-colors">
                Agregar al carrito
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;