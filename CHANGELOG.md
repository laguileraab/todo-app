# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Organized database scripts into dedicated `db/scripts` folder
- Created comprehensive database setup script (`create-database.sql`) that performs all setup in one operation
- Created documentation for database scripts in `db/scripts/README.md`
- Performance optimizations with memoization throughout the application
- Added Excel export functionality for todos list

### Changed
- Updated setup-db.js to use a single consolidated SQL script
- Improved setup process with better error handling and instructions
- Updated package.json with new database script commands
- Optimized TodoList and TaskCard components with React.memo, useCallback and useMemo
- Enhanced useTodos hook with better state management and memoization
- Improved drag and drop functionality to use the entire todo card instead of just the handle
- Enhanced drag handle visualization with better styling and permanent visibility
- Improved cursor feedback with proper grab/grabbing states following UI/UX best practices
- Simplified database scripts by removing redundant files and using a single comprehensive script

### Fixed
- Added solution for "column todos.position does not exist" error
- Fixed drag and drop reordering error by including all required fields during position updates
- Reduced unnecessary re-renders throughout the application
- Fixed event propagation for buttons and checkboxes to prevent unintended drag starts
- Removed unused imports (`Todo` from Todo.tsx and `getCurrentUser` from useTodos.ts) to fix lint warnings

## [0.5.0] - 2023-07-05

### Added
- Drag and drop functionality for reordering todos
- Position tracking in database for persistent order
- Drag handle icon for better user experience
- "Clear completed" button to remove all completed tasks at once

### Changed
- Updated database schema to support position tracking
- Improved task card UI with drag handle and visual feedback
- Enhanced UI/UX with better spacing and interactions
- Renamed Todo component to TodoList for better semantic meaning

### Fixed
- Ensured real-time updates maintain task order

## [0.4.4] - 2023-07-04

### Changed
- Optimized logo sizes for better UI/UX following design best practices
- Reduced padding around logos for cleaner visual appearance
- Maintained animations while improving overall layout

## [0.4.3] - 2023-07-03

### Fixed
- Fixed logo animations by using CSS animation classes directly
- Added custom floating animation for the Vite logo
- Ensured animations work across theme changes and browser refreshes

## [0.4.2] - 2023-07-02

### Added
- Added animations to both Vite and React logos
- Added hover effects that change animation styles
- Introduced new animation types: float, pulse-slow, and bounce-slow

### Changed
- Improved transition effects with longer durations
- Updated Vite logo link to the correct URL (vitejs.dev)

## [0.4.1] - 2023-07-01

### Fixed
- Fixed real-time subscription disconnection when switching between light/dark modes
- Improved real-time connection persistence during component re-renders
- Added better state management for Supabase channel subscriptions

## [0.4.0] - 2023-06-30

### Added
- Todo editing functionality with inline edit mode
- Edit button that appears on hover for better UI/UX
- Keyboard shortcuts (Enter to save, Escape to cancel) for editing

### Changed
- Improved real-time synchronization for all operations (add, edit, delete)
- Enhanced TaskCard component with edit/save/cancel functionality
- Implemented optimistic UI updates for faster perceived performance

### Fixed
- Fixed real-time deletion issues with optimistic UI updates
- Improved error handling and rollback for failed operations
- Enhanced user experience with immediate UI feedback

## [0.3.2] - 2023-06-26

### Fixed
- Updated Supabase API credentials with correct anon key
- Configured project URL in environment variables
- Fixed "Invalid API key" error (401)

## [0.3.1] - 2023-06-25

### Fixed
- Resolved Supabase API connection error (401 - Invalid API key)
- Added proper environment variables configuration guidance
- Improved documentation for API setup

## [0.3.0] - 2023-06-20

### Added
- Real-time status indicator in the Todo component UI
- Fallback to manual state updates when real-time is unavailable
- More comprehensive debug logging for real-time events
- User-specific channel names to prevent conflicts

### Changed
- Enhanced Supabase client configuration with additional real-time settings
- Improved error handling for real-time subscription failures
- Added explicit user ID filtering for better security in database queries

### Fixed
- Fixed real-time subscription issues by adding proper cleanup
- Improved channel management and subscription handling
- Enhanced error reporting for troubleshooting real-time connection problems

## [0.2.0] - 2023-06-15

### Added
- Added real-time capabilities for the todos table
- Added `enable-realtime.sql` script for manual real-time enablement
- Added npm script `enable-realtime` for guiding users on real-time setup

### Changed
- Improved Supabase client configuration with proper real-time settings
- Enhanced `useTodos` hook with user-specific real-time subscriptions
- Optimized React performance using `useCallback` for memoization

### Fixed
- Resolved real-time update issues with todos not reflecting changes immediately
- Fixed subscription management with proper lifecycle handling
- Improved error handling and debugging for Supabase connections

## [0.1.0] - 2023-06-10

### Added
- Created `setup-db.js`