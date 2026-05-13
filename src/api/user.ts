"use client";

import { getUserByEmail, FirestoreUser } from '@/utils/firestore';

export interface ManagerInfo {
  id: string;
  fullName: string;
  email: string;
}

export async function getManagerByEmail(email: string): Promise<ManagerInfo | null> {
  try {
    const firestoreUser = await getUserByEmail(email);
    
    if (!firestoreUser) {
      return null;
    }
    
    return {
      id: firestoreUser.id,
      fullName: firestoreUser.fullName,
      email: firestoreUser.email,
    };
  } catch (error) {
    console.error('Error fetching manager by email:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch manager data');
  }
}

export async function getCurrentUserParentEmail(userEmail: string): Promise<string | null> {
  try {
    const firestoreUser = await getUserByEmail(userEmail);
    
    if (!firestoreUser) {
      return null;
    }
    
    // Assuming the FirestoreUser has a parentEmail field
    // If the field name is different, adjust accordingly
    return (firestoreUser as any).parentEmail || null;
  } catch (error) {
    console.error('Error fetching user parent email:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch user data');
  }
}