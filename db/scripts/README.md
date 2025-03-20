# Database Scripts

This folder contains the SQL scripts needed to set up and manage the Supabase database for the Todo app.

## Script Overview

- **create-database.sql**: A comprehensive script that performs all setup operations in one go, including:
  - Creating the todos table with all required columns
  - Enabling Row Level Security (RLS)
  - Setting up user-based access policies
  - Creating performance indexes
  - Enabling real-time functionality
  - Verifying the setup
  - Adding position values for existing todos

## Usage Instructions

### Option 1: Using the Setup Script

Run the setup script from the project root:

```bash
npm run setup-db
```

### Option 2: Manual Execution

If the setup script fails, you can manually run the script in the Supabase SQL Editor:

1. Go to your Supabase dashboard (https://app.supabase.com)
2. Select your project
3. Go to SQL Editor
4. Copy the content of `create-database.sql` and run it

## Troubleshooting

If you encounter the error `column todos.position does not exist`, verify the column was added with:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'todos' 
  AND column_name = 'position';
```

For real-time issues, verify the publication is set up correctly with:

```sql
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
``` 