import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Appointment } from '../types/appointments';

interface AnalyticsData {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
  appointmentsPerDay: { date: string; count: number }[];
  topClients: { clientId: string; clientName: string; count: number }[];
  averageAppointmentDuration: number; // in minutes
}

interface UseAnalyticsReturn {
  analyticsData: AnalyticsData | null;
  isLoading: boolean;
  error: Error | null;
  refreshAnalytics: () => Promise<void>;
  getAppointmentsByDateRange: (startDate: Date, endDate: Date) => Promise<Appointment[]>;
}

const DEFAULT_ANALYTICS: AnalyticsData = {
  totalAppointments: 0,
  completedAppointments: 0,
  cancelledAppointments: 0,
  pendingAppointments: 0,
  appointmentsPerDay: [],
  topClients: [],
  averageAppointmentDuration: 0
};

export default function useAnalytics(): UseAnalyticsReturn {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, userRole } = useAuth();

  // Calculate analytics from appointments
  const calculateAnalytics = useCallback(async () => {
    if (!user || userRole !== 'admin') {
      return DEFAULT_ANALYTICS;
    }
    
    try {
      // Get all appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*');
        
      if (appointmentsError) throw appointmentsError;
      
      if (!appointments || appointments.length === 0) {
        return DEFAULT_ANALYTICS;
      }
      
      const typedAppointments = appointments as Appointment[];
      
      // Calculate basic stats
      const totalAppointments = typedAppointments.length;
      const completedAppointments = typedAppointments.filter(a => a.status === 'completed').length;
      const cancelledAppointments = typedAppointments.filter(a => a.status === 'cancelled').length;
      const pendingAppointments = typedAppointments.filter(a => a.status === 'pending').length;
      
      // Calculate average duration in minutes
      const durations = typedAppointments.map(a => {
        const start = new Date(a.start_time);
        const end = new Date(a.end_time);
        return (end.getTime() - start.getTime()) / (1000 * 60); // Convert to minutes
      });
      
      const averageAppointmentDuration = durations.length > 0 
        ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length 
        : 0;
      
      // Group appointments by day
      const appointmentsByDay = typedAppointments.reduce((acc, appointment) => {
        const date = new Date(appointment.start_time).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(appointment);
        return acc;
      }, {} as Record<string, Appointment[]>);
      
      const appointmentsPerDay = Object.entries(appointmentsByDay)
        .map(([date, appointments]) => ({
          date,
          count: appointments.length
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      // Calculate top clients
      const clientCounts = typedAppointments.reduce((acc, appointment) => {
        const clientId = appointment.client_id;
        if (!acc[clientId]) {
          acc[clientId] = 0;
        }
        acc[clientId]++;
        return acc;
      }, {} as Record<string, number>);
      
      // Get client profiles for names
      const { data: clientProfiles, error: clientsError } = await supabase
        .from('user_profiles')
        .select('user_id, full_name')
        .in('user_id', Object.keys(clientCounts));
        
      if (clientsError) throw clientsError;
      
      const clientProfileMap = (clientProfiles || []).reduce((acc, profile: any) => {
        acc[profile.user_id] = profile.full_name || 'Unknown Client';
        return acc;
      }, {} as Record<string, string>);
      
      const topClients = Object.entries(clientCounts)
        .map(([clientId, count]) => ({
          clientId,
          clientName: clientProfileMap[clientId] || 'Unknown Client',
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 clients
      
      return {
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        pendingAppointments,
        appointmentsPerDay,
        topClients,
        averageAppointmentDuration
      };
    } catch (err) {
      console.error('Error calculating analytics:', err);
      throw err;
    }
  }, [user, userRole]);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    if (!user || userRole !== 'admin') {
      setAnalyticsData(null);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const analytics = await calculateAnalytics();
      setAnalyticsData(analytics);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch analytics'));
    } finally {
      setIsLoading(false);
    }
  }, [user, userRole, calculateAnalytics]);

  // Get appointments by date range
  const getAppointmentsByDateRange = useCallback(async (startDate: Date, endDate: Date) => {
    if (!user || userRole !== 'admin') return [];
    
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('start_time', startDate.toISOString())
        .lte('end_time', endDate.toISOString())
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      
      return data as Appointment[];
    } catch (err) {
      console.error('Error fetching appointments by date range:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch appointments by date range'));
      return [];
    }
  }, [user, userRole]);

  // Manual refresh function
  const refreshAnalytics = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  // Initial fetch
  useEffect(() => {
    if (user && userRole === 'admin') {
      fetchAnalytics();
    } else {
      setAnalyticsData(null);
    }
  }, [user, userRole, fetchAnalytics]);

  return {
    analyticsData,
    isLoading,
    error,
    refreshAnalytics,
    getAppointmentsByDateRange
  };
} 