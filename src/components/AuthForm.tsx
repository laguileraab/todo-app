import { useState, useCallback, memo, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { cn } from '../utils/cn';

type FormState = 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD';

interface AuthFormProps {
  onLoginSuccess?: () => void;
  onSignupSuccess?: () => void;
}

// Memoize input component
const Input = memo(({ 
  type, 
  value, 
  onChange, 
  placeholder, 
  className 
}: { 
  type: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  placeholder: string; 
  className?: string;
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={cn(
      "w-full px-4 py-2 rounded-lg border",
      "bg-white dark:bg-gray-800",
      "border-gray-300 dark:border-gray-700",
      "focus:ring-2 focus:ring-primary-500 focus:border-transparent",
      "dark:focus:ring-primary-400",
      className
    )}
  />
));

// Memoize button component
const Button = memo(({ 
  children, 
  onClick, 
  className 
}: { 
  children: React.ReactNode; 
  onClick: (e: React.FormEvent) => void; 
  className?: string;
}) => (
  <button
    type="submit"
    onClick={onClick}
    className={cn(
      "w-full px-4 py-2 rounded-lg",
      "bg-primary-500 hover:bg-primary-600",
      "text-white font-medium",
      "transition-colors duration-200",
      className
    )}
  >
    {children}
  </button>
));

const AuthForm = ({ onLoginSuccess, onSignupSuccess }: AuthFormProps) => {
  const [formState, setFormState] = useState<FormState>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Memoize handlers
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (formState === 'LOGIN') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLoginSuccess?.();
      } else if (formState === 'SIGNUP') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        onSignupSuccess?.();
      } else if (formState === 'FORGOT_PASSWORD') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [formState, email, password, onLoginSuccess, onSignupSuccess]);

  const handleFormStateChange = useCallback((newState: FormState) => {
    setFormState(newState);
    setError(null);
  }, []);

  // Memoize form content
  const formContent = useMemo(() => {
    switch (formState) {
      case 'LOGIN':
        return (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Email"
              />
              <Input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Password"
              />
              <Button onClick={handleSubmit}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                onClick={() => handleFormStateChange('SIGNUP')}
                className="text-primary-500 hover:text-primary-600"
              >
                Don't have an account? Sign up
              </button>
            </div>
          </>
        );
      case 'SIGNUP':
        return (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Email"
              />
              <Input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Password"
              />
              <Button onClick={handleSubmit}>
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                onClick={() => handleFormStateChange('LOGIN')}
                className="text-primary-500 hover:text-primary-600"
              >
                Already have an account? Sign in
              </button>
            </div>
          </>
        );
      case 'FORGOT_PASSWORD':
        return (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Email"
              />
              <Button onClick={handleSubmit}>
                {loading ? 'Sending reset link...' : 'Send Reset Link'}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                onClick={() => handleFormStateChange('LOGIN')}
                className="text-primary-500 hover:text-primary-600"
              >
                Back to Sign In
              </button>
            </div>
          </>
        );
    }
  }, [formState, email, password, loading, handleEmailChange, handlePasswordChange, handleSubmit, handleFormStateChange]);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}
      {formContent}
    </div>
  );
};

export default memo(AuthForm); 