import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { cn } from '../utils/cn';

type FormState = 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD';

interface AuthFormProps {
  onLoginSuccess?: () => void;
  onSignupSuccess?: () => void;
}

export default function AuthForm({ onLoginSuccess, onSignupSuccess }: AuthFormProps) {
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
        
        // Call the onLoginSuccess callback to redirect the user
        if (onLoginSuccess) {
          // Short delay to show the success message before redirecting
          setTimeout(() => {
            onLoginSuccess();
          }, 500);
        }
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
        
        // For auto-login after signup
        if (data.user && !data.user.identities?.some(identity => identity?.identity_data?.email_verified === 'false')) {
          // Email is already verified or email verification is not required
          setMessage({ 
            text: 'Registration successful! Logging you in...',
            type: 'success'
          });
          
          // Auto-login the user
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (loginError) {
            console.error('Auto-login after signup error:', loginError);
          } else if (onSignupSuccess) {
            // Short delay to show the success message before redirecting
            setTimeout(() => {
              onSignupSuccess();
            }, 500);
          }
        } else {
          // Email verification is required
          setMessage({ 
            text: 'Registration successful! Check your email for confirmation.',
            type: 'success'
          });
        }
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
    <div className="w-full">
      {message && (
        <div className={cn(
          "mb-6 p-4 rounded-md text-sm",
          message.type === 'error' 
            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200"
            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200"
        )}>
          <p>{message.text}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label 
            htmlFor="email" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={cn(
              "w-full px-4 py-3 border rounded-lg",
              "border-gray-300 dark:border-gray-600",
              "bg-white dark:bg-gray-700",
              "text-gray-900 dark:text-gray-100",
              "placeholder-gray-400 dark:placeholder-gray-500",
              "focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              "transition-colors duration-200"
            )}
            placeholder="your.email@example.com"
          />
        </div>
        
        {formState !== 'FORGOT_PASSWORD' && (
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
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
                "w-full px-4 py-3 border rounded-lg",
                "border-gray-300 dark:border-gray-600",
                "bg-white dark:bg-gray-700",
                "text-gray-900 dark:text-gray-100",
                "placeholder-gray-400 dark:placeholder-gray-500",
                "focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                "transition-colors duration-200"
              )}
              placeholder={formState === 'SIGNUP' ? 'Create a password' : 'Enter your password'}
            />
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full px-4 py-3 font-medium rounded-lg",
            "bg-primary-600 hover:bg-primary-700",
            "text-white",
            "transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
            loading && "opacity-70 cursor-not-allowed"
          )}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : (
            <span>
              {formState === 'LOGIN' ? 'Sign In' : 
               formState === 'SIGNUP' ? 'Create Account' : 
               'Send Reset Link'}
            </span>
          )}
        </button>
      </form>

      {debugInfo && (
        <div className="mt-6 p-3 text-xs bg-gray-100 dark:bg-gray-800 rounded-md">
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
      
      <div className="mt-6 text-center">
        {formState === 'LOGIN' ? (
          <>
            <button
              type="button"
              onClick={() => setFormState('FORGOT_PASSWORD')}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Forgot password?
            </button>
            <div className="mt-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Don't have an account? </span>
              <button
                type="button"
                onClick={() => setFormState('SIGNUP')}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                Sign up
              </button>
            </div>
          </>
        ) : formState === 'SIGNUP' ? (
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Already have an account? </span>
            <button
              type="button"
              onClick={() => setFormState('LOGIN')}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              Sign in
            </button>
          </div>
        ) : (
          <div>
            <button
              type="button"
              onClick={() => setFormState('LOGIN')}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              Back to login
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          By continuing, you agree to Todo Master's <a href="#" className="underline hover:text-gray-700 dark:hover:text-gray-300">Terms of Service</a> and <a href="#" className="underline hover:text-gray-700 dark:hover:text-gray-300">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
} 