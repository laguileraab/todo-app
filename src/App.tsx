import { useState, useEffect, useCallback, memo } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import TodoList from './components/Todo'
import Auth from './components/Auth'
import Navigation from './components/Navigation'
import LandingPage from './components/LandingPage'
import { cn } from './utils/cn'
import { AuthProvider, useAuth } from './context/AuthContext'
import { UserProfile } from './components/UserProfile'
import Changelog from './components/Changelog'
import CalendarPage from './pages/CalendarPage'

interface LogoLinkProps {
  href: string;
  imgSrc: string;
  altText: string;
  className?: string;
  isReactLogo?: boolean;
}

// Memoize LogoLink component
const LogoLink = memo(({ href, imgSrc, altText, className, isReactLogo }: LogoLinkProps) => (
  <a
    href={href}
    className={cn(
      "p-6",
      "rounded-xl",
      "bg-white dark:bg-gray-800",
      "shadow-lg hover:shadow-xl",
      "transition-all duration-300",
      "hover:scale-105",
      className
    )}
    target="_blank"
    rel="noopener noreferrer"
  >
    <img
      src={imgSrc}
      alt={altText}
      className={cn(
        "h-24 w-auto",
        isReactLogo ? "animate-spin-slow" : "hover:drop-shadow-xl transition-all duration-300"
      )}
    />
  </a>
));

function Dashboard() {
  const { user } = useAuth();
  const [count, setCount] = useState(0)

  function incrementCount() {
    setCount(count => count + 1)
  }

  return (
    <main className={cn(
      "min-h-screen flex flex-col items-center justify-center p-4 transition-colors pt-20",
      "bg-gradient-to-r from-primary-500 to-purple-600 dark:from-primary-900 dark:to-purple-900"
    )}>
      <div className={cn(
        "p-8 rounded-lg shadow-xl max-w-md w-full mb-8 transition-colors",
        "bg-white dark:bg-gray-800"
      )}>
        <div className="flex justify-center items-center space-x-8 mb-8">
          <LogoLink
            href="https://vitejs.dev"
            imgSrc={viteLogo}
            altText="Vite logo"
          />
          <LogoLink
            href="https://react.dev"
            imgSrc={reactLogo}
            altText="React logo"
            isReactLogo={true}
          />
        </div>
        
        <h1 className={cn(
          "text-3xl font-bold text-center mb-4 transition-colors",
          "text-gray-800 dark:text-white"
        )}>
          Todo App Dashboard
        </h1>
        
        {user && (
          <div className="mb-4">
            <UserProfile />
          </div>
        )}
        
        <div className={cn(
          "p-4 rounded-md mb-6 transition-colors",
          "bg-gray-100 dark:bg-gray-700"
        )}>
          <button 
            onClick={incrementCount}
            className={cn(
              "w-full py-2 rounded-md mb-4 font-bold transition-colors",
              "bg-primary-600 hover:bg-primary-700 text-white"
            )}
            aria-label="Increment counter"
          >
            Count is {count}
          </button>
          
          <p className={cn(
            "text-center transition-colors",
            "text-gray-600 dark:text-gray-300"
          )}>
            Built with <code className={cn(
              "px-1 rounded text-sm font-mono transition-colors",
              "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100"
            )}>Supabase + React</code>
          </p>
        </div>
      </div>
      
      <TodoList />
    </main>
  )
}

// Memoize AppContent component
const AppContent = memo(() => {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('home');
  const [showChangelog, setShowChangelog] = useState(false);

  const handleCloseChangelog = useCallback(() => {
    setShowChangelog(false);
  }, []);

  const handleShowChangelog = useCallback(() => {
    setShowChangelog(true);
  }, []);

  // Helper function to determine which page to show
  const getPageContent = () => {
    // If user is logged in and activePage is dashboard, show dashboard
    if (user && (activePage === 'dashboard' || activePage === 'app')) {
      return <Dashboard />;
    }
    
    // Calendar page for appointments
    if (user && activePage === 'appointments') {
      return <CalendarPage />;
    }
    
    // If user is not logged in and tries to access dashboard/app or appointments
    if (!user && (activePage === 'dashboard' || activePage === 'app' || activePage === 'appointments')) {
      setActivePage('login');
    }
    
    // Show auth form for login/signup
    if (activePage === 'login' || activePage === 'signup') {
      return (
        <div className="min-h-screen pt-20 flex items-center justify-center bg-gradient-to-r from-primary-500 to-purple-600 dark:from-primary-900 dark:to-purple-900">
          <Auth 
            onLoginSuccess={() => setActivePage('dashboard')}
            onSignupSuccess={() => setActivePage('dashboard')}
          />
        </div>
      );
    }
    
    // Show landing page for all other cases
    return <LandingPage setActivePage={setActivePage} activePage={activePage} onShowChangelog={handleShowChangelog} />;
  };

  // React to auth state changes
  useEffect(() => {
    if (user) {
      // If user logs in or signs up, redirect to dashboard
      if (activePage === 'login' || activePage === 'signup') {
        setActivePage('dashboard');
      }
    }
  }, [user, activePage]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation setActivePage={setActivePage} onShowChangelog={handleShowChangelog} />
      
      <main className="container mx-auto px-4 py-8">
        {getPageContent()}
      </main>

      <Changelog isOpen={showChangelog} onClose={handleCloseChangelog} />
    </div>
  );
});

// Memoize App component
const App = memo(() => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
});

export default App;
