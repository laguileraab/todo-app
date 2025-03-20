import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import TodoList from './components/Todo'
import Auth from './components/Auth'
import ThemeToggle from './components/ThemeToggle'
import { cn } from './utils/cn'
import { AuthProvider, useAuth } from './context/AuthContext'
import { UserProfile } from './components/UserProfile'

interface LogoLinkProps {
  href: string;
  imgSrc: string;
  altText: string;
  className?: string;
  isReactLogo?: boolean;
}

function LogoLink({ href, imgSrc, altText, className = '', isReactLogo = false }: LogoLinkProps) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer"
      className="hover:scale-110 transition-transform duration-300"
    >
      <img 
        src={imgSrc} 
        className={cn(
          "h-16 w-16 logo", 
          isReactLogo && "react",
          className
        )} 
        alt={altText} 
      />
    </a>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [count, setCount] = useState(0)

  function incrementCount() {
    setCount(count => count + 1)
  }

  return (
    <main className={cn(
      "min-h-screen flex flex-col items-center justify-center p-4 transition-colors",
      "bg-gradient-to-r from-primary-500 to-purple-600 dark:from-primary-900 dark:to-purple-900"
    )}>
      <ThemeToggle />
      
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
          Todo App with Supabase
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
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary-500 rounded-full border-t-transparent"></div>
        </div>
      ) : user ? (
        <TodoList />
      ) : (
        <Auth />
      )}
    </main>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
