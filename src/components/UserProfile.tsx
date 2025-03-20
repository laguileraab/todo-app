import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

export function UserProfile() {
  const { user, signOut } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className={cn(
      "p-4 rounded-md mb-4 transition-colors",
      "bg-gray-50 dark:bg-gray-700",
      "text-gray-800 dark:text-gray-200"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center mr-3",
            "bg-primary-100 dark:bg-primary-900",
            "text-primary-700 dark:text-primary-300"
          )}>
            {user.email ? user.email[0].toUpperCase() : '?'}
          </div>
          <div>
            <p className="font-medium">{user.email}</p>
            <p className={cn(
              "text-xs",
              "text-gray-500 dark:text-gray-400"
            )}>
              Logged in
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className={cn(
            "px-3 py-1 rounded text-sm transition-colors",
            "bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500",
            "text-gray-700 dark:text-gray-300"
          )}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
} 