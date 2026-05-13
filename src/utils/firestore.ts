"use client";

import { getFirestore, collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { app } from './firebase';

const db = getFirestore(app);

export interface FirestoreUser {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  fullName: string;
  createdAt: string;
  updatedAt: string;
  // Add any additional user fields you need
}

export async function getUserByEmail(email: string): Promise<FirestoreUser | null> {
  try {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    // Get the first matching document
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as FirestoreUser;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch user data');
  }
}

export async function getAllUsers(): Promise<FirestoreUser[]> {
  try {
    const usersCollection = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollection);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as FirestoreUser));
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch users');
  }
}

export async function getUsersByRole(role: 'admin' | 'manager' | 'operator'): Promise<FirestoreUser[]> {
  try {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('role', '==', role));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as FirestoreUser));
  } catch (error) {
    console.error(`Error fetching users with role ${role}:`, error);
    throw new Error(error instanceof Error ? error.message : `Failed to fetch ${role} users`);
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    // TODO: Implement user deletion from Firestore
    // This will require adding the deleteDoc function from firebase/firestore
    console.log('Delete user:', userId);
    // await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete user');
  }
}
