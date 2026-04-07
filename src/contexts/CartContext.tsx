import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { CartItem, PassCartItem, EventCartItem } from '@/types/passes';
import { Event } from '@/components/events/EventCard';
import { supabase } from '@/integrations/supabase/client';

export const BASIC_REGISTRATION_ID = 'basic-registration';

interface CartContextType {
  cartItems: CartItem[];
  totalAmount: number;
  totalItems: number;
  passItems: PassCartItem[];
  eventItems: EventCartItem[];
  addEventToCart: (event: Event, quantity?: number) => void;
  removeFromCart: (itemId: string, type: 'pass' | 'event') => void;
  updateQuantity: (itemId: string, type: 'pass' | 'event', quantity: number) => void;
  clearCart: () => void;
  isInCart: (itemId: string, type: 'pass' | 'event') => boolean;
  isAutoItem: (itemId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'euphoria-cart-v2';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const regPriceRef = useRef<number>(299); // fallback
  const regPriceLoaded = useRef(false);

  // Fetch registration price once
  useEffect(() => {
    if (regPriceLoaded.current) return;
    supabase
      .from('passes')
      .select('price')
      .eq('id', BASIC_REGISTRATION_ID)
      .single()
      .then(({ data }) => {
        if (data) {
          regPriceRef.current = data.price;
          regPriceLoaded.current = true;
        }
      });
  }, []);

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

  const isAutoItem = useCallback((itemId: string) => {
    return itemId === BASIC_REGISTRATION_ID;
  }, []);

  const addEventToCart = useCallback((event: Event, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === event.id && item.type === 'event');
      let next: CartItem[];
      if (existing) {
        next = prev.map((item) =>
          item.id === event.id && item.type === 'event'
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
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
        next = [...prev, newItem];
      }

      // Auto-add basic registration if not present
      const hasReg = next.some((item) => item.id === BASIC_REGISTRATION_ID && item.type === 'pass');
      if (!hasReg) {
        const regItem: PassCartItem = {
          id: BASIC_REGISTRATION_ID,
          name: 'Basic Registration',
          price: regPriceRef.current,
          quantity: 1,
          type: 'pass',
          tier: 'basic',
        };
        next = [regItem, ...next];
      }

      return next;
    });
  }, []);

  const removeFromCart = useCallback((itemId: string, type: 'pass' | 'event') => {
    // Prevent manual removal of auto-item
    if (itemId === BASIC_REGISTRATION_ID) return;

    setCartItems((prev) => {
      const next = prev.filter((item) => !(item.id === itemId && item.type === type));
      // If no event items remain, auto-remove registration
      const hasEvents = next.some((item) => item.type === 'event');
      if (!hasEvents) {
        return next.filter((item) => item.id !== BASIC_REGISTRATION_ID);
      }
      return next;
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, type: 'pass' | 'event', quantity: number) => {
    if (itemId === BASIC_REGISTRATION_ID) {
      setCartItems((prev) => {
        const hasEvents = prev.some((i) => i.type === 'event');
        if (hasEvents && quantity < 1) return prev;
        if (!hasEvents && quantity < 1) {
          return prev.filter((i) => i.id !== BASIC_REGISTRATION_ID);
        }
        return prev.map((item) =>
          item.id === BASIC_REGISTRATION_ID && item.type === 'pass'
            ? { ...item, quantity }
            : item
        );
      });
      return;
    }

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
        addEventToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        isAutoItem,
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
