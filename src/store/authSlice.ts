
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'merchant' | 'admin' | 'delivery_boy';
  addresses?: Address[];
  selectedLocation?: string;
}

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  houseNumber: string;
  street: string;
  landmark?: string;
  area: string;
  city: string;
  pincode: string;
  instructions?: string;
  fullAddress: string;
  isDefault: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isFirstTimeLogin: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isFirstTimeLogin: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ email: string; password: string }>) => {
      const { email } = action.payload;
      
      // Sample users for testing
      const users = [
        { 
          id: '1', 
          name: 'John Customer', 
          email: 'customer@test.com', 
          phone: '+91 98765 43210',
          role: 'customer' as const,
          addresses: [],
          selectedLocation: undefined
        },
        { 
          id: '2', 
          name: 'Kitchen Store', 
          email: 'merchant@test.com', 
          role: 'merchant' as const 
        },
        { 
          id: '3', 
          name: 'Admin User', 
          email: 'admin@test.com', 
          role: 'admin' as const 
        },
        { 
          id: 'db1', 
          name: 'Raj Kumar', 
          email: 'delivery@test.com', 
          role: 'delivery_boy' as const 
        },
      ];
      
      const user = users.find(u => u.email === email);
      if (user) {
        state.user = user;
        state.isAuthenticated = true;
        // Check if customer needs to complete address setup
        if (user.role === 'customer' && (!user.addresses || user.addresses.length === 0)) {
          state.isFirstTimeLogin = true;
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isFirstTimeLogin = false;
    },
    saveUserAddress: (state, action: PayloadAction<Address>) => {
      if (state.user && state.user.role === 'customer') {
        if (!state.user.addresses) {
          state.user.addresses = [];
        }
        
        const existingIndex = state.user.addresses.findIndex(addr => addr.id === action.payload.id);
        
        if (existingIndex >= 0) {
          // Update existing address
          state.user.addresses[existingIndex] = action.payload;
        } else {
          // Add new address
          // If this is the first address, make it default
          if (state.user.addresses.length === 0) {
            action.payload.isDefault = true;
          }
          // If new address is set as default, remove default from others
          if (action.payload.isDefault) {
            state.user.addresses.forEach(addr => {
              addr.isDefault = false;
            });
          }
          state.user.addresses.push(action.payload);
        }
        
        // Set selected location from the address area
        state.user.selectedLocation = action.payload.area;
        state.isFirstTimeLogin = false;
      }
    },
    deleteUserAddress: (state, action: PayloadAction<string>) => {
      if (state.user?.addresses) {
        const deletingDefault = state.user.addresses.find(addr => addr.id === action.payload)?.isDefault;
        state.user.addresses = state.user.addresses.filter(addr => addr.id !== action.payload);
        
        // If we deleted the default address, make the first remaining address default
        if (deletingDefault && state.user.addresses.length > 0) {
          state.user.addresses[0].isDefault = true;
          state.user.selectedLocation = state.user.addresses[0].area;
        } else if (state.user.addresses.length === 0) {
          state.user.selectedLocation = undefined;
        }
      }
    },
    setDefaultAddress: (state, action: PayloadAction<string>) => {
      if (state.user?.addresses) {
        state.user.addresses.forEach(addr => {
          addr.isDefault = addr.id === action.payload;
        });
        const defaultAddress = state.user.addresses.find(addr => addr.id === action.payload);
        if (defaultAddress) {
          state.user.selectedLocation = defaultAddress.area;
        }
      }
    },
    updateSelectedLocation: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.selectedLocation = action.payload;
      }
    },
    completeFirstTimeSetup: (state) => {
      state.isFirstTimeLogin = false;
    }
  },
});

export const { 
  login, 
  logout, 
  saveUserAddress, 
  deleteUserAddress, 
  setDefaultAddress, 
  updateSelectedLocation,
  completeFirstTimeSetup
} = authSlice.actions;

export default authSlice.reducer;
