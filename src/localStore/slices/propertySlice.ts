"use client";

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Property } from '@/api/properties';

interface PropertyState {
  properties: Property[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PropertyState = {
  properties: [],
  isLoading: false,
  error: null,
};

// Async thunk for fetching properties by operator email from Firestore
export const fetchPropertiesByOperatorEmail = createAsyncThunk(
  'property/fetchPropertiesByOperatorEmail',
  async (operatorEmail: string, { rejectWithValue }) => {
    try {
      console.log('Redux thunk: Fetching properties for operatorEmail:', operatorEmail);
      const { getPropertiesByOperatorEmail } = await import('@/api/properties');
      const properties = await getPropertiesByOperatorEmail(operatorEmail);
      
      console.log('Redux thunk: Properties received:', properties);
      return properties;
    } catch (error) {
      console.error('Redux thunk: Error fetching properties:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch properties');
    }
  }
);

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setProperties: (state, action: PayloadAction<Property[]>) => {
      state.properties = action.payload;
      state.error = null;
    },
    clearProperties: (state) => {
      state.properties = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPropertiesByOperatorEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPropertiesByOperatorEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.properties = action.payload;
        state.error = null;
      })
      .addCase(fetchPropertiesByOperatorEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.properties = [];
      });
  },
});

export const { setProperties, clearProperties, clearError } = propertySlice.actions;
export default propertySlice.reducer;
