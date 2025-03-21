import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, momentLocalizer, SlotInfo, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { cn } from '../../utils/cn';
import useAppointments from '../../hooks/useAppointments';
import { AppointmentStatus, CalendarEvent, AppointmentNote } from '../../types/appointments';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

// Setup the localizer
const localizer = momentLocalizer(moment);

// Custom event component to style events based on their status
const EventComponent = ({ event }: { event: CalendarEvent }) => {
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 border-yellow-600';
      case 'confirmed':
        return 'bg-blue-500 border-blue-600';
      case 'completed':
        return 'bg-green-500 border-green-600';
      case 'cancelled':
        return 'bg-red-500 border-red-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  // Display client name in the event title for admin
  const displayTitle = event.clientName 
    ? `${event.title} (${event.clientName})` 
    : event.title;

  return (
    <div
      className={cn(
        "p-1 rounded truncate text-white border-l-4",
        getStatusColor(event.status)
      )}
    >
      {displayTitle}
    </div>
  );
};

interface ClientProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
}

const AdminCalendar: React.FC = () => {
  const { userRole } = useAuth();
  const { calendarEvents, appointments, updateAppointment, addAppointmentNote, getAppointmentNotes, isLoading, error, refreshAppointments } = useAppointments();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [appointmentNotes, setAppointmentNotes] = useState<AppointmentNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [clientProfiles, setClientProfiles] = useState<Record<string, ClientProfile>>({});

  // Only admin users can see this component
  if (userRole !== 'admin') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-300">
          You do not have permission to view this calendar. Please contact an administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  // Fetch client profiles
  useEffect(() => {
    const fetchClientProfiles = async () => {
      try {
        // Get unique client IDs from appointments
        const clientIds = Array.from(new Set(
          appointments.map(appointment => appointment.client_id)
        ));
        
        if (clientIds.length === 0) return;
        
        // Fetch user profiles
        const { data, error } = await supabase
          .from('client_profiles')
          .select('id, user_id, full_name, email')
          .in('user_id', clientIds);
          
        if (error) throw error;
        
        // Create map of client profiles
        const profileMap = (data || []).reduce((acc, profile) => {
          acc[profile.user_id] = profile;
          return acc;
        }, {} as Record<string, ClientProfile>);
        
        setClientProfiles(profileMap);
        
        // Update calendar events with client information
        const updatedEvents = calendarEvents.map(event => {
          if (event.clientId && profileMap[event.clientId]) {
            return {
              ...event,
              clientName: profileMap[event.clientId].full_name,
              clientEmail: profileMap[event.clientId].email
            };
          }
          return event;
        });
        
        if (JSON.stringify(updatedEvents) !== JSON.stringify(calendarEvents)) {
          // This is a hack because we can't directly update calendarEvents
          setTimeout(() => {
            refreshAppointments();
          }, 0);
        }
      } catch (err) {
        console.error('Error fetching client profiles:', err);
      }
    };
    
    fetchClientProfiles();
  }, [appointments, calendarEvents, refreshAppointments]);

  // Handle selecting an event (appointment)
  const handleSelectEvent = useCallback(async (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowAppointmentDetails(true);
    setLoadingNotes(true);
    
    try {
      const notes = await getAppointmentNotes(event.id);
      setAppointmentNotes(notes);
    } catch (err) {
      console.error('Error fetching appointment notes:', err);
    } finally {
      setLoadingNotes(false);
    }
  }, [getAppointmentNotes]);

  // Handle closing the appointment details modal
  const handleCloseDetails = useCallback(() => {
    setShowAppointmentDetails(false);
    setSelectedEvent(null);
    setAppointmentNotes([]);
    setNewNote('');
  }, []);

  // Handle changing appointment status
  const handleStatusChange = useCallback(async (appointmentId: string, status: AppointmentStatus) => {
    try {
      await updateAppointment(appointmentId, { status });
      if (selectedEvent) {
        setSelectedEvent({
          ...selectedEvent,
          status
        });
      }
    } catch (err) {
      console.error('Error updating appointment status:', err);
      alert('Failed to update appointment status.');
    }
  }, [updateAppointment, selectedEvent]);

  // Handle adding a note
  const handleAddNote = useCallback(async () => {
    if (!selectedEvent || !newNote.trim()) return;
    
    try {
      const note = await addAppointmentNote(selectedEvent.id, newNote);
      if (note) {
        setAppointmentNotes(prev => [...prev, note]);
        setNewNote('');
      }
    } catch (err) {
      console.error('Error adding note:', err);
      alert('Failed to add note.');
    }
  }, [selectedEvent, newNote, addAppointmentNote]);

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
        <h3 className="font-bold">Error Loading Calendar</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          This calendar shows all appointments from all clients. Click on an appointment to view details and add notes.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Pending</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Confirmed</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Cancelled</span>
          </div>
        </div>
      </div>
      
      <div className="calendar-container h-[600px] mb-6">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          defaultView={Views.WEEK}
          views={['month', 'week', 'day', 'agenda']}
          components={{
            event: EventComponent
          }}
          className="bg-white dark:bg-gray-800 rounded-md overflow-hidden"
        />
      </div>
      
      {showAppointmentDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{selectedEvent.title}</h3>
              <button
                onClick={handleCloseDetails}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {moment(selectedEvent.start).format('MMMM D, YYYY')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {moment(selectedEvent.start).format('h:mm A')} - {moment(selectedEvent.end).format('h:mm A')}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <div className="mt-1 flex items-center">
                    <span 
                      className={cn(
                        "inline-block w-3 h-3 rounded-full mr-2",
                        selectedEvent.status === 'pending' ? "bg-yellow-500" :
                        selectedEvent.status === 'confirmed' ? "bg-blue-500" :
                        selectedEvent.status === 'completed' ? "bg-green-500" :
                        "bg-red-500"
                      )}
                    ></span>
                    <span className="font-medium text-gray-800 dark:text-white capitalize">
                      {selectedEvent.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Client</p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {selectedEvent.clientName || 'Unknown'}
                  </p>
                </div>
                
                {selectedEvent.clientEmail && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {selectedEvent.clientEmail}
                    </p>
                  </div>
                )}
                
                {selectedEvent.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {selectedEvent.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-bold text-gray-800 dark:text-white mb-2">Update Status</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStatusChange(selectedEvent.id, 'pending')}
                  className={cn(
                    "px-3 py-1 rounded-md text-sm transition-colors",
                    selectedEvent.status === 'pending'
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-yellow-500 hover:text-white dark:bg-gray-700 dark:text-gray-300"
                  )}
                >
                  Pending
                </button>
                <button
                  onClick={() => handleStatusChange(selectedEvent.id, 'confirmed')}
                  className={cn(
                    "px-3 py-1 rounded-md text-sm transition-colors",
                    selectedEvent.status === 'confirmed'
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white dark:bg-gray-700 dark:text-gray-300"
                  )}
                >
                  Confirmed
                </button>
                <button
                  onClick={() => handleStatusChange(selectedEvent.id, 'completed')}
                  className={cn(
                    "px-3 py-1 rounded-md text-sm transition-colors",
                    selectedEvent.status === 'completed'
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-green-500 hover:text-white dark:bg-gray-700 dark:text-gray-300"
                  )}
                >
                  Completed
                </button>
                <button
                  onClick={() => handleStatusChange(selectedEvent.id, 'cancelled')}
                  className={cn(
                    "px-3 py-1 rounded-md text-sm transition-colors",
                    selectedEvent.status === 'cancelled'
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-red-500 hover:text-white dark:bg-gray-700 dark:text-gray-300"
                  )}
                >
                  Cancelled
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-800 dark:text-white mb-2">Notes</h4>
              
              {loadingNotes ? (
                <div className="flex justify-center items-center h-16">
                  <div className="w-6 h-6 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  <div className="mb-4 space-y-3 max-h-48 overflow-y-auto">
                    {appointmentNotes.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 italic">No notes yet</p>
                    ) : (
                      appointmentNotes.map(note => (
                        <div key={note.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          <p className="text-gray-800 dark:text-white text-sm mb-1">{note.content}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {moment(note.created_at).format('MMM D, YYYY h:mm A')}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      placeholder="Add a note..."
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      className={cn(
                        "px-4 py-2 rounded transition-colors",
                        newNote.trim()
                          ? "bg-primary-500 text-white hover:bg-primary-600"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                      )}
                    >
                      Add
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCalendar; 