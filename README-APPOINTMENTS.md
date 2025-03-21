# Appointment System

This extension adds a role-based appointment system to the Todo Master application, allowing clients to book appointments and administrators to manage appointments, analyze booking data, and add notes to appointments.

## Features

- **Role-based system** with two roles: Administrator and Client
- **Client features**:
  - Calendar for booking appointments
  - Management of their own appointments (create, update, delete)
  - View appointment status (pending, confirmed, completed, cancelled)
- **Administrator features**:
  - Calendar displaying all booked appointments
  - Dashboard with analytics (total appointments, completion rates, etc.)
  - Ability to make notes on appointments
  - Manage appointment status
  - View client profiles

## Setup

### 1. Install Dependencies

The appointment system requires additional packages:

```bash
npm install chart.js react-chartjs-2 react-big-calendar moment @types/react-big-calendar @types/moment
```

### 2. Set Up Database Schema

Execute the SQL schema in `src/db/schema.sql` in your Supabase project. This file creates:
- `appointments` table
- `appointment_notes` table
- `client_profiles` table
- `user_roles` table
- Row-level security policies
- Triggers and indexes

### 3. Set Up Initial Admin User

The first user registered can be made an admin. After registering, manually update their role:

```sql
INSERT INTO user_roles (user_id, role) 
VALUES ('[USER_ID]', 'admin');
```

Replace `[USER_ID]` with the actual user ID from the auth.users table.

### 4. Configure New Users

New users are automatically assigned the 'client' role by the authentication system. To make a user an admin:

```sql
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = '[USER_ID]';
```

## Usage

### Client Workflow

1. Sign up or log in to the application
2. Navigate to "Appointments" in the navigation menu
3. Use the calendar interface to book a new appointment:
   - Select a date and time slot
   - Fill in appointment details
   - Submit the booking
4. View your upcoming appointments
5. Manage (modify/cancel) pending appointments

### Administrator Workflow

1. Sign in with an administrator account
2. Navigate to "Appointments" in the navigation menu
3. View the admin dashboard with analytics:
   - Total appointment metrics
   - Completion rates
   - Appointment trends over time
   - Top clients
4. Use the calendar to:
   - View all scheduled appointments
   - Update appointment status
   - Add notes to appointments
   - Manage the appointment schedule

## Component Structure

- **Context**:
  - `AuthContext.tsx` - Extended with role management
- **Types**:
  - `appointments.ts` - Type definitions for appointments
- **Hooks**:
  - `useAppointments.ts` - Hook for appointment operations
  - `useAnalytics.ts` - Hook for appointment analytics
- **Components**:
  - `client/ClientCalendar.tsx` - Calendar for clients
  - `admin/AdminCalendar.tsx` - Calendar for administrators
  - `admin/AdminDashboard.tsx` - Analytics dashboard
- **Pages**:
  - `CalendarPage.tsx` - Role-based page that renders appropriate components

## Security

The appointment system implements row-level security in the database:
- Clients can only view and manage their own appointments
- Only administrators can view all appointments and add notes
- Permission checks are implemented at both the database and application levels

## Troubleshooting

### Common Issues

1. **Missing Type Definitions**: Ensure you've installed all type packages
2. **Database Permission Errors**: Make sure the RLS policies are correctly set up
3. **Role Issues**: Verify user roles are correctly assigned in the database

### Support

For further assistance, contact the development team or refer to the API documentation. 