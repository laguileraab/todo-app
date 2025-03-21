import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Appointment, AppointmentStatus, CalendarEvent, AppointmentNote } from '../types/appointments';
import { useAuth } from '../context/AuthContext';

interface UseAppointmentsReturn {
  appointments: Appointment[];
  calendarEvents: CalendarEvent[];
  isLoading: boolean;
  error: Error | null;
  createAppointment: (appointmentData: Omit<Appointment, 'id' | 'created_at'>) => Promise<Appointment | null>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<Appointment | null>;
  deleteAppointment: (id: string) => Promise<boolean>;
  getAppointmentById: (id: string) => Promise<Appointment | null>;
  addAppointmentNote: (appointmentId: string, content: string) => Promise<AppointmentNote | null>;
  getAppointmentNotes: (appointmentId: string) => Promise<AppointmentNote[]>;
  refreshAppointments: () => Promise<void>;
  getAvailableTimeSlots: (date: Date) => Promise<{ start: Date; end: Date }[]>;
}

export default function useAppointments(): UseAppointmentsReturn {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, userRole } = useAuth();

  // Convert appointments to calendar events format
  const convertToCalendarEvents = useCallback((appointments: Appointment[]): CalendarEvent[] => {
    return appointments.map(appointment => ({
      id: appointment.id,
      title: appointment.title,
      start: new Date(appointment.start_time),
      end: new Date(appointment.end_time),
      status: appointment.status,
      notes: appointment.notes,
      clientId: appointment.client_id,
      allDay: false
    }));
  }, []);

  // Fetch appointments based on user role
  const fetchAppointments = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase.from('appointments').select('*');
      
      // Admin sees all appointments, clients see only their own
      if (userRole === 'client') {
        query = query.eq('client_id', user.id);
      }
      
      const { data, error } = await query.order('start_time', { ascending: true });
      
      if (error) throw error;
      
      const appointmentData = data as Appointment[];
      setAppointments(appointmentData);
      setCalendarEvents(convertToCalendarEvents(appointmentData));
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch appointments'));
    } finally {
      setIsLoading(false);
    }
  }, [user, userRole, convertToCalendarEvents]);

  // Check if a proposed appointment respects the 2-hour gap rule
  const respectsTimeGap = useCallback(async (startTime: Date, endTime: Date, excludeAppointmentId?: string): Promise<boolean> => {
    // Convert Date objects to ISO strings for Supabase query
    const startTimeStr = startTime.toISOString();
    const endTimeStr = endTime.toISOString();
    
    // Calculate 2 hours before and after the proposed appointment
    const twoHoursBefore = new Date(startTime.getTime() - 2 * 60 * 60 * 1000).toISOString();
    const twoHoursAfter = new Date(endTime.getTime() + 2 * 60 * 60 * 1000).toISOString();
    
    try {
      // Query for overlapping appointments within the 2-hour buffer
      let query = supabase
        .from('appointments')
        .select('*')
        .or(`start_time.gte.${twoHoursBefore},end_time.lte.${twoHoursAfter}`)
        .not('status', 'eq', 'cancelled');
      
      // Exclude the current appointment if we're updating
      if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // If there are any appointments in the 2-hour window, return false
      return data.length === 0;
    } catch (err) {
      console.error('Error checking time gap:', err);
      return false;
    }
  }, []);

  // Create a new appointment
  const createAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id' | 'created_at'>) => {
    if (!user) return null;
    
    try {
      const startDateTime = new Date(appointmentData.start_time);
      const endDateTime = new Date(appointmentData.end_time);
      
      // Check if the appointment respects the 2-hour gap
      const isValidTimeGap = await respectsTimeGap(startDateTime, endDateTime);
      if (!isValidTimeGap) {
        throw new Error('Appointments must have a 2-hour gap between them. Please select another time.');
      }
      
      const newAppointment = {
        ...appointmentData,
        client_id: userRole === 'admin' ? appointmentData.client_id : user.id,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('appointments')
        .insert(newAppointment)
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchAppointments();
      return data as Appointment;
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err instanceof Error ? err : new Error('Failed to create appointment'));
      return null;
    }
  }, [user, userRole, fetchAppointments, respectsTimeGap]);

  // Update an existing appointment
  const updateAppointment = useCallback(async (id: string, updates: Partial<Appointment>) => {
    if (!user) return null;
    
    try {
      // Check if user has permission to update this appointment
      if (userRole === 'client') {
        const { data: appointment } = await supabase
          .from('appointments')
          .select('client_id')
          .eq('id', id)
          .single();
          
        if (!appointment || appointment.client_id !== user.id) {
          throw new Error('You do not have permission to update this appointment');
        }
      }
      
      // If start or end time is being updated, check the 2-hour gap
      if (updates.start_time || updates.end_time) {
        const { data: currentAppointment } = await supabase
          .from('appointments')
          .select('start_time, end_time')
          .eq('id', id)
          .single();
          
        if (currentAppointment) {
          const startTime = new Date(updates.start_time || currentAppointment.start_time);
          const endTime = new Date(updates.end_time || currentAppointment.end_time);
          
          const isValidTimeGap = await respectsTimeGap(startTime, endTime, id);
          if (!isValidTimeGap) {
            throw new Error('Appointments must have a 2-hour gap between them. Please select another time.');
          }
        }
      }
      
      const { data, error } = await supabase
        .from('appointments')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchAppointments();
      return data as Appointment;
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError(err instanceof Error ? err : new Error('Failed to update appointment'));
      return null;
    }
  }, [user, userRole, fetchAppointments, respectsTimeGap]);

  // Delete an appointment
  const deleteAppointment = useCallback(async (id: string) => {
    if (!user) return false;
    
    try {
      // Check if user has permission to delete this appointment
      if (userRole === 'client') {
        const { data: appointment } = await supabase
          .from('appointments')
          .select('client_id')
          .eq('id', id)
          .single();
          
        if (!appointment || appointment.client_id !== user.id) {
          throw new Error('You do not have permission to delete this appointment');
        }
      }
      
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchAppointments();
      return true;
    } catch (err) {
      console.error('Error deleting appointment:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete appointment'));
      return false;
    }
  }, [user, userRole, fetchAppointments]);

  // Get appointment by ID
  const getAppointmentById = useCallback(async (id: string) => {
    if (!user) return null;
    
    try {
      let query = supabase
        .from('appointments')
        .select('*')
        .eq('id', id);
        
      // Clients can only see their own appointments
      if (userRole === 'client') {
        query = query.eq('client_id', user.id);
      }
      
      const { data, error } = await query.single();
      
      if (error) throw error;
      
      return data as Appointment;
    } catch (err) {
      console.error('Error fetching appointment:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch appointment'));
      return null;
    }
  }, [user, userRole]);

  // Add a note to an appointment
  const addAppointmentNote = useCallback(async (appointmentId: string, content: string) => {
    if (!user) return null;
    
    try {
      // Check if user has permission to add notes to this appointment
      if (userRole === 'client') {
        const { data: appointment } = await supabase
          .from('appointments')
          .select('client_id')
          .eq('id', appointmentId)
          .single();
          
        if (!appointment || appointment.client_id !== user.id) {
          throw new Error('You do not have permission to add notes to this appointment');
        }
      }
      
      const newNote = {
        appointment_id: appointmentId,
        content,
        created_by: user.id,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('appointment_notes')
        .insert(newNote)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as AppointmentNote;
    } catch (err) {
      console.error('Error adding appointment note:', err);
      setError(err instanceof Error ? err : new Error('Failed to add appointment note'));
      return null;
    }
  }, [user, userRole]);

  // Get notes for an appointment
  const getAppointmentNotes = useCallback(async (appointmentId: string) => {
    if (!user) return [];
    
    try {
      // Check if user has permission to view this appointment's notes
      if (userRole === 'client') {
        const { data: appointment } = await supabase
          .from('appointments')
          .select('client_id')
          .eq('id', appointmentId)
          .single();
          
        if (!appointment || appointment.client_id !== user.id) {
          throw new Error('You do not have permission to view this appointment');
        }
      }
      
      const { data, error } = await supabase
        .from('appointment_notes')
        .select('*')
        .eq('appointment_id', appointmentId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return data as AppointmentNote[];
    } catch (err) {
      console.error('Error fetching appointment notes:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch appointment notes'));
      return [];
    }
  }, [user, userRole]);

  // Get available time slots for a specific date
  const getAvailableTimeSlots = useCallback(async (date: Date): Promise<{ start: Date; end: Date }[]> => {
    try {
      // Define business hours (9 AM to 5 PM)
      const businessHours = {
        start: 9, // 9 AM
        end: 17,  // 5 PM
      };
      
      // Set the date to the selected day at midnight
      const selectedDay = new Date(date);
      selectedDay.setHours(0, 0, 0, 0);
      
      // Create array of all possible 30-minute slots
      const allSlots: { start: Date; end: Date }[] = [];
      
      for (let hour = businessHours.start; hour < businessHours.end; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const start = new Date(selectedDay);
          start.setHours(hour, minute, 0, 0);
          
          const end = new Date(start);
          end.setMinutes(end.getMinutes() + 30);
          
          // Only add slots if they're in the future
          if (start > new Date()) {
            allSlots.push({ start, end });
          }
        }
      }
      
      // Get existing appointments for this day
      const dayStart = new Date(selectedDay);
      const dayEnd = new Date(selectedDay);
      dayEnd.setHours(23, 59, 59, 999);
      
      const { data: existingAppointments, error } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .gte('start_time', dayStart.toISOString())
        .lte('end_time', dayEnd.toISOString())
        .not('status', 'eq', 'cancelled');
      
      if (error) throw error;
      
      if (!existingAppointments || existingAppointments.length === 0) {
        return allSlots; // All slots available if no appointments
      }
      
      // Convert DB appointments to Date objects
      const bookedSlots = existingAppointments.map(appt => ({
        start: new Date(appt.start_time),
        end: new Date(appt.end_time)
      }));
      
      // Filter out unavailable slots (those within 2 hours of existing appointments)
      const availableSlots = allSlots.filter(slot => {
        // Check if this slot is at least 2 hours away from any booked slot
        return bookedSlots.every(booked => {
          const slotStart = slot.start.getTime();
          const slotEnd = slot.end.getTime();
          const bookedStart = booked.start.getTime();
          const bookedEnd = booked.end.getTime();
          
          // Calculate 2 hours in milliseconds
          const twoHours = 2 * 60 * 60 * 1000;
          
          // Check if slot is at least 2 hours before or after the booked slot
          return (slotEnd <= bookedStart - twoHours) || (slotStart >= bookedEnd + twoHours);
        });
      });
      
      return availableSlots;
    } catch (err) {
      console.error('Error fetching available time slots:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch available time slots'));
      return [];
    }
  }, []);

  // Manual refresh function
  const refreshAppointments = useCallback(async () => {
    await fetchAppointments();
  }, [fetchAppointments]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchAppointments();
    } else {
      setAppointments([]);
      setCalendarEvents([]);
    }
  }, [user, fetchAppointments]);

  return {
    appointments,
    calendarEvents,
    isLoading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentById,
    addAppointmentNote,
    getAppointmentNotes,
    refreshAppointments,
    getAvailableTimeSlots
  };
} 