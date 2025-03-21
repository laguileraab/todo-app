export interface Appointment {
  id: string;
  client_id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface AppointmentNote {
  id: string;
  appointment_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  created_by: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: AppointmentStatus;
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  notes?: string;
  allDay?: boolean;
}

export interface ClientProfileData {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at?: string;
} 