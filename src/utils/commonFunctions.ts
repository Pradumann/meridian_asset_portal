export const isLeaseEndingSoon = (timestamp: number | string): boolean => {
  const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
  if (!ts || isNaN(ts)) return false;
  
  const date = ts < 10000000000 ? new Date(ts * 1000) : new Date(ts);
  if (isNaN(date.getTime())) return false;
  
  const now = new Date();
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(now.getMonth() + 1);
  
  return date <= oneMonthFromNow;
};

export const isLeaseAlreadyEnded = (timestamp: number | string | null | undefined): boolean => {
  // Return true if there is no leaseEndTimestamp
  if (!timestamp) return true;
  
  const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
  if (!ts || isNaN(ts)) return true;
  
  const date = ts < 10000000000 ? new Date(ts * 1000) : new Date(ts);
  if (isNaN(date.getTime())) return true;
  
  const now = new Date();
  // Return true if lease ended before today
  return date < now;
};

export const calculatePhysicalOccupancy = (properties: Array<{ leaseStartTimestamp: number | string; leaseEndTimestamp: number | string | null | undefined }>): number => {
  if (!properties || properties.length === 0) return 0;
  
  const now = new Date();
  let occupiedCount = 0;
  
  properties.forEach(property => {
    const startTs = typeof property.leaseStartTimestamp === 'string' ? parseInt(property.leaseStartTimestamp) : property.leaseStartTimestamp;
    const endTs = property.leaseEndTimestamp ? (typeof property.leaseEndTimestamp === 'string' ? parseInt(property.leaseEndTimestamp) : property.leaseEndTimestamp) : null;
    
    if (!startTs || isNaN(startTs)) return;
    
    const startDate = startTs < 10000000000 ? new Date(startTs * 1000) : new Date(startTs);
    if (isNaN(startDate.getTime())) return;
    
    // If no end date, assume it's still occupied if lease has started
    if (!endTs || isNaN(endTs)) {
      if (startDate <= now) {
        occupiedCount++;
      }
      return;
    }
    
    const endDate = endTs < 10000000000 ? new Date(endTs * 1000) : new Date(endTs);
    if (isNaN(endDate.getTime())) return;
    
    // Property is occupied if current date is between lease start and end
    if (startDate <= now && endDate >= now) {
      occupiedCount++;
    }
  });
  
  const percentage = (occupiedCount / properties.length) * 100;
  return Math.round(percentage * 100) / 100; // Round to 2 decimal places
};

export const getLeaseOverallStatus = (properties: Array<{ leaseStartTimestamp: number | string; leaseEndTimestamp: number | string | null | undefined }>): { activeLease: number; expiringThisMonth: number } => {
  if (!properties || properties.length === 0) {
    return { activeLease: 0, expiringThisMonth: 0 };
  }
  
  const now = new Date();
  const endOfMonth = new Date();
  endOfMonth.setMonth(now.getMonth() + 1);
  endOfMonth.setDate(0); // Last day of current month
  endOfMonth.setHours(23, 59, 59, 999);
  
  let activeLease = 0;
  let expiringThisMonth = 0;
  
  properties.forEach(property => {
    const startTs = typeof property.leaseStartTimestamp === 'string' ? parseInt(property.leaseStartTimestamp) : property.leaseStartTimestamp;
    const endTs = property.leaseEndTimestamp ? (typeof property.leaseEndTimestamp === 'string' ? parseInt(property.leaseEndTimestamp) : property.leaseEndTimestamp) : null;
    
    if (!startTs || isNaN(startTs)) return;
    
    const startDate = startTs < 10000000000 ? new Date(startTs * 1000) : new Date(startTs);
    if (isNaN(startDate.getTime())) return;
    
    // If no end date, assume it's still active if lease has started
    if (!endTs || isNaN(endTs)) {
      if (startDate <= now) {
        activeLease++;
      }
      return;
    }
    
    const endDate = endTs < 10000000000 ? new Date(endTs * 1000) : new Date(endTs);
    if (isNaN(endDate.getTime())) return;
    
    // Lease is active if current date is between lease start and end
    if (startDate <= now && endDate >= now) {
      activeLease++;
      
      // Check if lease expires this month
      if (endDate <= endOfMonth) {
        expiringThisMonth++;
      }
    }
  });
  
  return { activeLease, expiringThisMonth };
};

