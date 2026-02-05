import { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity?: number;
  weight?: number;
  productType: 'standard' | 'weighted' | 'combo';
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateWeight: (productId: string, weight: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        if (item.productType === 'weighted') {
          return prev.map((i) =>
            i.productId === item.productId
              ? { ...i, weight: (i.weight || 0) + (item.weight || 0), price: item.price }
              : i
          );
        } else {
          return prev.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: (i.quantity || 0) + (item.quantity || 1), price: item.price }
              : i
          );
        }
      }
      return [...prev, item];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  };

  const updateWeight = (productId: string, weight: number) => {
    if (weight <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, weight } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => {
    if (item.productType === 'weighted') {
      return sum + item.price * (item.weight || 0);
    }
    return sum + item.price * (item.quantity || 1);
  }, 0);

  const itemCount = items.reduce((sum, item) => {
    if (item.productType === 'weighted') {
      return sum + 1;
    }
    return sum + (item.quantity || 1);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateWeight,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
