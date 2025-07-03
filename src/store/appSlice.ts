
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  quantity: number;
  unit: string;
  category?: string;
  isAvailable?: boolean;
  updatedPrice?: number;
  merchantNotes?: string;
  isVerified?: boolean;
}

export interface DefaultItem {
  id: string;
  name: string;
  category: string;
  commonUnits: string[];
  suggestedQuantity?: number;
}

export interface Merchant {
  id: string;
  name: string;
  image: string;
  rating: number;
  deliveryTime: string;
  categories: string[];
}

export interface MerchantQuote {
  merchantId: string;
  products: Product[];
  total: number;
  estimatedDeliveryTime: string;
  quoteNotes?: string;
  paymentMethod: 'COD' | 'Online' | 'UPI';
  submittedAt: string;
  isQuoteSubmitted?: boolean;
}

export type OrderStatus = 'requested' | 'quoted' | 'confirmed' | 'processing' | 'delivering' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  products: Product[];
  status: OrderStatus;
  total?: number;
  createdAt: string;
  updatedAt: string;
  selectedMerchants?: string[];
  merchantQuotes?: MerchantQuote[];
  selectedQuote?: string;
  merchantId?: string;
  estimatedDeliveryTime?: string;
  paymentMethod?: string;
  deliveryBoyId?: string;
  deliveryAddress?: string;
  customerPhone?: string;
  quoteNotes?: string;
}

export interface DeliveryBoy {
  id: string;
  name: string;
  phone: string;
  isAvailable: boolean;
}

export interface AppState {
  cart: Product[];
  defaultItems: DefaultItem[];
  merchants: Merchant[];
  orders: Order[];
  deliveryBoys: DeliveryBoy[];
}

const initialState: AppState = {
  cart: [],
  defaultItems: [
    {
      id: '1',
      name: 'Rice',
      category: 'Staples',
      commonUnits: ['kg', 'gram'],
      suggestedQuantity: 1,
    },
    {
      id: '2',
      name: 'Milk',
      category: 'Dairy',
      commonUnits: ['liter', 'piece'],
      suggestedQuantity: 1,
    },
  ],
  merchants: [
    {
      id: 'merchant1',
      name: 'Fresh Mart',
      image: '/placeholder.svg',
      rating: 4.5,
      deliveryTime: '30-45 mins',
      categories: ['Groceries', 'Vegetables'],
    },
  ],
  orders: [],
  deliveryBoys: [
    {
      id: 'db1',
      name: 'John Doe',
      phone: '+1234567890',
      isAvailable: true,
    },
  ],
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
    createOrder: (state, action: PayloadAction<Omit<Order, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newOrder: Order = {
        ...action.payload,
        id: `order-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.orders.push(newOrder);
    },
    verifyProduct: (state, action: PayloadAction<{
      orderId: string;
      merchantId: string;
      productId: string;
      price: number;
      isAvailable: boolean;
      notes?: string;
    }>) => {
      const { orderId, merchantId, productId, price, isAvailable, notes } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      if (!order) return;

      if (!order.merchantQuotes) {
        order.merchantQuotes = [];
      }

      let merchantQuote = order.merchantQuotes.find(q => q.merchantId === merchantId);
      if (!merchantQuote) {
        merchantQuote = {
          merchantId,
          products: order.products.map(p => ({ ...p, isVerified: false })),
          total: 0,
          estimatedDeliveryTime: '',
          paymentMethod: 'COD',
          submittedAt: '',
        };
        order.merchantQuotes.push(merchantQuote);
      }

      const product = merchantQuote.products.find(p => p.id === productId);
      if (product) {
        product.isVerified = true;
        product.isAvailable = isAvailable;
        product.updatedPrice = price;
        product.merchantNotes = notes;
      }
    },
    submitMerchantQuote: (state, action: PayloadAction<{
      orderId: string;
      merchantQuote: MerchantQuote;
    }>) => {
      const { orderId, merchantQuote } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      if (!order) return;

      if (!order.merchantQuotes) {
        order.merchantQuotes = [];
      }

      const existingQuoteIndex = order.merchantQuotes.findIndex(q => q.merchantId === merchantQuote.merchantId);
      if (existingQuoteIndex >= 0) {
        order.merchantQuotes[existingQuoteIndex] = merchantQuote;
      } else {
        order.merchantQuotes.push(merchantQuote);
      }
    },
    selectMerchantQuote: (state, action: PayloadAction<{
      orderId: string;
      merchantId: string;
    }>) => {
      const { orderId, merchantId } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        order.selectedQuote = merchantId;
        order.merchantId = merchantId;
        const selectedQuote = order.merchantQuotes?.find(q => q.merchantId === merchantId);
        if (selectedQuote) {
          order.total = selectedQuote.total;
          order.estimatedDeliveryTime = selectedQuote.estimatedDeliveryTime;
          order.paymentMethod = selectedQuote.paymentMethod;
        }
      }
    },
    updateOrder: (state, action: PayloadAction<{
      orderId: string;
      updates: Partial<Order>;
    }>) => {
      const { orderId, updates } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        Object.assign(order, updates);
        order.updatedAt = new Date().toISOString();
      }
    },
    assignDeliveryBoy: (state, action: PayloadAction<{
      orderId: string;
      deliveryBoyId: string;
    }>) => {
      const { orderId, deliveryBoyId } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        order.deliveryBoyId = deliveryBoyId;
      }
    },
    updateDeliveryStatus: (state, action: PayloadAction<{
      orderId: string;
      status: OrderStatus;
    }>) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        order.status = status;
        order.updatedAt = new Date().toISOString();
      }
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  createOrder,
  verifyProduct,
  submitMerchantQuote,
  selectMerchantQuote,
  updateOrder,
  assignDeliveryBoy,
  updateDeliveryStatus,
} = appSlice.actions;

export default appSlice.reducer;
