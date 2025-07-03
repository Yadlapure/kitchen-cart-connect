
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
        ignoredActions: [appApi.util.getRunningQueriesThunk.type],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
      },
    }).concat(appApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
