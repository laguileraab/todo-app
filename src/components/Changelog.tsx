import { useState, useEffect, useCallback, memo } from 'react';
import { parseChangelog, fallbackData, Release } from '../utils/parseChangelog';
import changelogContent from '../../CHANGELOG.md?raw';

interface ChangelogProps {
  onClose: () => void;
  isOpen: boolean;
}

// Memoized release item component to prevent unnecessary re-renders
const ReleaseItem = memo(({ 
  release, 
  isExpanded, 
  onToggle 
}: { 
  release: Release; 
  isExpanded: boolean; 
  onToggle: () => void;
}) => (
  <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          {release.version}
        </span>
        {release.date && (
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {release.date}
          </span>
        )}
      </div>
      <svg
        className={`w-5 h-5 text-gray-500 dark:text-gray-400 transform transition-transform ${
          isExpanded ? 'rotate-180' : ''
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {isExpanded && (
      <div className="px-4 py-3 bg-white dark:bg-gray-900">
        {release.changes.added && release.changes.added.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">Added</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              {release.changes.added.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {release.changes.changed && release.changes.changed.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Changed</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              {release.changes.changed.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {release.changes.fixed && release.changes.fixed.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Fixed</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              {release.changes.fixed.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )}
  </div>
));

export default function Changelog({ onClose, isOpen }: ChangelogProps) {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedReleases, setExpandedReleases] = useState<string[]>([]);

  // Memoize the toggle function to prevent unnecessary re-renders
  const toggleRelease = useCallback((version: string) => {
    setExpandedReleases(prev => 
      prev.includes(version) 
        ? prev.filter(v => v !== version)
        : [...prev, version]
    );
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadChangelog = async () => {
      try {
        // Parse the actual CHANGELOG.md file
        const parsedReleases = parseChangelog(changelogContent);
        
        // Simulate a loading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!mounted) return;

        if (parsedReleases.length > 0) {
          setReleases(parsedReleases);
          // Expand the first release by default
          if (parsedReleases.length > 0) {
            setExpandedReleases([parsedReleases[0].version]);
          }
        } else {
          // If parsing produced no releases, use fallback data
          console.warn('No releases found in CHANGELOG.md, using fallback data');
          setReleases(fallbackData);
          // Expand the first fallback release by default
          if (fallbackData.length > 0) {
            setExpandedReleases([fallbackData[0].version]);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Error parsing changelog:', err);
        if (mounted) {
          setError('Failed to parse changelog. Please try again later.');
          setReleases(fallbackData);
          setLoading(false);
        }
      }
    };

    loadChangelog();

    return () => {
      mounted = false;
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/70 dark:backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Release Notes</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : error ? (
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
              <p className="font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : releases.length === 0 ? (
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg">
              No release history available.
            </div>
          ) : (
            <div className="space-y-6">
              {releases.map((release) => (
                <ReleaseItem
                  key={release.version}
                  release={release}
                  isExpanded={expandedReleases.includes(release.version)}
                  onToggle={() => toggleRelease(release.version)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 