import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { cn } from '../utils/cn';

type FormState = 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formState, setFormState] = useState<FormState>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setDebugInfo(null);
    
    try {
      if (formState === 'LOGIN') {
        // Direct API call to login
        console.log('Attempting login with direct API call...');
        
        // First, verify the Supabase URL and API key
        const url = import.meta.env.VITE_SUPABASE_URL as string;
        const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
        
        setDebugInfo(`Using URL: ${url}\nAPI Key (first 10 chars): ${apiKey.substring(0, 10)}...`);
        
        // Attempt login with Supabase client
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        // Log detail for debugging
        console.log('Login attempt complete:', { data, error });
        
        if (error) {
          console.error('Login error:', error);
          throw error;
        }
        
        setMessage({ text: 'Logged in successfully!', type: 'success' });
      } else if (formState === 'SIGNUP') {
        // Direct API call to signup
        console.log('Attempting signup with direct API call...');
        
        // Try raw fetch first to debug possible issues
        setDebugInfo('Attempting raw signup API call for debugging...');
        
        try {
          const url = import.meta.env.VITE_SUPABASE_URL as string;
          const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
          
          const response = await fetch(`${url}/auth/v1/signup`, {
            method: 'POST',
            headers: {
              'apikey': apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              email, 
              password,
              data: { // Optional custom data
                registered_at: new Date().toISOString()
              }
            })
          });
          
          const responseData = await response.json();
          
          setDebugInfo(prev => `${prev || ''}\n\nRaw API Response Status: ${response.status}\n${JSON.stringify(responseData, null, 2)}`);
          
          if (!response.ok) {
            console.error('Raw signup API error:', responseData);
          }
        } catch (rawError) {
          console.error('Raw signup API exception:', rawError);
          setDebugInfo(prev => `${prev || ''}\n\nRaw API Error: ${rawError instanceof Error ? rawError.message : 'Unknown error'}`);
        }
        
        // Now attempt using the Supabase client
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              registered_at: new Date().toISOString()
            }
          }
        });
        
        console.log('Signup attempt complete:', { data, error });
        
        if (error) {
          console.error('Signup error:', error);
          throw error;
        }
        
        setMessage({ 
          text: 'Registration successful! Check your email for confirmation.',
          type: 'success'
        });
      } else if (formState === 'FORGOT_PASSWORD') {
        // Direct API call for password reset
        console.log('Attempting password reset with direct API call...');
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        
        if (error) {
          console.error('Password reset error:', error);
          throw error;
        }
        
        setMessage({ 
          text: 'Password reset email sent. Check your inbox.',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : 'An unexpected error occurred',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {formState === 'LOGIN' ? 'Login' : 
         formState === 'SIGNUP' ? 'Sign Up' : 
         'Reset Password'}
      </h2>
      
      {message && (
        <div className={cn(
          "mb-4 p-3 rounded-md",
          message.type === 'error' 
            ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
            : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
        )}>
          <p>{message.text}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="email" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={cn(
              "w-full px-3 py-2 border rounded-md",
              "border-gray-300 dark:border-gray-700",
              "bg-white dark:bg-gray-800",
              "text-gray-900 dark:text-gray-100",
              "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            )}
          />
        </div>
        
        {formState !== 'FORGOT_PASSWORD' && (
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={cn(
                "w-full px-3 py-2 border rounded-md",
                "border-gray-300 dark:border-gray-700",
                "bg-white dark:bg-gray-800",
                "text-gray-900 dark:text-gray-100",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              )}
            />
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full px-4 py-2 text-sm font-medium rounded-md",
            "bg-blue-600 hover:bg-blue-700",
            "text-white",
            "transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            loading && "opacity-70 cursor-not-allowed"
          )}
        >
          {loading ? (
            <span>Loading...</span>
          ) : (
            <span>
              {formState === 'LOGIN' ? 'Sign In' : 
               formState === 'SIGNUP' ? 'Sign Up' : 
               'Send Reset Link'}
            </span>
          )}
        </button>
      </form>

      {debugInfo && (
        <div className="mt-4 p-3 text-xs bg-gray-100 dark:bg-gray-800 rounded-md">
          <details>
            <summary className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              Debug Information
            </summary>
            <pre className="mt-2 whitespace-pre-wrap text-gray-600 dark:text-gray-400">
              {debugInfo}
            </pre>
          </details>
        </div>
      )}
      
      <div className="mt-4 text-center">
        {formState === 'LOGIN' ? (
          <>
            <button
              type="button"
              onClick={() => setFormState('FORGOT_PASSWORD')}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Forgot password?
            </button>
            <div className="mt-2">
              <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
              <button
                type="button"
                onClick={() => setFormState('SIGNUP')}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign up
              </button>
            </div>
          </>
        ) : formState === 'SIGNUP' ? (
          <div>
            <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
            <button
              type="button"
              onClick={() => setFormState('LOGIN')}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Log in
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setFormState('LOGIN')}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Back to login
          </button>
        )}
      </div>
    </div>
  );
} 