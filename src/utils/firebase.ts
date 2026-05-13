"use client";

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword as firebaseSignIn, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import { firebaseConfig } from '../../config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };

export interface AuthResult {
  user: FirebaseUser;
  token: string;
}

export async function signInWithEmailAndPassword(email: string, password: string): Promise<AuthResult> {
  try {
    const userCredential = await firebaseSignIn(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken();
    
    return {
      user,
      token
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Authentication failed');
  }
}

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error(error instanceof Error ? error.message : 'Sign out failed');
  }
}

export async function getCurrentUser(): Promise<FirebaseUser | null> {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export function onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
  return auth.onAuthStateChanged(callback);
}
