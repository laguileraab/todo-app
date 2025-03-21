import { useState, useEffect } from 'react';
import { cn } from '../utils/cn';
import AuthForm from './AuthForm';

interface AuthProps {
  onLoginSuccess?: () => void;
  onSignupSuccess?: () => void;
}

export default function Auth({ onLoginSuccess, onSignupSuccess }: AuthProps) {
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    // Test the Supabase API connection
    const testDirectApiConnection = async () => {
      setLoading(true);
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
        
        // Check if we have valid environment variables
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Missing Supabase URL or API key in environment variables');
        }
        
        console.log('Testing Supabase connection...');
        console.log(`URL Length: ${supabaseUrl.length}, KEY Length: ${supabaseKey.length}`);
        console.log(`KEY first 10 chars: ${supabaseKey.substring(0, 10)}...`);
        
        // Test connection to Supabase health endpoint
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Prefer': 'return=minimal' 
          }
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to connect to Supabase API: ${response.status} - ${errorText}`);
        }
        
        setApiStatus('success');
      } catch (error) {
        console.error('API Connection error:', error);
        setApiStatus('error');
        setApiError(error instanceof Error ? error.message : 'Unknown error connecting to Supabase');
      } finally {
        setLoading(false);
      }
    };
    
    testDirectApiConnection();
  }, []);

  return (
    <div className={cn(
      "flex flex-col items-center justify-center",
      "p-8 bg-white dark:bg-gray-800",
      "rounded-xl shadow-xl",
      "w-full max-w-md mx-auto transition-all"
    )}>
      <div className="w-full mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          Welcome Back
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Sign in to access your tasks and stay productive
        </p>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-8 w-full">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Testing API connection...</p>
        </div>
      ) : apiStatus === 'error' ? (
        <div className="w-full mb-6">
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200 p-4 rounded-md">
            <h3 className="font-bold">API Connection Error</h3>
            <p className="text-sm">{apiError}</p>
            <p className="mt-2 text-sm">Please check your Supabase configuration in the environment variables.</p>
          </div>
        </div>
      ) : (
        <AuthForm 
          onLoginSuccess={onLoginSuccess}
          onSignupSuccess={onSignupSuccess}
        />
      )}
    </div>
  );
} 