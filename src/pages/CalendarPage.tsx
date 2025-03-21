import React from 'react';
import { useAuth } from '../context/AuthContext';
import ClientCalendar from '../components/client/ClientCalendar';
import AdminCalendar from '../components/admin/AdminCalendar';
import AdminDashboard from '../components/admin/AdminDashboard';

const CalendarPage: React.FC = () => {
  const { userRole } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {userRole === 'admin' ? 'Admin Calendar & Dashboard' : 'Book an Appointment'}
      </h1>
      
      {userRole === 'admin' ? (
        <div className="space-y-8">
          <AdminDashboard />
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Calendar View</h2>
            <AdminCalendar />
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
          <ClientCalendar />
        </div>
      )}
    </div>
  );
};

export default CalendarPage; 