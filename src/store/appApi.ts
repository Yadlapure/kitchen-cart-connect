
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface ApiProduct {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: 'gram' | 'kg' | 'number' | 'liter' | 'piece';
  category: string;
}

// Mock API for demonstration
export const appApi = createApi({
  reducerPath: 'appApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getProducts: builder.query<ApiProduct[], string | undefined>({
      queryFn: async () => {
        // Mock data - in real app this would fetch from backend
        const mockProducts: ApiProduct[] = [
          {
            id: '1',
            name: 'Fresh Bananas',
            description: 'Ripe yellow bananas',
            quantity: 1,
            unit: 'kg',
            category: 'fruits-and-vegetables'
          },
          {
            id: '2',
            name: 'Red Apples',
            description: 'Crisp red apples',
            quantity: 1,
            unit: 'kg',
            category: 'fruits-and-vegetables'
          },
          {
            id: '3',
            name: 'Fresh Milk',
            description: 'Whole milk 1L',
            quantity: 1,
            unit: 'liter',
            category: 'dairy-and-bakery'
          },
          {
            id: '4',
            name: 'White Bread',
            description: 'Fresh white bread loaf',
            quantity: 1,
            unit: 'piece',
            category: 'dairy-and-bakery'
          },
          {
            id: '5',
            name: 'Basmati Rice',
            description: 'Premium basmati rice',
            quantity: 1,
            unit: 'kg',
            category: 'staples'
          },
          {
            id: '6',
            name: 'Cooking Oil',
            description: 'Sunflower cooking oil',
            quantity: 1,
            unit: 'liter',
            category: 'staples'
          },
          {
            id: '7',
            name: 'Potato Chips',
            description: 'Crispy potato chips',
            quantity: 1,
            unit: 'piece',
            category: 'snacks-and-beverages'
          },
          {
            id: '8',
            name: 'Cola',
            description: 'Refreshing cola drink',
            quantity: 1,
            unit: 'liter',
            category: 'snacks-and-beverages'
          }
        ];

        return { data: mockProducts };
      }
    })
  })
});

export const { useGetProductsQuery } = appApi;
