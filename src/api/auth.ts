"use client";

import { LoginCredentials, User } from '@/types/auth';
import { signInWithEmailAndPassword, signOut, getCurrentUser, onAuthStateChanged, AuthResult } from '@/utils/firebase';
import { store } from '@/localStore';
import { fetchUserDetails, setUser, clearUser } from '@/localStore/slices/userSlice';

class AuthAPI {
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      // First authenticate with Firebase
      const authResult = await signInWithEmailAndPassword(credentials.email, credentials.password);
      
      // Then fetch user details from Firestore
      const result = await store.dispatch(fetchUserDetails(credentials.email));
      
      if (fetchUserDetails.fulfilled.match(result)) {
        // User details fetched successfully and stored in Redux
        return authResult;
      } else {
        // User authenticated but not found in Firestore
        throw new Error('User not found in database');
      }
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut();
      // Clear user from Redux store
      store.dispatch(clearUser());
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    // TODO: Implement Firebase password reset
    console.log('Password reset requested for:', email);
    // This will be implemented with Firebase's sendPasswordResetEmail
  }

  async getCurrentUser(): Promise<User | null> {
    // Get user from Redux store (fetched from Firestore)
    const state = store.getState();
    return state.user.currentUser;
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        try {
          // Fetch user details from Firestore
          const result = await store.dispatch(fetchUserDetails(firebaseUser.email));
          
          if (fetchUserDetails.fulfilled.match(result)) {
            callback(result.payload);
          } else {
            callback(null);
          }
        } catch (error) {
          console.error('Error fetching user details on auth state change:', error);
          callback(null);
        }
      } else {
        // Clear user from Redux store
        store.dispatch(clearUser());
        callback(null);
      }
    });
  }

  private getUserRole(firebaseUser: any): 'admin' | 'manager' | 'operator' {
    // TODO: Implement role management using Firebase custom claims or Firestore
    // For now, default to 'operator' for all users
    return 'operator';
  }
}

export const authAPI = new AuthAPI();
