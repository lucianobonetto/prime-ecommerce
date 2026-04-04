import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  // Cargamos los favoritos desde localStorage para que no se borren al refrescar
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('prime_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('prime_wishlist', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (product) => {
    setFavorites((prev) => {
      const isFavorite = prev.find((item) => item.id === product.id);
      if (isFavorite) {
        // Si ya está, lo quitamos
        return prev.filter((item) => item.id !== product.id);
      }
      // Si no está, lo agregamos
      return [...prev, product];
    });
  };

  const isFavorite = (productId) => favorites.some((item) => item.id === productId);

  return (
    <WishlistContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);