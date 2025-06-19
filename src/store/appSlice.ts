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

export interface MerchantQuote {
  merchantId: string;
  products: Product[];
  total: number;
  estimatedDeliveryTime?: string;
  quoteNotes?: string;
  paymentMethod?: 'COD' | 'Online' | 'UPI';
  submittedAt: string; // Changed from Date to string
}

export interface Order {
  id: string;
  customerId: string;
  merchantId?: string;
  selectedMerchants: string[];
  deliveryBoyId?: string;
  products: Product[];
  merchantQuotes: MerchantQuote[];
  selectedQuote?: string;
  status: 'requested' | 'quoted' | 'confirmed' | 'processing' | 'delivering' | 'completed' | 'cancelled';
  createdAt: string; // Changed from Date to string
  updatedAt: string; // Changed from Date to string
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
  selectedMerchants: string[];
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
  selectedMerchants: [],
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
    addSelectedMerchant: (state, action: PayloadAction<string>) => {
      if (!state.selectedMerchants.includes(action.payload)) {
        state.selectedMerchants.push(action.payload);
      }
    },
    removeSelectedMerchant: (state, action: PayloadAction<string>) => {
      state.selectedMerchants = state.selectedMerchants.filter(id => id !== action.payload);
    },
    clearSelectedMerchants: (state) => {
      state.selectedMerchants = [];
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.push(action.payload);
    },
    updateOrder: (state, action: PayloadAction<{ orderId: string; updates: Partial<Order> }>) => {
      const { orderId, updates } = action.payload;
      const order = state.orders.find(order => order.id === orderId);
      if (order) {
        Object.assign(order, updates, { updatedAt: new Date().toISOString() });
        
        // Auto-calculate commission when total is updated
        if (updates.total && updates.status === 'completed') {
          order.commission = updates.total * state.commissionRate;
        }
      }
    },
    submitMerchantQuote: (state, action: PayloadAction<{ orderId: string; merchantQuote: MerchantQuote }>) => {
      const { orderId, merchantQuote } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        // Mark the quote as properly submitted with timestamp
        const finalQuote = {
          ...merchantQuote,
          submittedAt: new Date().toISOString(),
          isQuoteSubmitted: true
        };
        
        const existingQuoteIndex = order.merchantQuotes.findIndex(q => q.merchantId === merchantQuote.merchantId);
        if (existingQuoteIndex >= 0) {
          order.merchantQuotes[existingQuoteIndex] = finalQuote;
        } else {
          order.merchantQuotes.push(finalQuote);
        }
        
        // ONLY NOW update status to 'quoted' when quote is actually submitted
        order.status = 'quoted';
        order.updatedAt = new Date().toISOString();
        
        console.log(`🎯 QUOTE ACTUALLY SUBMITTED: Merchant ${merchantQuote.merchantId} completed quote for order ${orderId}`);
        console.log(`📊 Order status updated to: ${order.status}`);
        console.log(`🔄 Order updatedAt: ${order.updatedAt}`);
      }
    },
    selectMerchantQuote: (state, action: PayloadAction<{ orderId: string; merchantId: string }>) => {
      const { orderId, merchantId } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        const selectedQuote = order.merchantQuotes.find(q => q.merchantId === merchantId);
        if (selectedQuote) {
          order.selectedQuote = merchantId;
          order.merchantId = merchantId;
          order.total = selectedQuote.total;
          order.estimatedDeliveryTime = selectedQuote.estimatedDeliveryTime;
          order.quoteNotes = selectedQuote.quoteNotes;
          order.paymentMethod = selectedQuote.paymentMethod;
          order.status = 'confirmed';
          order.updatedAt = new Date().toISOString();
          
          console.log(`Customer selected quote from merchant ${merchantId} for order ${orderId}`);
        }
      }
    },
    verifyProduct: (state, action: PayloadAction<{ orderId: string; merchantId: string; productId: string; price: number; isAvailable: boolean; notes?: string }>) => {
      const { orderId, merchantId, productId, price, isAvailable, notes } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        // Find existing merchant verification data (NOT a quote yet)
        let merchantVerificationData = order.merchantQuotes?.find(q => q.merchantId === merchantId);
        if (!merchantVerificationData) {
          // Create new verification data structure (NOT submitted quote)
          merchantVerificationData = {
            merchantId,
            products: order.products.map(p => ({ 
              ...p, 
              isVerified: false,
              isAvailable: true,
              updatedPrice: undefined,
              merchantNotes: undefined
            })),
            total: 0,
            submittedAt: '', // Empty means not submitted yet
            isQuoteSubmitted: false // Add flag to track if quote is actually submitted
          };
          order.merchantQuotes.push(merchantVerificationData);
          console.log(`🆕 Created new verification data for ${merchantId} with ${merchantVerificationData.products.length} unverified products`);
        }
        
        // Update ONLY the specific product that's being verified
        const productIndex = merchantVerificationData.products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
          merchantVerificationData.products[productIndex] = {
            ...merchantVerificationData.products[productIndex],
            updatedPrice: price,
            isAvailable: isAvailable,
            isVerified: true,
            merchantNotes: notes
          };
          
          console.log(`✅ INDIVIDUAL VERIFICATION: Product ${productId} verified for merchant ${merchantId}`);
          console.log(`📋 Verification progress: ${merchantVerificationData.products.filter(p => p.isVerified).length}/${merchantVerificationData.products.length}`);
        }
        
        // DO NOT change order status or mark as submitted - this is just verification
        // Order status should only change when merchant actually submits the complete quote
      }
    },
    assignDeliveryBoy: (state, action: PayloadAction<{ orderId: string; deliveryBoyId: string }>) => {
      const { orderId, deliveryBoyId } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      const deliveryBoy = state.deliveryBoys.find(db => db.id === deliveryBoyId);
      
      if (order && deliveryBoy) {
        order.deliveryBoyId = deliveryBoyId;
        deliveryBoy.currentOrders.push(orderId);
        deliveryBoy.isAvailable = false; // Mark as busy
      }
    },
    updateDeliveryStatus: (state, action: PayloadAction<{ orderId: string; status: 'completed' }>) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      
      if (order && status === 'completed') {
        order.status = 'completed';
        order.updatedAt = new Date().toISOString();
        
        // Calculate commission automatically
        if (order.total) {
          order.commission = order.total * state.commissionRate;
        }
        
        // Remove from delivery boy's current orders and make available
        if (order.deliveryBoyId) {
          const deliveryBoy = state.deliveryBoys.find(db => db.id === order.deliveryBoyId);
          if (deliveryBoy) {
            deliveryBoy.currentOrders = deliveryBoy.currentOrders.filter(id => id !== orderId);
            deliveryBoy.isAvailable = true; // Make available again
          }
        }
      }
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  addSelectedMerchant,
  removeSelectedMerchant,
  clearSelectedMerchants,
  addOrder,
  updateOrder,
  submitMerchantQuote,
  selectMerchantQuote,
  verifyProduct,
  assignDeliveryBoy,
  updateDeliveryStatus,
} = appSlice.actions;

export default appSlice.reducer;
