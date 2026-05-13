"use client";

import { Property } from '@/api/properties';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NormalText } from '@/components/ui/text';
import { Building2, Calendar, MapPin } from 'lucide-react';
import { isLeaseEndingSoon, isLeaseAlreadyEnded } from '@/utils/commonFunctions';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const formatDate = (timestamp: number | string) => {
    console.log('Formatting timestamp:', timestamp, 'Type:', typeof timestamp);
    
    // Convert to number if it's a string
    const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    
    // Check if timestamp is valid
    if (!ts || isNaN(ts)) {
      console.error('Invalid timestamp:', timestamp);
      return 'Invalid date';
    }
    
    // Check if timestamp is in seconds (Unix timestamp) or milliseconds (JS timestamp)
    // Unix timestamps are typically around 10 digits (for dates around 2000-2030)
    // JS timestamps are around 13 digits
    const date = ts < 10000000000 ? new Date(ts * 1000) : new Date(ts);
    
    console.log('Date object:', date, 'Is valid:', !isNaN(date.getTime()));
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className={
      isLeaseAlreadyEnded(property.leaseEndTimestamp) ? 'border-red-500 border-2' :
      isLeaseEndingSoon(property.leaseEndTimestamp) ? 'border-yellow-500 border-2' :
      ''
    }>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="h-5 w-5 mr-2" />
          {property.parentProjectName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start">
            <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
            <div>
              <NormalText className="font-medium">{property.propertyAddress}</NormalText>
              <NormalText className="text-sm text-gray-600">Unit {property.unitNumber}</NormalText>
            </div>
          </div>
          
          <div className="flex items-start">
            <Calendar className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
            <div>
              <NormalText className="text-sm">
                <span className="font-medium">Lease Start:</span> {formatDate(property.leaseStartTimestamp)}
              </NormalText>
              <NormalText>
                <span className="font-medium">Lease End:</span> {formatDate(property.leaseEndTimestamp)}
              </NormalText>
            </div>
          </div>

          <div>
            <NormalText className="text-sm">
              <span className="font-medium">Type:</span> {property.propertyType}
            </NormalText>
          </div>

          <div>
            <NormalText className="text-sm">
              <span className="font-medium">Rent:</span> ${property.rent || 0}
            </NormalText>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
