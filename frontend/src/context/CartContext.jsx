import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('primeCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('primeCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (producto, variante) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.variante.id === variante.id);
      if (existingItem) {
        if (existingItem.cantidad >= variante.stock_disponible) {
          alert('No hay más stock disponible para esta variante.');
          return prevCart;
        }
        return prevCart.map((item) =>
          item.variante.id === variante.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prevCart, { producto, variante, cantidad: 1 }];
    });
  };

  // NUEVA FUNCIÓN: Para el control de + y - en el carrito completo
  const updateQuantity = (varianteId, newQuantity) => {
    if (newQuantity < 1) return; // No permitimos bajar de 1 (para eso está el botón eliminar)
    
    setCart((prevCart) => prevCart.map((item) => {
      if (item.variante.id === varianteId) {
        if (newQuantity > item.variante.stock_disponible) {
          alert(`Solo quedan ${item.variante.stock_disponible} unidades disponibles.`);
          return item;
        }
        return { ...item, cantidad: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (varianteId) => {
    setCart((prevCart) => prevCart.filter((item) => item.variante.id !== varianteId));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('primeCart');
  };

  const cartCount = cart.reduce((total, item) => total + item.cantidad, 0);
  
  const cartTotal = cart.reduce((total, item) => {
    const precio = item.variante.precio_final || item.variante.precio_base;
    return total + (parseFloat(precio) * item.cantidad);
  }, 0);

  // Agregamos updateQuantity al Provider
  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);