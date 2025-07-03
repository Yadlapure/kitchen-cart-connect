
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import appReducer from './appSlice';
import { appApi } from './appApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    app: appReducer,
    [appApi.reducerPath]: appApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['app/addOrder', 'app/updateOrder'],
        ignoredPaths: ['app.orders.createdAt', 'app.orders.updatedAt'],
      },
    }).concat(appApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
