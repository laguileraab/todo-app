import { useState, useEffect } from 'react';
import { cn } from '../utils/cn';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import Changelog from './Changelog';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isButton?: boolean;
  onClick?: () => void;
}

const NavLink = ({ href, children, isButton = false, onClick }: NavLinkProps) => {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick();
      }}
      className={cn(
        "font-medium transition-colors duration-300 px-4 py-2 rounded-md",
        isButton
          ? "bg-primary-600 hover:bg-primary-700 text-white"
          : "hover:text-primary-600 dark:hover:text-primary-400"
      )}
    >
      {children}
    </a>
  );
};

interface NavigationProps {
  setActivePage: (page: string) => void;
}

const Navigation = ({ setActivePage }: NavigationProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  
  // Track scroll position to change navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Close mobile menu when a link is clicked
  const handleNavLinkClick = (page: string) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-4 md:px-8",
        isScrolled || mobileMenuOpen
          ? "bg-white dark:bg-gray-900 shadow-md" 
          : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <a 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleNavLinkClick('home');
            }}
            className="text-xl font-bold flex items-center"
          >
            <span className="text-primary-600 dark:text-primary-400">Todo</span>
            <span className="ml-1">Master</span>
          </a>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLink href="#" onClick={() => handleNavLinkClick('home')}>Home</NavLink>
            <NavLink href="#features" onClick={() => handleNavLinkClick('features')}>Features</NavLink>
            <NavLink href="#pricing" onClick={() => handleNavLinkClick('pricing')}>Pricing</NavLink>
            <NavLink href="#about" onClick={() => handleNavLinkClick('about')}>About Us</NavLink>
            <NavLink href="#changelog" onClick={() => setShowChangelog(true)}>Changelog</NavLink>
            
            <div className="mx-4">
              <ThemeToggle />
            </div>

            {user ? (
              <>
                <NavLink 
                  href="#dashboard" 
                  onClick={() => handleNavLinkClick('dashboard')}
                >
                  Dashboard
                </NavLink>
                <NavLink 
                  href="#" 
                  isButton 
                  onClick={() => {
                    signOut();
                    handleNavLinkClick('home');
                  }}
                >
                  Sign Out
                </NavLink>
              </>
            ) : (
              <>
                <NavLink 
                  href="#login" 
                  onClick={() => handleNavLinkClick('login')}
                >
                  Log In
                </NavLink>
                <NavLink 
                  href="#signup" 
                  isButton 
                  onClick={() => handleNavLinkClick('signup')}
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="flex items-center md:hidden">
            <div className="mr-4">
              <ThemeToggle />
            </div>
            <button 
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle mobile menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              ) : (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-2 mt-4 px-4">
              <NavLink href="#" onClick={() => handleNavLinkClick('home')}>Home</NavLink>
              <NavLink href="#features" onClick={() => handleNavLinkClick('features')}>Features</NavLink>
              <NavLink href="#pricing" onClick={() => handleNavLinkClick('pricing')}>Pricing</NavLink>
              <NavLink href="#about" onClick={() => handleNavLinkClick('about')}>About Us</NavLink>
              <NavLink href="#changelog" onClick={() => {
                setShowChangelog(true);
                setMobileMenuOpen(false);
              }}>Changelog</NavLink>
              
              {user ? (
                <>
                  <NavLink 
                    href="#dashboard" 
                    onClick={() => handleNavLinkClick('dashboard')}
                  >
                    Dashboard
                  </NavLink>
                  <NavLink 
                    href="#" 
                    isButton 
                    onClick={() => {
                      signOut();
                      handleNavLinkClick('home');
                    }}
                  >
                    Sign Out
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink 
                    href="#login" 
                    onClick={() => handleNavLinkClick('login')}
                  >
                    Log In
                  </NavLink>
                  <NavLink 
                    href="#signup" 
                    isButton 
                    onClick={() => handleNavLinkClick('signup')}
                  >
                    Sign Up
                  </NavLink>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Changelog Modal */}
      <Changelog onClose={() => setShowChangelog(false)} isOpen={showChangelog} />
    </>
  );
};

export default Navigation; 