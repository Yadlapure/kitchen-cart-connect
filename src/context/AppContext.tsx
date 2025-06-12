
import { createContext, useContext, useState, ReactNode } from 'react';

// Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  quantity: number;
  isAvailable?: boolean;
  updatedPrice?: number;
}

export interface Merchant {
  id: string;
  name: string;
  image: string;
  rating: number;
  categories: string[];
  deliveryTime: string;
}

export interface Order {
  id: string;
  merchantId: string;
  products: Product[];
  status: 'requested' | 'quoted' | 'confirmed' | 'processing' | 'delivering' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  estimatedDeliveryTime?: string;
  paymentMethod?: 'COD' | 'Online' | 'UPI';
  total?: number;
  quoteNotes?: string;
}

interface AppContextType {
  cart: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  merchants: Merchant[];
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  selectedMerchant: Merchant | null;
  setSelectedMerchant: (merchant: Merchant | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Sample data
const sampleMerchants: Merchant[] = [
  {
    id: '1',
    name: 'Kitchen Essentials',
    image: '/placeholder.svg',
    rating: 4.8,
    categories: ['Utensils', 'Cookware', 'Appliances'],
    deliveryTime: '30-45 min'
  },
  {
    id: '2',
    name: 'Gourmet Tools',
    image: '/placeholder.svg',
    rating: 4.5,
    categories: ['Bakeware', 'Cutlery', 'Gadgets'],
    deliveryTime: '45-60 min'
  },
  {
    id: '3',
    name: 'Home Chef Supplies',
    image: '/placeholder.svg',
    rating: 4.7,
    categories: ['Cookware', 'Storage', 'Cleaning'],
    deliveryTime: '25-40 min'
  },
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Product[]>([]);
  const [merchants] = useState<Merchant[]>(sampleMerchants);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);

  const addToCart = (product: Product) => {
    const existingProduct = cart.find(item => item.id === product.id);
    if (existingProduct) {
      updateQuantity(product.id, existingProduct.quantity + product.quantity);
    } else {
      setCart([...cart, product]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(
      cart.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const addOrder = (order: Order) => {
    setOrders([...orders, order]);
  };

  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    setOrders(
      orders.map(order => 
        order.id === orderId ? { ...order, ...updates, updatedAt: new Date() } : order
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        merchants,
        orders,
        addOrder,
        updateOrder,
        selectedMerchant,
        setSelectedMerchant,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
