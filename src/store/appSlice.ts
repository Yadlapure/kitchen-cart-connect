
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

interface AppState {
  cart: Product[];
  merchants: Merchant[];
  orders: Order[];
  selectedMerchant: Merchant | null;
}

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

const initialState: AppState = {
  cart: [],
  merchants: sampleMerchants,
  orders: [],
  selectedMerchant: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const existingProduct = state.cart.find(item => item.id === action.payload.id);
      if (existingProduct) {
        existingProduct.quantity += action.payload.quantity;
      } else {
        state.cart.push(action.payload);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cart = state.cart.filter(item => item.id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        state.cart = state.cart.filter(item => item.id !== productId);
        return;
      }
      const product = state.cart.find(item => item.id === productId);
      if (product) {
        product.quantity = quantity;
      }
    },
    clearCart: (state) => {
      state.cart = [];
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.push(action.payload);
    },
    updateOrder: (state, action: PayloadAction<{ orderId: string; updates: Partial<Order> }>) => {
      const { orderId, updates } = action.payload;
      const order = state.orders.find(order => order.id === orderId);
      if (order) {
        Object.assign(order, updates, { updatedAt: new Date() });
      }
    },
    setSelectedMerchant: (state, action: PayloadAction<Merchant | null>) => {
      state.selectedMerchant = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  addOrder,
  updateOrder,
  setSelectedMerchant,
} = appSlice.actions;

export default appSlice.reducer;
