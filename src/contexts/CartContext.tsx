import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItem, Pass, PassCartItem, EventCartItem } from '@/types/passes';
import { Event } from '@/components/events/EventCard';

interface CartContextType {
  cartItems: CartItem[];
  totalAmount: number;
  totalItems: number;
  passItems: PassCartItem[];
  eventItems: EventCartItem[];
  addPassToCart: (pass: Pass, quantity?: number) => void;
  addEventToCart: (event: Event, quantity?: number) => void;
  removeFromCart: (itemId: string, type: 'pass' | 'event') => void;
  updateQuantity: (itemId: string, type: 'pass' | 'event', quantity: number) => void;
  clearCart: () => void;
  isInCart: (itemId: string, type: 'pass' | 'event') => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'euphoria-cart-v2';

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

  const passItems = cartItems.filter((item): item is PassCartItem => item.type === 'pass');
  const eventItems = cartItems.filter((item): item is EventCartItem => item.type === 'event');

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const addPassToCart = useCallback((pass: Pass, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === pass.id && item.type === 'pass');
      if (existing) {
        return prev.map((item) =>
          item.id === pass.id && item.type === 'pass'
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      const newItem: PassCartItem = {
        id: pass.id,
        name: pass.name,
        price: pass.price,
        quantity,
        type: 'pass',
        tier: pass.tier,
      };
      return [...prev, newItem];
    });
  }, []);

  const addEventToCart = useCallback((event: Event, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === event.id && item.type === 'event');
      if (existing) {
        return prev.map((item) =>
          item.id === event.id && item.type === 'event'
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      const newItem: EventCartItem = {
        id: event.id,
        name: event.name,
        price: event.fee,
        quantity,
        type: 'event',
        category: event.category,
        day: event.day,
        teamSize: event.teamSize,
      };
      return [...prev, newItem];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string, type: 'pass' | 'event') => {
    setCartItems((prev) => prev.filter((item) => !(item.id === itemId && item.type === type)));
  }, []);

  const updateQuantity = useCallback((itemId: string, type: 'pass' | 'event', quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId, type);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId && item.type === type ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const isInCart = useCallback((itemId: string, type: 'pass' | 'event') => {
    return cartItems.some((item) => item.id === itemId && item.type === type);
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalAmount,
        totalItems,
        passItems,
        eventItems,
        addPassToCart,
        addEventToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
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
