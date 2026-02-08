import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItem, Pass } from '@/types/passes';

interface CartContextType {
  cartItems: CartItem[];
  totalAmount: number;
  totalItems: number;
  addToCart: (pass: Pass, quantity?: number) => void;
  removeFromCart: (passId: string) => void;
  updateQuantity: (passId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'euphoria-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = useCallback((pass: Pass, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.passId === pass.id);
      if (existing) {
        return prev.map((item) =>
          item.passId === pass.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          passId: pass.id,
          passName: pass.name,
          price: pass.price,
          quantity,
          tier: pass.tier,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((passId: string) => {
    setCartItems((prev) => prev.filter((item) => item.passId !== passId));
  }, []);

  const updateQuantity = useCallback((passId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(passId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.passId === passId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalAmount,
        totalItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
