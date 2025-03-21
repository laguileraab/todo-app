import { useState, useEffect } from 'react';
import { cn } from '../utils/cn';
import { parseChangelog, fallbackData, Release } from '../utils/parseChangelog';
import changelogContent from '../../CHANGELOG.md?raw';

interface ChangelogProps {
  onClose: () => void;
  isOpen: boolean;
}

export default function Changelog({ onClose, isOpen }: ChangelogProps) {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedReleases, setExpandedReleases] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      // Parse the actual CHANGELOG.md file
      const parsedReleases = parseChangelog(changelogContent);
      
      // Simulate a loading delay for better UX
      const timeout = setTimeout(() => {
        if (parsedReleases.length > 0) {
          setReleases(parsedReleases);
          // Expand the first release by default
          if (parsedReleases.length > 0) {
            setExpandedReleases({ [parsedReleases[0].version]: true });
          }
        } else {
          // If parsing produced no releases, use fallback data
          console.warn('No releases found in CHANGELOG.md, using fallback data');
          setReleases(fallbackData);
          // Expand the first fallback release by default
          if (fallbackData.length > 0) {
            setExpandedReleases({ [fallbackData[0].version]: true });
          }
        }
        setLoading(false);
      }, 500);
      
      return () => clearTimeout(timeout);
    } catch (err) {
      console.error('Error parsing changelog:', err);
      setError('Failed to parse changelog. Please try again later.');
      setReleases(fallbackData);
      setLoading(false);
    }
  }, []);

  const toggleRelease = (version: string) => {
    setExpandedReleases(prev => ({
      ...prev,
      [version]: !prev[version]
    }));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm dark:backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <div className={cn(
        "bg-white/95 dark:bg-gray-800/95 rounded-xl shadow-xl",
        "w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col",
        "border border-gray-200 dark:border-gray-700",
        "backdrop-filter backdrop-blur-sm"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Release History</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-700/80 text-gray-500 dark:text-gray-400"
            aria-label="Close changelog"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 max-h-[65vh]">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-10 w-10 border-4 border-primary-500 rounded-full border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100/80 dark:bg-red-900/30 text-red-700 dark:text-red-200 p-4 rounded-md">
              {error}
            </div>
          ) : releases.length === 0 ? (
            <div className="bg-yellow-100/80 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-200 p-4 rounded-md">
              No release history available.
            </div>
          ) : (
            <div className="space-y-4">
              {releases.map((release, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <button 
                    className="w-full p-4 flex items-center justify-between bg-gray-50/80 dark:bg-gray-900/80 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
                    onClick={() => toggleRelease(release.version)}
                    aria-expanded={expandedReleases[release.version]}
                  >
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        v{release.version}
                      </h3>
                      {release.date && (
                        <span className="text-sm px-2 py-1 bg-gray-200/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 rounded">
                          {release.date}
                        </span>
                      )}
                    </div>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={cn(
                        "h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform",
                        expandedReleases[release.version] ? "transform rotate-180" : ""
                      )}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {expandedReleases[release.version] && (
                    <div className="p-4 bg-white/90 dark:bg-gray-850/90">
                      {release.changes.added && release.changes.added.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
                            Added
                          </h4>
                          <ul className="space-y-1 pl-5 list-disc text-gray-700 dark:text-gray-300">
                            {release.changes.added.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {release.changes.changed && release.changes.changed.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                            Changed
                          </h4>
                          <ul className="space-y-1 pl-5 list-disc text-gray-700 dark:text-gray-300">
                            {release.changes.changed.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {release.changes.fixed && release.changes.fixed.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">
                            Fixed
                          </h4>
                          <ul className="space-y-1 pl-5 list-disc text-gray-700 dark:text-gray-300">
                            {release.changes.fixed.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300/80 dark:hover:bg-gray-600/80 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 