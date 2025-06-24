
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

interface User {
  id: string;
  username: string;
  role: 'customer' | 'merchant' | 'admin' | 'delivery_boy';
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

// Dummy credentials for testing
const dummyUsers: Record<string, User> = {
  'customer@test.com': {
    id: '1',
    username: 'customer@test.com',
    role: 'customer',
    name: 'John Customer'
  },
  'merchant@test.com': {
    id: '2',
    username: 'merchant@test.com',
    role: 'merchant',
    name: 'Jane Merchant'
  },
  'admin@test.com': {
    id: '3',
    username: 'admin@test.com',
    role: 'admin',
    name: 'Admin User'
  },
  'delivery@test.com': {
    id: '4',
    username: 'delivery@test.com',
    role: 'delivery_boy',
    name: 'Raj Kumar'
  }
};

const dummyPasswords: Record<string, string> = {
  'customer@test.com': 'customer123',
  'merchant@test.com': 'merchant123',
  'admin@test.com': 'admin123',
  'delivery@test.com': 'delivery123'
};

// Async thunk for login
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }) => {
    console.log('Login attempt:', username);
    
    if (dummyUsers[username] && dummyPasswords[username] === password) {
      console.log('Login successful for:', username);
      return dummyUsers[username];
    }
    
    console.log('Login failed for:', username);
    throw new Error('Invalid credentials');
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
