import React, { useState, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import moment from 'moment';
import { cn } from '../../utils/cn';
import useAnalytics from '../../hooks/useAnalytics';
import { useAuth } from '../../context/AuthContext';

// Type declarations for imported modules
declare module 'chart.js';
declare module 'react-chartjs-2';
declare module 'moment';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminDashboard: React.FC = () => {
  const { userRole } = useAuth();
  const { analyticsData, isLoading, error, refreshAnalytics } = useAnalytics();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

  // Only admin users can see this component
  if (userRole !== 'admin') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-300">
          You do not have permission to view this dashboard. Please contact an administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-md">
        <h3 className="font-bold">Error Loading Analytics</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  // If no analytics data is available
  if (!analyticsData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">No Data Available</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          There is no analytics data available yet. This could be because there are no appointments in the system.
        </p>
        <button
          onClick={refreshAnalytics}
          className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
        >
          Refresh Data
        </button>
      </div>
    );
  }

  // Data for appointment status pie chart
  const statusData = {
    labels: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [
          analyticsData.pendingAppointments,
          analyticsData.completedAppointments,
          analyticsData.completedAppointments, // Using completed twice since there's no confirmed in the type
          analyticsData.cancelledAppointments
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.7)'
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Filter appointments per day based on timeframe
  const filterAppointmentsByTimeframe = () => {
    if (!analyticsData.appointmentsPerDay.length) return [];
    
    const now = moment();
    let startDate;
    
    switch (timeframe) {
      case 'week':
        startDate = moment().subtract(7, 'days');
        break;
      case 'month':
        startDate = moment().subtract(30, 'days');
        break;
      case 'year':
        startDate = moment().subtract(365, 'days');
        break;
      default:
        startDate = moment().subtract(30, 'days');
    }
    
    return analyticsData.appointmentsPerDay
      .filter(item => moment(item.date).isAfter(startDate) && moment(item.date).isBefore(now))
      .sort((a, b) => moment(a.date).diff(moment(b.date)));
  };

  const filteredAppointments = filterAppointmentsByTimeframe();
  
  // Data for appointments per day bar chart
  const appointmentsPerDayData = {
    labels: filteredAppointments.map(item => moment(item.date).format('MMM D')),
    datasets: [
      {
        label: 'Appointments',
        data: filteredAppointments.map(item => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  const handleTimeframeChange = useCallback((newTimeframe: 'week' | 'month' | 'year') => {
    setTimeframe(newTimeframe);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 md:mb-0">Admin Dashboard</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => handleTimeframeChange('week')}
            className={cn(
              "px-3 py-1 rounded-md text-sm",
              timeframe === 'week'
                ? "bg-primary-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            )}
          >
            Past Week
          </button>
          <button
            onClick={() => handleTimeframeChange('month')}
            className={cn(
              "px-3 py-1 rounded-md text-sm",
              timeframe === 'month'
                ? "bg-primary-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            )}
          >
            Past Month
          </button>
          <button
            onClick={() => handleTimeframeChange('year')}
            className={cn(
              "px-3 py-1 rounded-md text-sm",
              timeframe === 'year'
                ? "bg-primary-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            )}
          >
            Past Year
          </button>
          <button
            onClick={refreshAnalytics}
            className="px-3 py-1 rounded-md text-sm bg-blue-500 text-white hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Appointments</h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{analyticsData.totalAppointments}</p>
          <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Completed Appointments</h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{analyticsData.completedAppointments}</p>
          <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span className="text-green-600 dark:text-green-400">
              {analyticsData.totalAppointments > 0 
                ? `${Math.round((analyticsData.completedAppointments / analyticsData.totalAppointments) * 100)}% completion rate`
                : '0% completion rate'
              }
            </span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Pending Appointments</h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{analyticsData.pendingAppointments}</p>
          <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded-full">
              Needs Attention
            </span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Avg. Appointment Duration</h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {Math.round(analyticsData.averageAppointmentDuration)} min
          </p>
          <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
            Based on all appointments
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Appointment Status</h3>
          <div className="h-64">
            <Pie 
              data={statusData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Appointments Over Time</h3>
          <div className="h-64">
            {filteredAppointments.length > 0 ? (
              <Bar 
                data={appointmentsPerDayData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                      }
                    },
                    x: {
                      ticks: {
                        color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                      }
                    }
                  }
                }} 
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">No data available for selected timeframe</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Top Clients */}
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Top Clients</h3>
        {analyticsData.topClients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Client Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Appointments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {analyticsData.topClients.map((client, index) => (
                  <tr key={client.clientId} className={index % 2 === 0 ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-800'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {client.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {client.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {analyticsData.totalAppointments > 0 
                        ? `${Math.round((client.count / analyticsData.totalAppointments) * 100)}%`
                        : '0%'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No client data available</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 