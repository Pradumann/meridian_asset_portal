"use client";

import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import propertyReducer from './slices/propertySlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    property: propertyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
