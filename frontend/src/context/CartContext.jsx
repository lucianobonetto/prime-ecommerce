import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  // Inicializamos el carrito leyendo el localStorage (si existe)
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('primeCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Cada vez que el carrito cambia, lo guardamos en el navegador
  useEffect(() => {
    localStorage.setItem('primeCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (producto, variante) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.variante.id === variante.id);
      
      if (existingItem) {
        // Si ya está en el carrito, verificamos no pasarnos del stock real
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
      // Si es nuevo, lo agregamos con cantidad 1
      return [...prevCart, { producto, variante, cantidad: 1 }];
    });
  };

  const removeFromCart = (varianteId) => {
    setCart((prevCart) => prevCart.filter((item) => item.variante.id !== varianteId));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('primeCart');
  };

  // Cálculos automáticos
  const cartCount = cart.reduce((total, item) => total + item.cantidad, 0);
  
  // Usamos precio_final si existe (por descuentos), sino precio_base
  const cartTotal = cart.reduce((total, item) => {
    const precio = item.variante.precio_final || item.variante.precio_base;
    return total + (parseFloat(precio) * item.cantidad);
  }, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook personalizado para usar el carrito fácilmente
export const useCart = () => useContext(CartContext);