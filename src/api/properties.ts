"use client";

import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/utils/firebase';

const db = getFirestore(app);

export interface Property {
  id: string;
  operatorEmail: string;
  leaseEndTimestamp: number;
  leaseStartTimestamp: number;
  parentProjectName: string;
  propertyAddress: string;
  propertyType: string;
  unitNumber: string;
  rent?: number;
}

export async function getPropertiesByOperatorEmail(operatorEmail: string): Promise<Property[]> {
  try {
    console.log('Querying properties for operatorEmail:', operatorEmail);
    const propertiesCollection = collection(db, 'properties');
    const q = query(propertiesCollection, where('operatorEmail', '==', operatorEmail));
    const querySnapshot = await getDocs(q);
    
    console.log('Query snapshot size:', querySnapshot.size);
    console.log('Query snapshot docs:', querySnapshot.docs);
    
    const properties = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to serializable numbers
      const leaseStartTimestamp = data.leaseStartTimestamp?.toMillis ? 
        data.leaseStartTimestamp.toMillis() : 
        (typeof data.leaseStartTimestamp === 'number' ? data.leaseStartTimestamp : Number(data.leaseStartTimestamp));
      
      const leaseEndTimestamp = data.leaseEndTimestamp?.toMillis ? 
        data.leaseEndTimestamp.toMillis() : 
        (typeof data.leaseEndTimestamp === 'number' ? data.leaseEndTimestamp : Number(data.leaseEndTimestamp));
      
      return {
        id: doc.id,
        operatorEmail: data.operatorEmail,
        leaseEndTimestamp,
        leaseStartTimestamp,
        parentProjectName: data.parentProjectName,
        propertyAddress: data.propertyAddress,
        propertyType: data.propertyType,
        unitNumber: data.unitNumber,
        rent: data.rent,
      } as Property;
    });
    
    console.log('Mapped properties:', properties);
    
    return properties;
  } catch (error) {
    console.error('Error fetching properties by operator email:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch properties');
  }
}
