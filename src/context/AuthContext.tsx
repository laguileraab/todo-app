import { createContext, useState, useEffect, useContext, ReactNode, useCallback, useMemo } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Define user roles
export type UserRole = 'admin' | 'client';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateUserRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user role from database
  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }

      if (data) {
        setUserRole(data.role as UserRole);
      } else {
        // Default to client role if no profile exists
        setUserRole('client');
        // Create user profile with default role
        await supabase.from('user_profiles').upsert({
          user_id: userId,
          role: 'client',
          created_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
    }
  }, []);

  // Update user role
  const updateUserRole = useCallback(async (role: UserRole) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          role,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating user role:', error);
        return;
      }

      setUserRole(role);
    } catch (error) {
      console.error('Error in updateUserRole:', error);
    }
  }, [user]);

  // Memoize signOut callback
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUserRole(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchUserRole(session.user.id);
        }
        
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchUserRole(session.user.id);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserRole]);

  // Memoize context value
  const value = useMemo(() => ({
    session,
    user,
    userRole,
    loading,
    signOut,
    updateUserRole
  }), [session, user, userRole, loading, signOut, updateUserRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Memoize useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 