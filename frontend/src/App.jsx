import { useEffect, useState } from 'react';
import { useCart } from './context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || null);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="h-48 w-full bg-gray-100 overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover object-center" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">Sin imagen</div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{product.category_name}</span>
        <h2 className="text-xl font-bold text-gray-800 mt-1">{product.name}</h2>
        <p className="text-gray-500 text-sm mt-2 line-clamp-2">{product.description}</p>
        <p className="text-2xl font-black text-gray-900 mt-4">${product.base_price}</p>
        
        <div className="mt-4 pt-4 border-t border-gray-100 flex-grow">
          <p className="text-sm font-semibold text-gray-700 mb-2">Elegí tu opción:</p>
          <select 
            className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            value={selectedVariant?.id || ''}
            onChange={(e) => {
              const variant = product.variants.find(v => v.id === parseInt(e.target.value));
              setSelectedVariant(variant);
            }}
          >
            {product.variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.color} - {variant.size} 
              </option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={() => addToCart(product, selectedVariant)}
          className="w-full mt-5 bg-blue-600 text-white font-bold py-2 rounded-xl hover:bg-blue-700 transition-colors active:scale-95"
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
};

function App() {
  const [products, setProducts] = useState([]);
  const { cart, removeFromCart, cartCount, cartTotal } = useCart(); 
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/products/')
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error('Error fetching products:', error));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      <header className="mb-10 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Prime E-commerce</h1>
        </div>
        <div 
          onClick={() => setIsCartOpen(true)}
          className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 flex items-center gap-4 cursor-pointer hover:bg-blue-100 transition-colors"
        >
          <span className="font-semibold text-blue-800">🛒 {cartCount} ítems</span>
          <span className="font-bold text-gray-900">${cartTotal.toFixed(2)}</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* --- PANEL LATERAL DEL CARRITO --- */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Tu Carrito</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {cart.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">Tu carrito está vacío 😢</p>
          ) : (
            cart.map((item) => (
              <div key={item.variant.id} className="flex gap-4 border-b border-gray-50 pb-4">
                <img src={item.product.image || 'https://via.placeholder.com/80'} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg bg-gray-100" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-sm">{item.product.name}</h3>
                  <p className="text-xs text-gray-500">{item.variant.color} - {item.variant.size}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-semibold text-gray-700">{item.quantity} x ${item.product.base_price}</span>
                    <button 
                      onClick={() => removeFromCart(item.variant.id)}
                      className="text-red-500 text-xs font-bold hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-gray-600">Total a pagar:</span>
            <span className="text-2xl font-black text-gray-900">${cartTotal.toFixed(2)}</span>
          </div>
          <button 
            disabled={cart.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-white transition-colors ${cart.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200'}`}
          >
            Pagar con Mercado Pago
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;