export const expectedRentCollection = (properties: Array<{ leaseStartTimestamp: number | string; leaseEndTimestamp: number | string | null | undefined; rent?: number }>): number => {
  if (!properties || properties.length === 0) return 0;
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);
  
  console.log('Expected rent calculation for current month:');
  console.log('Now:', now);
  console.log('Start of month:', startOfMonth);
  console.log('End of month:', endOfMonth);
  
  let totalExpectedRent = 0;
  
  properties.forEach((property, index) => {
    const rent = property.rent || 0;
    console.log(`Property ${index}: rent=${rent}`);
    if (rent === 0) return;
    
    const startTs = typeof property.leaseStartTimestamp === 'string' ? parseInt(property.leaseStartTimestamp) : property.leaseStartTimestamp;
    const endTs = property.leaseEndTimestamp ? (typeof property.leaseEndTimestamp === 'string' ? parseInt(property.leaseEndTimestamp) : property.leaseEndTimestamp) : null;
    
    console.log(`Property ${index}: startTs=${startTs}, endTs=${endTs}`);
    
    const startDate = startTs < 10000000000 ? new Date(startTs * 1000) : new Date(startTs);
    console.log(`Property ${index}: startDate=${startDate}`);
    if (isNaN(startDate.getTime())) {
      console.log(`Property ${index}: Invalid start date, skipping`);
      return;
    }
    
    // If no end date, assume full rent for current month if lease has started
    if (!endTs || isNaN(endTs)) {
      if (startDate <= endOfMonth) {
        // Lease started before or during this month
        if (startDate < startOfMonth) {
          console.log(`Property ${index}: No end date, lease started before this month, adding full rent ${rent}`);
          totalExpectedRent += rent;
        } else {
          // Lease started during this month, calculate prorated rent
          const daysInMonth = endOfMonth.getDate();
          const daysOccupied = daysInMonth - startDate.getDate() + 1;
          const dailyRent = rent / daysInMonth;
          const proratedRent = dailyRent * daysOccupied;
          console.log(`Property ${index}: No end date, lease started during this month, prorated rent=${proratedRent} (days=${daysOccupied}/${daysInMonth})`);
          totalExpectedRent += Math.round(proratedRent * 100) / 100;
        }
      }
      return;
    }
    
    const endDate = endTs < 10000000000 ? new Date(endTs * 1000) : new Date(endTs);
    console.log(`Property ${index}: endDate=${endDate}`);
    if (isNaN(endDate.getTime())) {
      console.log(`Property ${index}: Invalid end date, skipping`);
      return;
    }
    
    // If lease ends before this month starts, no rent
    if (endDate < startOfMonth) {
      console.log(`Property ${index}: Lease ended before this month, no rent`);
      return;
    }
    
    // If lease starts after this month ends, no rent
    if (startDate > endOfMonth) {
      console.log(`Property ${index}: Lease starts after this month, no rent`);
      return;
    }
    
    // Calculate the overlap between lease and current month
    const leaseStart = startDate < startOfMonth ? startOfMonth : startDate;
    const leaseEnd = endDate > endOfMonth ? endOfMonth : endDate;
    
    const daysInMonth = endOfMonth.getDate();
    const daysOccupied = Math.ceil((leaseEnd.getTime() - leaseStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const dailyRent = rent / daysInMonth;
    const proratedRent = dailyRent * daysOccupied;
    
    console.log(`Property ${index}: Lease active during this month, prorated rent=${proratedRent} (days=${daysOccupied}/${daysInMonth})`);
    totalExpectedRent += Math.round(proratedRent * 100) / 100;
  });
  
  console.log('Total expected rent:', totalExpectedRent);
  return Math.round(totalExpectedRent * 100) / 100; // Round to 2 decimal places
};
