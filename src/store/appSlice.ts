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

export interface MerchantInventoryItem {
  id: string;
  name: string;
  price: number;
  unit: 'gram' | 'kg' | 'number' | 'liter' | 'piece';
  isAvailable: boolean;
  category?: string;
}

export interface Merchant {
  id: string;
  name: string;
  image: string;
  rating: number;
  categories: string[];
  deliveryTime: string;
  inventory: MerchantInventoryItem[];
}

export interface MerchantQuote {
  merchantId: string;
  products: Product[];
  total: number;
  estimatedDeliveryTime?: string;
  quoteNotes?: string;
  paymentMethod?: 'COD' | 'Online' | 'UPI';
  submittedAt: string; // Changed from Date to string
  isQuoteSubmitted?: boolean; // Add this property
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

// Sample data with merchant inventories
const sampleMerchants: Merchant[] = [
  {
    id: '1',
    name: 'Fresh Mart',
    image: '/placeholder.svg',
    rating: 4.8,
    categories: ['Grocery', 'Fresh Produce'],
    deliveryTime: '30-45 min',
    inventory: [
      { id: 'sugar-1kg', name: 'Sugar', price: 45, unit: 'kg', isAvailable: true, category: 'Grocery' },
      { id: 'rice-1kg', name: 'Rice', price: 80, unit: 'kg', isAvailable: true, category: 'Grocery' },
      { id: 'oil-1l', name: 'Cooking Oil', price: 120, unit: 'liter', isAvailable: true, category: 'Grocery' },
      { id: 'spices-100g', name: 'Spices', price: 25, unit: 'gram', isAvailable: true, category: 'Grocery' }
    ]
  },
  {
    id: '2',
    name: 'Green Grocery',
    image: '/placeholder.svg',
    rating: 4.5,
    categories: ['Organic', 'Vegetables'],
    deliveryTime: '45-60 min',
    inventory: [
      { id: 'sugar-1kg', name: 'Sugar', price: 48, unit: 'kg', isAvailable: true, category: 'Grocery' },
      { id: 'rice-1kg', name: 'Rice', price: 85, unit: 'kg', isAvailable: true, category: 'Grocery' },
      { id: 'oil-1l', name: 'Cooking Oil', price: 115, unit: 'liter', isAvailable: true, category: 'Grocery' }
    ]
  },
  {
    id: '3',
    name: 'Quick Market',
    image: '/placeholder.svg',
    rating: 4.7,
    categories: ['Convenience', 'Quick Delivery'],
    deliveryTime: '25-40 min',
    inventory: [
      { id: 'sugar-1kg', name: 'Sugar', price: 50, unit: 'kg', isAvailable: true, category: 'Grocery' },
      { id: 'spices-100g', name: 'Spices', price: 30, unit: 'gram', isAvailable: true, category: 'Grocery' },
      { id: 'knife-1pc', name: 'Kitchen Knife', price: 200, unit: 'piece', isAvailable: true, category: 'Utensils' }
    ]
  }
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
      const orderWithDefaults = {
        ...action.payload,
        deliveryAddress: action.payload.deliveryAddress || "Customer delivery address will be provided",
        customerPhone: action.payload.customerPhone || "+91 98765 43210"
      };
      state.orders.push(orderWithDefaults);
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
    autoPopulateMerchantQuote: (state, action: PayloadAction<{ orderId: string; merchantId: string }>) => {
      const { orderId, merchantId } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      const merchant = state.merchants.find(m => m.id === merchantId);
      
      if (order && merchant) {
        // Find existing merchant verification data or create new
        let merchantVerificationData = order.merchantQuotes?.find(q => q.merchantId === merchantId);
        if (!merchantVerificationData) {
          merchantVerificationData = {
            merchantId,
            products: [],
            total: 0,
            submittedAt: '',
            isQuoteSubmitted: false
          };
          order.merchantQuotes.push(merchantVerificationData);
        }

        // Auto-populate products based on merchant inventory
        merchantVerificationData.products = order.products.map(orderProduct => {
          // Try to find matching item in merchant inventory
          const matchingInventoryItem = merchant.inventory.find(invItem => 
            invItem.name.toLowerCase() === orderProduct.name.toLowerCase() &&
            invItem.unit === orderProduct.unit
          );

          if (matchingInventoryItem) {
            // Auto-populate with merchant's stored price and availability
            return {
              ...orderProduct,
              updatedPrice: matchingInventoryItem.price,
              isAvailable: matchingInventoryItem.isAvailable,
              isVerified: true, // Auto-verified for matching items
              merchantNotes: 'Auto-populated from inventory'
            };
          } else {
            // Item not in inventory, needs manual verification
            return {
              ...orderProduct,
              isVerified: false,
              isAvailable: true,
              updatedPrice: undefined,
              merchantNotes: undefined
            };
          }
        });

        console.log(`🤖 AUTO-POPULATED: ${merchantVerificationData.products.filter(p => p.isVerified).length}/${merchantVerificationData.products.length} items auto-verified for merchant ${merchantId}`);
      }
    },
    assignDeliveryBoy: (state, action: PayloadAction<{ orderId: string; deliveryBoyId: string }>) => {
      const { orderId, deliveryBoyId } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      const deliveryBoy = state.deliveryBoys.find(db => db.id === deliveryBoyId);
      
      if (order && deliveryBoy) {
        // Update order with delivery assignment
        order.deliveryBoyId = deliveryBoyId;
        order.status = 'delivering'; // Make sure status is set to 'delivering'
        order.updatedAt = new Date().toISOString();
        
        // Ensure delivery address and phone are set
        if (!order.deliveryAddress) {
          order.deliveryAddress = "123 Main Street, Customer Area, City - 560001";
        }
        if (!order.customerPhone) {
          order.customerPhone = "+91 98765 43210";
        }
        
        // Update delivery boy availability
        if (!deliveryBoy.currentOrders.includes(orderId)) {
          deliveryBoy.currentOrders.push(orderId);
        }
        deliveryBoy.isAvailable = deliveryBoy.currentOrders.length < 3; // Can handle up to 3 orders
        
        console.log(`🚚 DELIVERY ASSIGNMENT: Order ${orderId} assigned to delivery boy ${deliveryBoyId}`);
        console.log(`📦 Delivery boy ${deliveryBoy.name} now has ${deliveryBoy.currentOrders.length} active orders`);
        console.log(`🔄 Order status updated to: ${order.status}`);
        console.log(`📍 Delivery address: ${order.deliveryAddress}`);
        console.log(`📞 Customer phone: ${order.customerPhone}`);
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
            
            console.log(`✅ DELIVERY COMPLETED: Order ${orderId} marked as completed`);
            console.log(`🚚 Delivery boy ${deliveryBoy.name} is now available again`);
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
  autoPopulateMerchantQuote,
  assignDeliveryBoy,
  updateDeliveryStatus,
} = appSlice.actions;

export default appSlice.reducer;
