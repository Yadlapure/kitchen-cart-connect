
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Product } from './appSlice';

// Mock API for products
export const appApi = createApi({
  reducerPath: 'appApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/',
  }),
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], string | undefined>({
      queryFn: () => {
        // Mock products data
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Fresh Apples',
            description: 'Crisp red apples',
            price: 120,
            quantity: 1,
            unit: 'kg',
            category: 'fruits-and-vegetables',
            isAvailable: true,
          },
          {
            id: '2',
            name: 'Bananas',
            description: 'Yellow ripe bananas',
            price: 60,
            quantity: 1,
            unit: 'kg',
            category: 'fruits-and-vegetables',
            isAvailable: true,
          },
          {
            id: '3',
            name: 'Milk',
            description: 'Fresh dairy milk',
            price: 50,
            quantity: 1,
            unit: 'liter',
            category: 'dairy-and-bakery',
            isAvailable: true,
          },
          {
            id: '4',
            name: 'Bread',
            description: 'Whole wheat bread',
            price: 35,
            quantity: 1,
            unit: 'piece',
            category: 'dairy-and-bakery',
            isAvailable: true,
          },
          {
            id: '5',
            name: 'Rice',
            description: 'Basmati rice',
            price: 80,
            quantity: 1,
            unit: 'kg',
            category: 'staples',
            isAvailable: true,
          },
          {
            id: '6',
            name: 'Dal',
            description: 'Toor dal',
            price: 100,
            quantity: 1,
            unit: 'kg',
            category: 'staples',
            isAvailable: true,
          },
          {
            id: '7',
            name: 'Chips',
            description: 'Potato chips',
            price: 25,
            quantity: 1,
            unit: 'piece',
            category: 'snacks-and-beverages',
            isAvailable: true,
          },
          {
            id: '8',
            name: 'Juice',
            description: 'Orange juice',
            price: 40,
            quantity: 1,
            unit: 'liter',
            category: 'snacks-and-beverages',
            isAvailable: true,
          },
        ];
        
        return { data: mockProducts };
      },
    }),
  }),
});

export const { useGetProductsQuery } = appApi;
