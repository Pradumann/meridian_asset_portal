"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { getUsersByRole, deleteUser, FirestoreUser } from '@/utils/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TitleText, NormalText } from '@/components/ui/text';
import { Building2, Users, ArrowLeft, Plus, Trash2, Mail, Shield } from 'lucide-react';

function ManageManagers() {
  const { user } = useAuth();
  const router = useRouter();
  const [managers, setManagers] = useState<FirestoreUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      setIsLoading(true);
      const managersList = await getUsersByRole('manager');
      // Sort managers alphabetically by fullName in ascending order
      const sortedManagers = managersList.sort((a, b) => a.fullName.localeCompare(b.fullName));
      setManagers(sortedManagers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch managers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteManager = async (managerId: string, managerEmail: string) => {
    if (!confirm(`Are you sure you want to delete manager: ${managerEmail}?`)) {
      return;
    }

    try {
      await deleteUser(managerId);
      setManagers(managers.filter(manager => manager.id !== managerId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete manager');
    }
  };

  const handleAddManager = () => {
    // TODO: Implement add manager functionality
    alert('Add manager functionality will be implemented soon');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <TitleText className="text-xl">Manage Managers</TitleText>
                <NormalText className="text-sm">Admin Portal</NormalText>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => router.push('/admin')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <TitleText className="text-2xl">Manager Accounts</TitleText>
              <NormalText className="text-gray-600 mt-1">
                Manage all manager accounts in the system
              </NormalText>
            </div>
            <Button onClick={handleAddManager}>
              <Plus className="h-4 w-4 mr-2" />
              Add Manager
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <NormalText className="text-red-600">{error}</NormalText>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              <TitleText className="text-lg">All Managers ({managers.length})</TitleText>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <NormalText>Loading managers...</NormalText>
              </div>
            ) : managers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <TitleText className="text-lg text-gray-600 mb-2">No Managers Found</TitleText>
                <NormalText className="text-gray-500">
                  No manager accounts exist in the system. Click "Add Manager" to create one.
                </NormalText>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Full Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managers.map((manager) => (
                      <tr key={manager.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <NormalText className="font-medium">{manager.fullName}</NormalText>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <NormalText>{manager.email}</NormalText>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {manager.role}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteManager(manager.id, manager.email)}
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function ManageManagersPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <ManageManagers />
    </ProtectedRoute>
  );
}
