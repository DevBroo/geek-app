import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ImageSourcePropType } from 'react-native';

// Define the product type
export interface Product {
  id: number;
  title: string;
  image: ImageSourcePropType;
  rating: number;
  reviewCount: number;
  originalPrice: number;
  discountPercentage: number;
}

// Define the cart item type (product with quantity)
export interface CartItem extends Product {
  quantity: number;
}

// Define the context type
interface CartContextType {
  cartItems: CartItem[];
  favorites: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (productId: number) => void;
  isInFavorites: (productId: number) => boolean;
  isInCart: (productId: number) => boolean;
  getCartQuantity: (productId: number) => number;
  clearCart: () => void;
  cartCount: number;
  favoritesCount: number;
}

// Create the context
export const CartContext = createContext<CartContextType | undefined>(undefined);

// Create a provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);

  // Add to cart
  const addToCart = (product: Product) => {
    setCartItems(prevItems => {
      // Check if the product is already in the cart
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // If it exists, increase the quantity
        return prevItems.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // If it doesn't exist, add it with quantity 1
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  // Remove from cart
  const removeFromCart = (productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Increase quantity
  const increaseQuantity = (productId: number) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      )
    );
  };

  // Decrease quantity
  const decreaseQuantity = (productId: number) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      ).filter(item => item.quantity > 0) // Remove if quantity becomes 0
    );
  };

  // Add to favorites
  const addToFavorites = (product: Product) => {
    setFavorites(prevFavorites => {
      // Check if the product is already in favorites
      const isAlreadyFavorite = prevFavorites.some(item => item.id === product.id);
      
      if (isAlreadyFavorite) {
        // If it exists, remove it (toggle behavior)
        return prevFavorites.filter(item => item.id !== product.id);
      } else {
        // If it doesn't exist, add it
        return [...prevFavorites, product];
      }
    });
  };

  // Remove from favorites
  const removeFromFavorites = (productId: number) => {
    setFavorites(prevFavorites => prevFavorites.filter(item => item.id !== productId));
  };

  // Check if a product is in favorites
  const isInFavorites = (productId: number) => {
    return favorites.some(item => item.id === productId);
  };

  // Check if a product is in cart
  const isInCart = (productId: number) => {
    return cartItems.some(item => item.id === productId);
  };

  // Get quantity of a product in cart
  const getCartQuantity = (productId: number) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate total items in cart
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  // Calculate total items in favorites
  const favoritesCount = favorites.length;

  return (
    <CartContext.Provider value={{
      cartItems,
      favorites,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      addToFavorites,
      removeFromFavorites,
      isInFavorites,
      isInCart,
      getCartQuantity,
      clearCart,
      cartCount,
      favoritesCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Create a custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};