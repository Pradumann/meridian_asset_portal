"use client";

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types/auth';

interface UserState {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  isLoading: false,
  error: null,
};

// Async thunk for fetching user details from Firestore
export const fetchUserDetails = createAsyncThunk(
  'user/fetchUserDetails',
  async (email: string, { rejectWithValue }) => {
    try {
      const { getUserByEmail } = await import('@/utils/firestore');
      const firestoreUser = await getUserByEmail(email);
      
      if (!firestoreUser) {
        throw new Error('User not found in database');
      }
      
      // Convert Firestore user to our User type
      const user: User = {
        id: firestoreUser.id,
        email: firestoreUser.email,
        role: firestoreUser.role,
        name: firestoreUser.fullName, // Map fullName to name field
        createdAt: firestoreUser.createdAt,
        updatedAt: firestoreUser.updatedAt,
      };
      
      return user;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch user details');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.error = null;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.currentUser = null;
      });
  },
});

export const { setUser, clearUser, clearError } = userSlice.actions;
export default userSlice.reducer;
