-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Appointment Notes Table
CREATE TABLE IF NOT EXISTS appointment_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Client Profiles Table
CREATE TABLE IF NOT EXISTS client_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_user_id UNIQUE (user_id)
);

-- User Roles Table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_user_role UNIQUE (user_id)
);

-- Row Level Security Policies

-- Enable Row Level Security on all tables
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Appointments Policies
CREATE POLICY "Clients can view their own appointments"
  ON appointments FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Admins can view all appointments"
  ON appointments FOR SELECT
  USING ((SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin');

CREATE POLICY "Clients can create their own appointments"
  ON appointments FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Admins can create appointments"
  ON appointments FOR INSERT
  WITH CHECK ((SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin');

CREATE POLICY "Clients can update their own appointments"
  ON appointments FOR UPDATE
  USING (client_id = auth.uid());

CREATE POLICY "Admins can update all appointments"
  ON appointments FOR UPDATE
  USING ((SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin');

CREATE POLICY "Clients can delete their own appointments"
  ON appointments FOR DELETE
  USING (client_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can delete all appointments"
  ON appointments FOR DELETE
  USING ((SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin');

-- Appointment Notes Policies
CREATE POLICY "Users can view notes for their own appointments"
  ON appointment_notes FOR SELECT
  USING (
    (appointment_id IN (SELECT id FROM appointments WHERE client_id = auth.uid())) OR
    ((SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin')
  );

CREATE POLICY "Only admins can create appointment notes"
  ON appointment_notes FOR INSERT
  WITH CHECK ((SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin');

CREATE POLICY "Only admins can update appointment notes"
  ON appointment_notes FOR UPDATE
  USING ((SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin');

CREATE POLICY "Only admins can delete appointment notes"
  ON appointment_notes FOR DELETE
  USING ((SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin');

-- Client Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON client_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all client profiles"
  ON client_profiles FOR SELECT
  USING ((SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin');

CREATE POLICY "Users can update their own profile"
  ON client_profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON client_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- User Roles Policies
CREATE POLICY "Users can view their own role"
  ON user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
  ON user_roles FOR SELECT
  USING ((SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin');

CREATE POLICY "Only admins can update roles"
  ON user_roles FOR UPDATE
  USING ((SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin');

CREATE POLICY "Only admins can create roles"
  ON user_roles FOR INSERT
  WITH CHECK ((SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin' OR 
    NOT EXISTS (SELECT 1 FROM user_roles) -- Allow the first user to create a role
  );

CREATE POLICY "Only admins can delete roles"
  ON user_roles FOR DELETE
  USING ((SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin');

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_appointments_modtime
BEFORE UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_appointment_notes_modtime
BEFORE UPDATE ON appointment_notes
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_client_profiles_modtime
BEFORE UPDATE ON client_profiles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_user_roles_modtime
BEFORE UPDATE ON user_roles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointment_notes_appointment_id ON appointment_notes(appointment_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON client_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role); 