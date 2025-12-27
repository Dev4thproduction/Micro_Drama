'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for loading to finish
    if (!isLoading) {
      if (!user) {
        // Not logged in -> Login
        router.push('/login');
      } else if (user.role !== 'admin') {
        // Logged in but NOT Admin -> Kick to Home
        router.push('/');
      }
    }
  }, [user, isLoading, router]);

  // Show loading state while checking
  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-4 bg-indigo-600 rounded-full mb-2 animate-bounce"></div>
          <p className="text-gray-500 text-sm">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  // --- ADMIN ONLY CONTENT BELOW ---
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <Button variant="outline" onClick={logout} className="w-auto">
            Sign Out
          </Button>
        </div>

        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-md border border-red-200">
            <h2 className="text-lg font-bold text-red-900">Restricted Area</h2>
            <p className="text-red-700">Only users with role <strong>'admin'</strong> can see this page.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <span className="block text-sm text-gray-500">Admin Email</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="p-4 border rounded">
              <span className="block text-sm text-gray-500">Role</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 uppercase">
                {user.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 border rounded bg-blue-50">
              <h3 className="font-semibold text-blue-900 mb-1">CMS Module</h3>
              <p className="text-sm text-blue-800">Manage landing copy, announcements, and curated content with workflows.</p>
              <Link href="/dashboard/cms" className="mt-3 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900 underline">
                Open CMS
              </Link>
            </div>
            <div className="p-4 border rounded bg-emerald-50">
              <h3 className="font-semibold text-emerald-900 mb-1">Publishing Policy</h3>
              <p className="text-sm text-emerald-800">Admins own publishing/archival. Creators collaborate via draft/review states.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
