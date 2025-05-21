'use client';

import React from 'react';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useAuth } from '@/app/context/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/*Claude AI help with formatting this logo section and Logout button*/}
              <img 
                src="/sentlogo.png"   
                alt="Sentinel.ID" 
                width="50" 
                height="50" 
                className="h-10"
                style={{ filter: "drop-shadow(0 0 7px rgba(96, 229, 255, 0.4))" }}
              />
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <button 
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ 
                backgroundImage: "linear-gradient(to right, rgb(91, 7, 7), rgb(255, 122, 122))",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 10px rgba(87, 34, 34, 0.3)"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundImage = "linear-gradient(to right, rgb(164, 32, 32), rgb(248, 56, 56))"}
              onMouseOut={(e) => e.currentTarget.style.backgroundImage = "linear-gradient(to right, rgb(91, 7, 7), rgb(255, 122, 122))"}
            >
              Logout
            </button>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Welcome, {user?.sub || 'User'}!</h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      User Information
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Details from your authentication token
                    </p>
                  </div>
                  <div className="border-t border-gray-200">
                    <dl>
                      {user && Object.entries(user).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">{key}</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}