interface ReleaseChange {
  added?: string[];
  changed?: string[];
  fixed?: string[];
}

export interface Release {
  version: string;
  date: string;
  changes: ReleaseChange;
}

/**
 * Parses the CHANGELOG.md file and converts it to a structured array of releases
 * @param markdownContent The content of the CHANGELOG.md file
 * @returns Array of Release objects
 */
export function parseChangelog(markdownContent: string): Release[] {
  const releases: Release[] = [];
  
  // Split by release sections (## [version] - date)
  const sections = markdownContent.split(/## \[([^\]]+)\](?: - ([^\n]+))?/);
  
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
  
  return releases;
}

/**
 * Helper function to parse a specific section (Added, Changed, Fixed) from the changelog
 */
function parseSection(content: string, sectionName: string): string[] {
  const regex = new RegExp(`### ${sectionName}([\\s\\S]*?)(?=### |$)`, 'i');
  const match = regex.exec(content);
  
  if (!match || !match[1]) return [];
  
  return match[1]
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('- '))
    .map(line => line.substring(2).trim())
    .filter(line => line.length > 0);
}

// Fallback data in case parsing fails
export const fallbackData: Release[] = [
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
  }
]; 