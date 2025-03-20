# React + TypeScript + Supabase Todo App

This is a full-stack todo application built with:
- React + TypeScript for frontend
- Tailwind CSS for styling
- Supabase for backend (authentication, database)
- Vite for build tooling

## Features

- User authentication (signup, login, logout)
- Todo CRUD operations with Row Level Security
- Real-time updates with Supabase subscriptions
- Drag and drop reordering with position tracking
- Dark mode support
- Responsive design

## Prerequisites

- Node.js (v16+)
- npm or yarn
- A Supabase account and project

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can get these credentials from your Supabase project dashboard under Settings > API.

### 4. Database Setup

You can set up the database in two ways:

#### Option 1: Automated Setup (Recommended)

Run the setup script:

```bash
npm run setup-db
```

This script will:
- Connect to your Supabase instance
- Create the "todos" table with proper structure
- Enable Row Level Security (RLS)
- Set up access policies for user data
- Create an index on the user_id column for faster queries
- Add the position column for drag-and-drop ordering
- Attempt to enable real-time functionality

#### Option 2: Manual Setup

All database scripts are located in the `db/scripts` folder:

1. Run `db/scripts/setup-todos-table.sql` to create the table and policies
2. Run `db/scripts/add-position-column.sql` to add position tracking for drag-and-drop
3. Run `db/scripts/enable-realtime.sql` to enable real-time updates

You can also use the helper scripts:

```bash
npm run db:add-position    # Get SQL for adding the position column
npm run db:enable-realtime # Get SQL for enabling real-time updates
```

### 5. Enabling Real-Time Updates (Important!)

The real-time functionality must be explicitly enabled for the "todos" table. If the automated setup didn't successfully enable real-time, follow these steps:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and run the SQL from `db/scripts/enable-realtime.sql`:

```sql
-- Enable real-time for the todos table
ALTER PUBLICATION supabase_realtime ADD TABLE todos;

-- Verify real-time is enabled
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

Alternatively, you can run:

```bash
npm run db:enable-realtime
```

This will show you the SQL commands to copy and execute in the Supabase SQL Editor.

### 6. Start the Development Server

```bash
npm run dev
```

## Troubleshooting Real-Time Updates

If your todo items are not updating in real-time:

1. Check the real-time status indicator at the bottom of the Todo list
   - "✓ Real-time updates active" indicates proper connection
   - "⚠ Real-time updates inactive" indicates an issue

2. Ensure you executed the SQL commands to enable real-time
   - Run the SQL commands in step 5 again

3. Verify that your database policies allow read access to the authenticated user
   - Check the Row Level Security (RLS) policies in the Supabase dashboard

4. Check the browser console for real-time connection errors
   - Look for [Supabase] or [Todos] prefixed log messages

5. Try refreshing the application or logging out and back in

## How Real-Time Works

This application uses Supabase's real-time features to provide instant updates:

1. When users are authenticated, a real-time channel is created
2. The channel subscribes to changes on the "todos" table filtered by the user's ID
3. Any database changes (INSERT, UPDATE, DELETE) trigger automatic UI updates
4. The application includes fallback mechanisms if real-time is unavailable

## Security Features

- Row Level Security (RLS) ensures users can only access their own todos
- All database operations filter by user_id for added security
- API keys are validated on startup
- Authentication state is properly managed and secured

## Drag and Drop Functionality

This app includes drag and drop reordering for todos:

1. Hover over a todo to see the drag handle icon
2. Click and hold the handle to start dragging
3. Move the todo to the desired position
4. Drop to save the new order

The order is persisted in the database using a `position` column, ensuring your todos stay in the same order even after refreshing or logging back in.

If you're experiencing issues with drag and drop:

1. Make sure the `position` column exists in your todos table
   - Run the SQL from `db/scripts/add-position-column.sql`
   - Or use `npm run db:add-position` to get the SQL

2. Check the browser console for any errors
   - Look for messages related to the `position` column

## License

This project is licensed under the MIT License - see the LICENSE file for details.
