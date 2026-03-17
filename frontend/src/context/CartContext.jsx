import { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (product, selectedVariant) => {
    if (!selectedVariant) {
      alert("Por favor, seleccioná una opción antes de agregar al carrito.");
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.variant.id === selectedVariant.id);
      if (existingItem) {
        return prevCart.map(item => 
          item.variant.id === selectedVariant.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prevCart, { product, variant: selectedVariant, quantity: 1 }];
    });
  };

  // --- NUEVA FUNCIÓN: Eliminar del carrito ---
  const removeFromCart = (variantId) => {
    setCart((prevCart) => prevCart.filter(item => item.variant.id !== variantId));
  };

  const cartTotal = cart.reduce((total, item) => total + (item.product.base_price * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    // Agregamos removeFromCart acá para que toda la app pueda usarlo
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};