import { createClient } from '@supabase/supabase-js';

// Get environment variables, trim whitespace to avoid common issues
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string)?.trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string)?.trim();

// Debug logs
console.log(`[Supabase] Loading environment variables - URL length: ${supabaseUrl?.length || 0}, Key length: ${supabaseAnonKey?.length || 0}`);

// Validate API key format
if (supabaseAnonKey) {
  // API key should be a valid JWT token format (has 3 parts separated by dots)
  const parts = supabaseAnonKey.split('.');
  
  if (parts.length !== 3) {
    console.error('[Supabase] Invalid API key format - API key should have 3 segments separated by dots');
  } else {
    try {
      // Decode second part (payload) to check role and reference
      const payload = JSON.parse(atob(parts[1]));
      console.log('[Supabase] API key validation - Role:', payload.role);
      
      // Anon key should have role 'anon'
      if (payload.role !== 'anon') {
        console.warn('[Supabase] API key may not be an anonymous key. Role is:', payload.role);
      }
    } catch (e) {
      console.error('[Supabase] Error decoding API key payload:', e);
    }
  }
  
  // Only show first and last few characters of the key for debugging
  const firstChars = supabaseAnonKey.substring(0, 8);
  const lastChars = supabaseAnonKey.substring(supabaseAnonKey.length - 5);
  console.log(`[Supabase] Using API key: ${firstChars}...${lastChars}`);
} else {
  console.error('[Supabase] No API key found in environment variables');
}

// Throw error if URL or key is missing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or API key. Please check your environment variables.');
}

// Type definition for Todo
export type Todo = {
  id: number;         // Changed from string to number to match the SERIAL PRIMARY KEY in the database
  user_id: string;
  text: string;
  completed: boolean;
  created_at: string;
  position?: number;  // Added position field for sorting with drag and drop
};

// Create the Supabase client with better error handling and real-time enabled
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    },
    headers: {
      apikey: supabaseAnonKey
    }
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js@latest'
    }
  }
});

// Test the client with a simple query to see if it works
const testSupabaseClient = async () => {
  try {
    console.log('[Supabase] Testing connection...');
    const { data, error } = await supabase
      .from('todos')
      .select('count', { count: 'exact', head: true })
      .limit(0);
      
    if (error) {
      console.error('[Supabase] Connection test failed:', error);
      if (error.code === '42P01') {
        console.error('[Supabase] Error suggests the "todos" table does not exist. Please check your database setup.');
      } else if (error.code === '42501') {
        console.error('[Supabase] Permission denied. This could be due to RLS (Row Level Security) policies.');
      }
    } else {
      console.log('[Supabase] Connection test successful');
    }

    // Test real-time connection
    console.log('[Supabase] Testing real-time connection...');
    const realtimeChannel = supabase.channel('test-channel');
    
    realtimeChannel
      .on('system', { event: '*' }, (payload) => {
        console.log('[Supabase] Real-time system event:', payload);
      })
      .on('presence', { event: '*' }, (payload) => {
        console.log('[Supabase] Real-time presence event:', payload);
      })
      .subscribe((status, err) => {
        console.log(`[Supabase] Real-time status: ${status}`, err || '');
        
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase] Real-time connection successful');
          // Test subscribe to todos table
          const todosChannel = supabase.channel('todos-test')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'todos' },
              (payload) => {
                console.log('[Supabase] Received real-time todos event:', payload);
              }
            )
            .subscribe((todosStatus) => {
              console.log(`[Supabase] Todos real-time status: ${todosStatus}`);
              
              // Unsubscribe after successful test
              setTimeout(() => {
                console.log('[Supabase] Cleaning up test channels');
                todosChannel.unsubscribe();
                realtimeChannel.unsubscribe();
                supabase.removeChannel(todosChannel);
                supabase.removeChannel(realtimeChannel);
              }, 5000);
            });
        }
      });
    
  } catch (e) {
    console.error('[Supabase] Error testing connection:', e);
  }
};

// Get current user with error handling
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('[Supabase] Error getting current user:', error);
      return null;
    }
    console.log('[Supabase] Current user retrieved:', data?.user?.id || 'No user');
    return data?.user || null;
  } catch (e) {
    console.error('[Supabase] Exception getting current user:', e);
    return null;
  }
};

// Run the test
testSupabaseClient();

export default supabase; 