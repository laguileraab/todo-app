import { useState, useEffect, useCallback, memo } from 'react';
import { cn } from '../utils/cn';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import Changelog from './Changelog';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isButton?: boolean;
  onClick?: () => void;
  isScrolled?: boolean;
}

// Memoize NavLink component
const NavLink = memo(({ href, children, isButton, onClick, isScrolled = false }: NavLinkProps) => (
  <a
    href={href}
    onClick={(e) => {
      e.preventDefault();
      onClick?.();
    }}
    className={cn(
      "px-4 py-2 rounded-md text-sm font-medium",
      "transition-all duration-300 ease-in-out",
      "transform hover:scale-105 active:scale-95",
      isButton
        ? cn(
            isScrolled 
              ? "bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white"
              : "bg-gradient-to-r from-primary-600 to-primary-700 text-white dark:from-primary-500 dark:to-primary-600",
            "shadow-md",
            "hover:shadow-lg hover:from-primary-600 hover:to-primary-700",
            "dark:hover:from-primary-500 dark:hover:to-primary-600",
            "border border-primary-400 dark:border-primary-500",
            "active:from-primary-700 active:to-primary-800"
          )
        : cn(
            isScrolled 
              ? "text-white hover:text-white hover:bg-white/10" 
              : cn(
                  "text-gray-800 dark:text-gray-200",
                  "hover:text-primary-600 dark:hover:text-primary-400",
                  "hover:bg-gray-100 dark:hover:bg-gray-800/50",
                  "active:bg-gray-200 dark:active:bg-gray-700/50"
                )
          )
    )}
  >
    {children}
  </a>
));

interface NavigationProps {
  setActivePage: (page: string) => void;
  onShowChangelog: () => void;
}

const Navigation = ({ setActivePage, onShowChangelog }: NavigationProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  // Memoize scroll handler
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 10);
  }, []);

  // Memoize resize handler
  const handleResize = useCallback(() => {
    if (window.innerWidth >= 768 && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [mobileMenuOpen]);

  // Track scroll position to change navbar background
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Close mobile menu when window is resized to desktop size
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Memoize navigation handlers
  const handleNavLinkClick = useCallback((page: string) => {
    if (page === 'todos') {
      window.location.hash = '#todos';
    } else if (page === 'profile') {
      window.location.hash = '#profile';
    }
    setActivePage(page);
    setMobileMenuOpen(false);
  }, [setActivePage]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    setMobileMenuOpen(false);
  }, [signOut]);

  // Memoize mobile menu toggle
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  // Memoize mobile menu icon
  const MobileMenuIcon = memo(({ isOpen }: { isOpen: boolean }) => (
    <svg
      className="h-6 w-6"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      {isOpen ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      )}
    </svg>
  ));

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "transition-all duration-300 ease-in-out",
        isScrolled
          ? "bg-gradient-to-r from-primary-500/95 to-purple-600/95 dark:from-primary-900/95 dark:to-purple-900/95 backdrop-blur-sm shadow-lg"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <a 
                href="/" 
                className={cn(
                  "text-xl font-bold",
                  "transition-all duration-300 ease-in-out",
                  "hover:scale-105 transform",
                  isScrolled ? "text-white" : "text-gray-900 dark:text-white"
                )}
              >
                Todo Master
              </a>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink href="#features" onClick={() => handleNavLinkClick('features')} isScrolled={isScrolled}>
                Features
              </NavLink>
              <NavLink href="#pricing" onClick={() => handleNavLinkClick('pricing')} isScrolled={isScrolled}>
                Pricing
              </NavLink>
              <NavLink href="#about" onClick={() => handleNavLinkClick('about')} isScrolled={isScrolled}>
                About Us
              </NavLink>
              <NavLink href="#changelog" onClick={onShowChangelog} isScrolled={isScrolled}>
                Changelog
              </NavLink>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <div className="transition-transform duration-300 ease-in-out hover:scale-105">
              <ThemeToggle />
            </div>
            {user ? (
              <>
                <NavLink href="#todos" onClick={() => handleNavLinkClick('todos')} isScrolled={isScrolled}>
                  My Todos
                </NavLink>
                <NavLink href="#profile" onClick={() => handleNavLinkClick('profile')} isScrolled={isScrolled}>
                  Profile
                </NavLink>
                <NavLink href="#" onClick={handleSignOut} isButton isScrolled={isScrolled}>
                  Sign Out
                </NavLink>
              </>
            ) : (
              <NavLink href="#auth" onClick={() => handleNavLinkClick('auth')} isButton isScrolled={isScrolled}>
                Sign In
              </NavLink>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className={cn(
                "inline-flex items-center justify-center p-2 rounded-md",
                "transition-all duration-300 ease-in-out",
                "hover:scale-105 transform",
                isScrolled 
                  ? "text-white hover:bg-white/10" 
                  : "text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <span className="sr-only">Open main menu</span>
              <MobileMenuIcon isOpen={mobileMenuOpen} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "sm:hidden",
          "transition-all duration-300 ease-in-out transform",
          "fixed inset-0 top-16",
          mobileMenuOpen 
            ? "translate-y-0 opacity-100" 
            : "-translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className={cn(
          "h-full w-full",
          "pt-2 pb-3 space-y-1",
          isScrolled
            ? "bg-gradient-to-r from-primary-500/95 to-purple-600/95 dark:from-primary-900/95 dark:to-purple-900/95"
            : "bg-white dark:bg-gray-900",
          "backdrop-blur-sm shadow-lg"
        )}>
          <div className="px-4 space-y-1">
            <div className="flex items-center justify-center py-2">
              <ThemeToggle />
            </div>
            <NavLink href="#features" onClick={() => handleNavLinkClick('features')} isScrolled={isScrolled}>
              Features
            </NavLink>
            <NavLink href="#pricing" onClick={() => handleNavLinkClick('pricing')} isScrolled={isScrolled}>
              Pricing
            </NavLink>
            <NavLink href="#about" onClick={() => handleNavLinkClick('about')} isScrolled={isScrolled}>
              About Us
            </NavLink>
            <NavLink href="#changelog" onClick={() => {
              onShowChangelog();
              setMobileMenuOpen(false);
            }} isScrolled={isScrolled}>
              Changelog
            </NavLink>
            {user ? (
              <>
                <NavLink href="#todos" onClick={() => handleNavLinkClick('todos')} isScrolled={isScrolled}>
                  My Todos
                </NavLink>
                <NavLink href="#profile" onClick={() => handleNavLinkClick('profile')} isScrolled={isScrolled}>
                  Profile
                </NavLink>
                <NavLink href="#" onClick={handleSignOut} isButton isScrolled={isScrolled}>
                  Sign Out
                </NavLink>
              </>
            ) : (
              <NavLink href="#auth" onClick={() => handleNavLinkClick('auth')} isButton isScrolled={isScrolled}>
                Sign In
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default memo(Navigation); 