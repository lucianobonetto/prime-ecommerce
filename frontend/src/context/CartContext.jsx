import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner'; // <-- Importamos la magia de las notificaciones

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
          // Reemplazamos el viejo alert() por un error premium
          toast.error('Sin stock suficiente', {
            description: `Ya tenés todas las unidades disponibles de ${producto.nombre}.`
          });
          return prevCart;
        }
        
        // Notificación de éxito al sumar uno más
        toast.success('Carrito actualizado', {
          description: `Sumaste otra unidad de ${producto.nombre}.`
        });
        
        return prevCart.map((item) =>
          item.variante.id === variante.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      
      // Notificación de éxito al agregar por primera vez
      toast.success('¡Agregado al carrito!', {
        description: producto.nombre
      });
      
      return [...prevCart, { producto, variante, cantidad: 1 }];
    });
  };

  const updateQuantity = (varianteId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart((prevCart) => prevCart.map((item) => {
      if (item.variante.id === varianteId) {
        if (newQuantity > item.variante.stock_disponible) {
          // Reemplazamos el otro alert()
          toast.warning('Límite de stock', {
            description: `Solo quedan ${item.variante.stock_disponible} unidades disponibles.`
          });
          return item;
        }
        return { ...item, cantidad: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (varianteId) => {
    setCart((prevCart) => {
      const itemToRemove = prevCart.find(item => item.variante.id === varianteId);
      if (itemToRemove) {
        toast.info('Producto eliminado', {
          description: 'Se quitó el artículo de tu carrito.'
        });
      }
      return prevCart.filter((item) => item.variante.id !== varianteId);
    });
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

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);