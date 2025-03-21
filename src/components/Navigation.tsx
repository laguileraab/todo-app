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
}

// Memoize NavLink component
const NavLink = memo(({ href, children, isButton, onClick }: NavLinkProps) => (
  <a
    href={href}
    onClick={onClick}
    className={cn(
      "px-3 py-2 rounded-md text-sm font-medium",
      "transition-all duration-300 ease-in-out",
      "transform hover:scale-105",
      isButton
        ? "bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg"
        : "text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-gray-100/10"
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
              <NavLink href="#features" onClick={() => handleNavLinkClick('features')}>
                Features
              </NavLink>
              <NavLink href="#pricing" onClick={() => handleNavLinkClick('pricing')}>
                Pricing
              </NavLink>
              <NavLink href="#about" onClick={() => handleNavLinkClick('about')}>
                About Us
              </NavLink>
              <NavLink href="#changelog" onClick={onShowChangelog}>
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
                <NavLink href="#todos" onClick={() => handleNavLinkClick('todos')}>
                  My Todos
                </NavLink>
                <NavLink href="#profile" onClick={() => handleNavLinkClick('profile')}>
                  Profile
                </NavLink>
                <NavLink href="#" onClick={handleSignOut} isButton>
                  Sign Out
                </NavLink>
              </>
            ) : (
              <NavLink href="#auth" onClick={() => handleNavLinkClick('auth')} isButton>
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
          mobileMenuOpen 
            ? "translate-y-0 opacity-100" 
            : "-translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className={cn(
          "pt-2 pb-3 space-y-1",
          "bg-gradient-to-r from-primary-500/95 to-purple-600/95",
          "dark:from-primary-900/95 dark:to-purple-900/95",
          "backdrop-blur-sm shadow-lg"
        )}>
          <NavLink href="#features" onClick={() => handleNavLinkClick('features')}>
            Features
          </NavLink>
          <NavLink href="#pricing" onClick={() => handleNavLinkClick('pricing')}>
            Pricing
          </NavLink>
          <NavLink href="#about" onClick={() => handleNavLinkClick('about')}>
            About Us
          </NavLink>
          <NavLink href="#changelog" onClick={() => {
            onShowChangelog();
            setMobileMenuOpen(false);
          }}>
            Changelog
          </NavLink>
          {user ? (
            <>
              <NavLink href="#todos" onClick={() => handleNavLinkClick('todos')}>
                My Todos
              </NavLink>
              <NavLink href="#profile" onClick={() => handleNavLinkClick('profile')}>
                Profile
              </NavLink>
              <NavLink href="#" onClick={handleSignOut} isButton>
                Sign Out
              </NavLink>
            </>
          ) : (
            <NavLink href="#auth" onClick={() => handleNavLinkClick('auth')} isButton>
              Sign In
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default memo(Navigation); 