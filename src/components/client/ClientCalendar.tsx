import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar, momentLocalizer, SlotInfo, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { cn } from '../../utils/cn';
import useAppointments from '../../hooks/useAppointments';
import { AppointmentStatus, CalendarEvent } from '../../types/appointments';
import { useAuth } from '../../context/AuthContext';

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

  return (
    <div
      className={cn(
        "p-1 rounded truncate text-white border-l-4",
        getStatusColor(event.status)
      )}
    >
      {event.title}
    </div>
  );
};

interface AppointmentFormData {
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  notes?: string;
}

interface TimeSlot {
  value: string;
  label: string;
  disabled: boolean;
}

const ClientCalendar: React.FC = () => {
  const { user } = useAuth();
  const { calendarEvents, appointments, createAppointment, isLoading, error, getAvailableTimeSlots } = useAppointments();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [formData, setFormData] = useState<AppointmentFormData>({
    title: '',
    date: new Date(),
    startTime: '09:00',
    endTime: '09:30',
    notes: ''
  });
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{ start: Date; end: Date }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const fetchAvailableSlots = useCallback(async (date: Date) => {
    setLoadingSlots(true);
    try {
      const slots = await getAvailableTimeSlots(date);
      setAvailableTimeSlots(slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  }, [getAvailableTimeSlots]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate, fetchAvailableSlots]);

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    // Only allow selecting future dates
    const now = new Date();
    if (slotInfo.start < now) {
      alert('Cannot book appointments in the past.');
      return;
    }
    
    setSelectedDate(slotInfo.start);
    setFormData(prev => ({
      ...prev, 
      date: slotInfo.start,
      startTime: '09:00',
      endTime: '09:30'
    }));
    setShowAppointmentForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowAppointmentForm(false);
    setSelectedDate(null);
    setAvailableTimeSlots([]);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'startTime') {
      // When start time changes, automatically set end time to 30 minutes later
      const startMoment = moment(value, 'HH:mm');
      const endMoment = moment(startMoment).add(30, 'minutes');
      const endTime = endMoment.format('HH:mm');
      
      setFormData(prev => ({ 
        ...prev, 
        startTime: value,
        endTime: endTime 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !formData.date) return;
    
    const startDateTime = moment(formData.date)
      .set({
        hour: parseInt(formData.startTime.split(':')[0]),
        minute: parseInt(formData.startTime.split(':')[1]),
        second: 0
      })
      .toDate();
      
    const endDateTime = moment(formData.date)
      .set({
        hour: parseInt(formData.endTime.split(':')[0]),
        minute: parseInt(formData.endTime.split(':')[1]),
        second: 0
      })
      .toDate();
    
    // Check if the selected time slot is still available
    const isSlotAvailable = availableTimeSlots.some(
      slot => 
        slot.start.getTime() === startDateTime.getTime() && 
        slot.end.getTime() === endDateTime.getTime()
    );
    
    if (!isSlotAvailable) {
      alert('This time slot is no longer available. Please select another time.');
      await fetchAvailableSlots(formData.date);
      return;
    }
      
    try {
      const result = await createAppointment({
        title: formData.title,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        status: 'pending',
        notes: formData.notes,
        client_id: user.id
      });
      
      if (result) {
        setFormData({
          title: '',
          date: new Date(),
          startTime: '09:00',
          endTime: '09:30',
          notes: ''
        });
        setShowAppointmentForm(false);
        setSelectedDate(null);
        setAvailableTimeSlots([]);
        
        alert('Appointment created successfully! It will be pending until confirmed by an administrator.');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create appointment');
    }
  }, [user, formData, createAppointment, availableTimeSlots, fetchAvailableSlots]);

  // Transform available time slots into select options
  const availableStartTimeOptions = useMemo(() => {
    if (!availableTimeSlots.length) return [];
    
    return availableTimeSlots.map(slot => ({
      value: moment(slot.start).format('HH:mm'),
      label: moment(slot.start).format('h:mm A'),
      disabled: false
    }));
  }, [availableTimeSlots]);

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
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Book an Appointment</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Select a date on the calendar to book your appointment. Available time slots respect a 2-hour buffer between appointments.
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
          selectable
          onSelectSlot={handleSelectSlot}
          defaultView={Views.MONTH}
          views={['month', 'week', 'day']}
          components={{
            event: EventComponent
          }}
          className="bg-white dark:bg-gray-800 rounded-md overflow-hidden"
        />
      </div>
      
      {showAppointmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Book Appointment</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              {selectedDate && `Selected Date: ${moment(selectedDate).format('MMMM D, YYYY')}`}
            </p>
            
            {loadingSlots ? (
              <div className="flex justify-center items-center h-24">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-300">Loading available time slots...</span>
              </div>
            ) : availableTimeSlots.length === 0 ? (
              <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-200 rounded-md mb-4">
                <p className="font-medium">No available time slots on this date.</p>
                <p className="text-sm mt-1">Please select another date or check back later.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="title">
                    Appointment Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="startTime">
                    Available Time Slots
                  </label>
                  <select
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                    required
                  >
                    {availableStartTimeOptions.map(option => (
                      <option key={`start-${option.value}`} value={option.value} disabled={option.disabled}>
                        {option.label} - {moment(option.value, 'HH:mm').add(30, 'minutes').format('h:mm A')}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    All appointments are 30 minutes long
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="notes">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
                  >
                    Book Appointment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
        <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">Your Upcoming Appointments</h3>
        {appointments.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">You have no upcoming appointments.</p>
        ) : (
          <div className="space-y-3">
            {appointments.filter(a => a.status !== 'cancelled' && a.status !== 'completed').map(appointment => (
              <div 
                key={appointment.id} 
                className={cn(
                  "p-3 rounded-md border-l-4",
                  appointment.status === 'pending' ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" : 
                  appointment.status === 'confirmed' ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : 
                  "border-gray-500 bg-gray-50 dark:bg-gray-900/20"
                )}
              >
                <h4 className="font-bold text-gray-800 dark:text-white">{appointment.title}</h4>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p><span className="font-medium">Date:</span> {moment(appointment.start_time).format('MMM D, YYYY')}</p>
                  <p><span className="font-medium">Time:</span> {moment(appointment.start_time).format('h:mm A')} - {moment(appointment.end_time).format('h:mm A')}</p>
                  <p><span className="font-medium">Status:</span> {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientCalendar; 