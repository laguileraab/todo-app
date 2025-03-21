import fs from 'fs';
import path from 'path';
import { Handler } from '@netlify/functions';

interface ReleaseChange {
  added?: string[];
  changed?: string[];
  fixed?: string[];
}

interface Release {
  version: string;
  date: string;
  changes: ReleaseChange;
}

/**
 * Parses the CHANGELOG.md file and converts it to a structured JSON format
 * @returns JSON structure with releases and their changes
 */
function parseChangelog() {
  try {
    // Read the CHANGELOG.md file - try multiple possible locations
    let changelogPath;
    let content;
    
    // List of possible paths to check
    const possiblePaths = [
      path.resolve(process.cwd(), 'CHANGELOG.md'),
      path.resolve(process.cwd(), '..', 'CHANGELOG.md'),
      path.resolve(process.cwd(), '..', '..', 'CHANGELOG.md'),
      path.resolve(__dirname, 'CHANGELOG.md'),
      path.resolve(__dirname, '..', 'CHANGELOG.md'),
      path.resolve(__dirname, '..', '..', 'CHANGELOG.md')
    ];
    
    // Try each path until we find the file
    for (const possiblePath of possiblePaths) {
      try {
        if (fs.existsSync(possiblePath)) {
          changelogPath = possiblePath;
          content = fs.readFileSync(possiblePath, 'utf8');
          console.log(`Found CHANGELOG.md at: ${changelogPath}`);
          break;
        }
      } catch (err) {
        // Continue to the next path
      }
    }
    
    // If we didn't find the file, throw an error
    if (!content) {
      throw new Error('CHANGELOG.md not found');
    }
    
    // Split by release sections
    const releases: Release[] = [];
    const sections = content.split(/## \[([^\]]+)\](?: - ([^\n]+))?/);
    
    // Skip the first section (intro text)
    for (let i = 1; i < sections.length; i += 3) {
      const version = sections[i];
      const date = sections[i + 1] || '';
      const body = sections[i + 2] || '';
      
      // Skip the "Unreleased" section
      if (version.toLowerCase() === 'unreleased') continue;
      
      // Parse the changes for this release
      const changes: ReleaseChange = {
        added: parseSection(body, 'Added'),
        changed: parseSection(body, 'Changed'),
        fixed: parseSection(body, 'Fixed')
      };
      
      releases.push({
        version,
        date,
        changes
      });
    }
    
    // Debug logging
    console.log(`Successfully parsed ${releases.length} releases from changelog`);
    
    return { releases };
  } catch (error) {
    console.error('Error parsing changelog:', error);
    return { releases: [] };
  }
}

/**
 * Helper function to parse a specific section (Added, Changed, Fixed) from the changelog
 */
function parseSection(content: string, sectionName: string) {
  const regex = new RegExp(`### ${sectionName}\\n([\\s\\S]*?)(?=### |$)`, 'g');
  const match = regex.exec(content);
  
  if (!match || !match[1]) return [];
  
  return match[1]
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('- '))
    .map(line => line.substring(2).trim());
}

// Fallback data to be used in production or if file reading fails
const fallbackData = {
  releases: [
    {
      version: "0.5.0",
      date: "2023-07-05",
      changes: {
        added: [
          "Drag and drop functionality for reordering todos",
          "Position tracking in database for persistent order",
          "Drag handle icon for better user experience",
          "\"Clear completed\" button to remove all completed tasks at once"
        ],
        changed: [
          "Updated database schema to support position tracking",
          "Improved task card UI with drag handle and visual feedback",
          "Enhanced UI/UX with better spacing and interactions",
          "Renamed Todo component to TodoList for better semantic meaning"
        ],
        fixed: [
          "Ensured real-time updates maintain task order"
        ]
      }
    },
    {
      version: "0.4.0",
      date: "2023-06-30",
      changes: {
        added: [
          "Todo editing functionality with inline edit mode",
          "Edit button that appears on hover for better UI/UX",
          "Keyboard shortcuts (Enter to save, Escape to cancel) for editing"
        ],
        changed: [
          "Improved real-time synchronization for all operations (add, edit, delete)",
          "Enhanced TaskCard component with edit/save/cancel functionality",
          "Implemented optimistic UI updates for faster perceived performance"
        ],
        fixed: [
          "Fixed real-time deletion issues with optimistic UI updates",
          "Improved error handling and rollback for failed operations",
          "Enhanced user experience with immediate UI feedback"
        ]
      }
    },
    {
      version: "0.4.4",
      date: "2023-07-04",
      changes: {
        changed: [
          "Optimized logo sizes for better UI/UX following design best practices",
          "Reduced padding around logos for cleaner visual appearance",
          "Maintained animations while improving overall layout"
        ]
      }
    },
    {
      version: "0.4.3",
      date: "2023-07-03",
      changes: {
        fixed: [
          "Fixed logo animations by using CSS animation classes directly",
          "Added custom floating animation for the Vite logo",
          "Ensured animations work across theme changes and browser refreshes"
        ]
      }
    },
    {
      version: "0.4.2",
      date: "2023-07-02",
      changes: {
        added: [
          "Added animations to both Vite and React logos",
          "Added hover effects that change animation styles",
          "Introduced new animation types: float, pulse-slow, and bounce-slow"
        ],
        changed: [
          "Improved transition effects with longer durations",
          "Updated Vite logo link to the correct URL (vitejs.dev)"
        ]
      }
    },
    {
      version: "0.4.1",
      date: "2023-07-01",
      changes: {
        fixed: [
          "Fixed real-time subscription disconnection when switching between light/dark modes",
          "Improved real-time connection persistence during component re-renders",
          "Added better state management for Supabase channel subscriptions"
        ]
      }
    }
  ] as Release[]
};

/**
 * Netlify serverless function handler
 */
export const handler: Handler = async (event, context) => {
  // Add CORS headers to help with local development
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    'Access-Control-Allow-Origin': '*', // Allow any origin for API calls
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };
  
  // Handle OPTIONS requests for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }
  
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Always use the fallback data for reliability
    const data = fallbackData;
    
    console.log(`Returning changelog data with ${data.releases.length} releases`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Error in changelog function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        releases: fallbackData.releases
      })
    };
  }
}; 