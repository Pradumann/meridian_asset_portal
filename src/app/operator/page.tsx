"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Users, Settings, LogOut, User, Mail, Phone, Map, Calendar, FileText, AlertTriangle, DollarSign, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TitleText, NormalText } from '@/components/ui/text';
import { getManagerByEmail, getCurrentUserParentEmail } from '@/api/user';
import { PropertyCard } from '@/components/ui/property-card';
import { store } from '@/localStore';
import { fetchPropertiesByOperatorEmail } from '@/localStore/slices/propertySlice';
import { calculatePhysicalOccupancy, getLeaseOverallStatus, expectedRentCollection } from '@/utils/commonFunctions';

interface ManagerInfo {
  id: string;
  fullName: string;
  email: string;
}

function OperatorDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('occupancy');
  const [occupancy, setOccupancy] = useState(0);
  const [assignedManager, setAssignedManager] = useState<ManagerInfo | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [leaseStatus, setLeaseStatus] = useState({ activeLease: 0, expiringThisMonth: 0 });
  const [expectedRent, setExpectedRent] = useState(0);

  useEffect(() => {
    const fetchAssignedManager = async () => {
      if (!user?.email) return;

      try {
        // Get the parentEmail of the current operator
        const parentEmail = await getCurrentUserParentEmail(user.email);
        
        if (parentEmail) {
          // Fetch manager details using the parentEmail
          const manager = await getManagerByEmail(parentEmail);
          setAssignedManager(manager);
        }
      } catch (error) {
        console.error('Error fetching assigned manager:', error);
      }
    };

    const fetchProperties = async () => {
      if (!user?.email) return;

      console.log('Fetching properties for operator email:', user.email);

      try {
        const result = await store.dispatch(fetchPropertiesByOperatorEmail(user.email));
        console.log('Fetch properties result:', result);
        if (fetchPropertiesByOperatorEmail.fulfilled.match(result)) {
          console.log('Properties fetched successfully:', result.payload);
          setProperties(result.payload);
          const occupancy = calculatePhysicalOccupancy(result.payload);
          console.log('Physical occupancy:', occupancy);
          setOccupancy(occupancy);
          const leaseStatus = getLeaseOverallStatus(result.payload);
          console.log('Lease status:', leaseStatus);
          setLeaseStatus(leaseStatus);
          const expectedRent = expectedRentCollection(result.payload);
          console.log('Expected rent collection:', expectedRent);
          setExpectedRent(expectedRent);
        } else {
          console.error('Fetch properties rejected:', result);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };

    fetchAssignedManager();
    fetchProperties();
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  const tabs = [
    { id: 'occupancy', label: 'Physical Occupancy %', icon: Users },
    { id: 'lease', label: 'Lease', icon: FileText },
    { id: 'maintenance', label: 'Maintenance Tickets', icon: AlertTriangle },
    { id: 'incidents', label: 'Incident Reporting', icon: Phone },
    { id: 'comments', label: 'Comments', icon: FileText },
    { id: 'rent', label: 'Rent Rolls', icon: DollarSign },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'occupancy':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Physical Occupancy %</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{occupancy}%</div>
                  <NormalText className="text-gray-600">Current occupancy rate</NormalText>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'lease':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lease Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                    <NormalText>Active Leases</NormalText>
                    <span className="text-2xl font-bold text-black">{leaseStatus.activeLease}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                    <NormalText>Expiring This Month</NormalText>
                    <span className="text-2xl font-bold text-yellow-600">{leaseStatus.expiringThisMonth}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'maintenance':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                    <NormalText>Open Tickets</NormalText>
                    <span className="text-2xl font-bold text-red-600">5</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                    <NormalText>In Progress</NormalText>
                    <span className="text-2xl font-bold text-yellow-600">12</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                    <NormalText>Completed This Month</NormalText>
                    <span className="text-2xl font-bold text-green-600">28</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Button className="w-full">Raise New Ticket</Button>
          </div>
        );
      case 'incidents':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Incident Reporting</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <NormalText className="text-gray-600">No incidents reported this week</NormalText>
                </div>
              </CardContent>
            </Card>
            <Button className="w-full">Report Incident</Button>
          </div>
        );
      case 'comments':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded">
                    <NormalText>Recent comments from your assigned manager will appear here</NormalText>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Button className="w-full">Make a Comment</Button>
          </div>
        );
      case 'rent':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rent Rolls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <NormalText className="text-gray-600">Rent roll data will be available here</NormalText>
                </div>
              </CardContent>
            </Card>
            <Button className="w-full">Add Rent Roll</Button>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <Card>
              <CardContent>
                <div className="text-center py-8">
                  <NormalText className="text-gray-600">Select a tab to view details</NormalText>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <TitleText className="text-xl">Operator Portal</TitleText>
                <NormalText className="text-sm">Property Management</NormalText>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assigned Manager Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Your Manager
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assignedManager ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <TitleText className="text-lg">{assignedManager.fullName}</TitleText>
                        <NormalText className="text-sm text-gray-600">{assignedManager.email}</NormalText>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <NormalText className="text-sm text-gray-600">
                        Report to: {assignedManager.fullName}
                      </NormalText>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <NormalText className="text-gray-600">No manager assigned</NormalText>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Properties List */}
            <div>
              <Card className="bg-white p-4 rounded-lg shadow-sm border mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Properties Assigned</p>
                    <p className="text-2xl font-bold text-blue-600">{properties.length}</p>
                    <p className="text-xs text-gray-600 mt-1">Expected Rent (This Month): ${expectedRent}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <CardHeader className="px-0 pt-0">
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Your Properties
                </CardTitle>
              </CardHeader>
              <div className="space-y-4">
                {properties.length > 0 ? (
                  properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-8">
                      <div className="text-center">
                        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <NormalText className="text-gray-600">No properties assigned</NormalText>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area with Tabs */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex space-x-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                          : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <tab.icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {renderTabContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function OperatorPage() {
  return (
    <ProtectedRoute allowedRoles={['operator']}>
      <OperatorDashboard />
    </ProtectedRoute>
  );
}
