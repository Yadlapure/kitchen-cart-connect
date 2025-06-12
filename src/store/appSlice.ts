
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  quantity: number;
  unit: 'gram' | 'kg' | 'number' | 'liter' | 'piece';
  isAvailable?: boolean;
  updatedPrice?: number;
  isVerified?: boolean;
  merchantNotes?: string;
}

export interface DefaultItem {
  id: string;
  name: string;
  category: string;
  commonUnits: ('gram' | 'kg' | 'number' | 'liter' | 'piece')[];
  suggestedQuantity?: number;
  image?: string;
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
  customerId: string;
  merchantId: string;
  deliveryBoyId?: string;
  products: Product[];
  status: 'requested' | 'quoted' | 'confirmed' | 'processing' | 'delivering' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  estimatedDeliveryTime?: string;
  paymentMethod?: 'COD' | 'Online' | 'UPI';
  total?: number;
  commission?: number;
  quoteNotes?: string;
  deliveryAddress?: string;
  customerPhone?: string;
}

export interface DeliveryBoy {
  id: string;
  name: string;
  phone: string;
  isAvailable: boolean;
  currentOrders: string[];
}

interface AppState {
  cart: Product[];
  merchants: Merchant[];
  orders: Order[];
  deliveryBoys: DeliveryBoy[];
  defaultItems: DefaultItem[];
  selectedMerchant: Merchant | null;
  commissionRate: number;
}

// Sample default items
const defaultKitchenItems: DefaultItem[] = [
  {
    id: '1',
    name: 'Sugar',
    category: 'Grocery',
    commonUnits: ['gram', 'kg'],
    suggestedQuantity: 1
  },
  {
    id: '2',
    name: 'Rice',
    category: 'Grocery', 
    commonUnits: ['gram', 'kg'],
    suggestedQuantity: 1
  },
  {
    id: '3',
    name: 'Cooking Oil',
    category: 'Grocery',
    commonUnits: ['liter'],
    suggestedQuantity: 1
  },
  {
    id: '4',
    name: 'Kitchen Knife',
    category: 'Utensils',
    commonUnits: ['piece'],
    suggestedQuantity: 1
  },
  {
    id: '5',
    name: 'Pressure Cooker',
    category: 'Cookware',
    commonUnits: ['piece'],
    suggestedQuantity: 1
  },
  {
    id: '6',
    name: 'Spices',
    category: 'Grocery',
    commonUnits: ['gram'],
    suggestedQuantity: 100
  }
];

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

const sampleDeliveryBoys: DeliveryBoy[] = [
  {
    id: 'db1',
    name: 'Raj Kumar',
    phone: '+91 9876543210',
    isAvailable: true,
    currentOrders: []
  },
  {
    id: 'db2', 
    name: 'Amit Singh',
    phone: '+91 9876543211',
    isAvailable: true,
    currentOrders: []
  }
];

const initialState: AppState = {
  cart: [],
  merchants: sampleMerchants,
  orders: [],
  deliveryBoys: sampleDeliveryBoys,
  defaultItems: defaultKitchenItems,
  selectedMerchant: null,
  commissionRate: 0.05, // 5% commission
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
        
        // Auto-calculate commission when total is updated
        if (updates.total && updates.status === 'completed') {
          order.commission = updates.total * state.commissionRate;
        }
      }
    },
    verifyProduct: (state, action: PayloadAction<{ orderId: string; productId: string; price: number; isAvailable: boolean; notes?: string }>) => {
      const { orderId, productId, price, isAvailable, notes } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        const product = order.products.find(p => p.id === productId);
        if (product) {
          product.updatedPrice = price;
          product.isAvailable = isAvailable;
          product.isVerified = true;
          product.merchantNotes = notes;
        }
      }
    },
    assignDeliveryBoy: (state, action: PayloadAction<{ orderId: string; deliveryBoyId: string }>) => {
      const { orderId, deliveryBoyId } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      const deliveryBoy = state.deliveryBoys.find(db => db.id === deliveryBoyId);
      
      if (order && deliveryBoy) {
        order.deliveryBoyId = deliveryBoyId;
        deliveryBoy.currentOrders.push(orderId);
      }
    },
    updateDeliveryStatus: (state, action: PayloadAction<{ orderId: string; status: 'completed' }>) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      
      if (order && status === 'completed') {
        order.status = 'completed';
        order.updatedAt = new Date();
        
        // Calculate commission automatically
        if (order.total) {
          order.commission = order.total * state.commissionRate;
        }
        
        // Remove from delivery boy's current orders
        if (order.deliveryBoyId) {
          const deliveryBoy = state.deliveryBoys.find(db => db.id === order.deliveryBoyId);
          if (deliveryBoy) {
            deliveryBoy.currentOrders = deliveryBoy.currentOrders.filter(id => id !== orderId);
          }
        }
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
  verifyProduct,
  assignDeliveryBoy,
  updateDeliveryStatus,
  setSelectedMerchant,
} = appSlice.actions;

export default appSlice.reducer;
