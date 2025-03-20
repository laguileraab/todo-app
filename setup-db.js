#!/usr/bin/env node

/**
 * Supabase Database Setup Script
 * 
 * This script sets up the todos table and all necessary configurations
 * for the Todo app using a comprehensive database script.
 * 
 * Usage:
 *   node setup-db.js
 * 
 * Environment variables (in .env.local):
 *   VITE_SUPABASE_URL - Supabase project URL
 *   VITE_SUPABASE_SERVICE_ROLE_KEY - Service role key (required for schema modifications)
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Setup path for current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
function loadEnv() {
  try {
    // Try loading from .env.local first (development)
    const envLocalPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envLocalPath)) {
      const envLocal = dotenv.parse(fs.readFileSync(envLocalPath));
      return envLocal;
    }
    
    // Fall back to .env if .env.local doesn't exist
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const env = dotenv.parse(fs.readFileSync(envPath));
      return env;
    }
    
    console.warn('No .env or .env.local file found, using environment variables directly');
    return process.env;
  } catch (error) {
    console.error('Error loading environment variables:', error.message);
    return process.env;
  }
}

// Get environment variables
const env = loadEnv();

// Get Supabase credentials from environment variables
const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('\x1b[31mError: Missing Supabase credentials\x1b[0m');
  console.error('Make sure you have a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

// Mask the key for display
const maskedKey = supabaseKey.substring(0, 10) + '...' + supabaseKey.substring(supabaseKey.length - 4);

console.log('\x1b[34m=== Supabase Database Setup ===\x1b[0m');
console.log('\x1b[36mURL:\x1b[0m', supabaseUrl);
console.log('\x1b[36mKey:\x1b[0m', maskedKey);

// Create Supabase client with service role key (required for schema modifications)
const supabase = createClient(supabaseUrl, supabaseKey);

// Read SQL script from file
function readSqlScript(filename) {
  try {
    const filePath = path.join(__dirname, 'db', 'scripts', filename);
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`\x1b[31mError reading SQL script ${filename}:\x1b[0m`, error.message);
    return null;
  }
}

// SQL script - comprehensive database setup
const createDatabaseSQL = readSqlScript('create-database.sql');

// Check if table exists and create it if needed
async function setupDatabase() {
  try {
    console.log('\n\x1b[34m=== Checking Database Setup ===\x1b[0m');
    
    // First, try to run a simple query to check if the table exists
    console.log('Checking if todos table exists...');
    const { error: tableCheckError } = await supabase
      .from('todos')
      .select('count', { count: 'exact', head: true })
      .limit(0);
    
    if (tableCheckError && tableCheckError.code === '42P01') {
      console.log('\x1b[33mThe todos table does not exist.\x1b[0m');
      console.log('\x1b[34mCreating database with all required components...\x1b[0m');
      
      // Try to execute the consolidated SQL script using RPC if available
      try {
        if (createDatabaseSQL) {
          console.log('\x1b[34mUsing comprehensive database setup script...\x1b[0m');
          const { error: sqlError } = await supabase.rpc('exec_sql', {
            query: createDatabaseSQL
          });
          
          if (sqlError) {
            if (sqlError.message && sqlError.message.includes('function "exec_sql" does not exist')) {
              console.error('\x1b[33mThe exec_sql function does not exist in your Supabase instance.\x1b[0m');
              console.log('\n\x1b[34m=== SQL Script to Run in Supabase SQL Editor ===\x1b[0m');
              console.log(createDatabaseSQL);
              console.log('\n\x1b[32mCopy the SQL above and run it in the Supabase SQL Editor at:\x1b[0m');
              console.log(`\x1b[36mhttps://app.supabase.com/project/_/sql\x1b[0m`);
            } else {
              console.error('\x1b[31mError creating database:\x1b[0m', sqlError);
            }
          } else {
            console.log('\x1b[32m✓ Successfully set up database!\x1b[0m');
          }
        } else {
          console.error('\x1b[31mDatabase script not found. Please check that db/scripts/create-database.sql exists.\x1b[0m');
        }
      } catch (rpcError) {
        console.error('\x1b[31mError executing SQL via RPC:\x1b[0m', rpcError);
        console.log('\n\x1b[34m=== SQL Script to Run in Supabase SQL Editor ===\x1b[0m');
        console.log(createDatabaseSQL);
        console.log('\n\x1b[32mCopy the SQL above and run it in the Supabase SQL Editor at:\x1b[0m');
        console.log(`\x1b[36mhttps://app.supabase.com/project/_/sql\x1b[0m`);
      }
    } else if (tableCheckError) {
      console.error('\x1b[31mError checking table:\x1b[0m', tableCheckError);
      
      if (tableCheckError.message.toLowerCase().includes('invalid api key') || 
          tableCheckError.message.toLowerCase().includes('jwt')) {
        console.error('\n\x1b[31mAPI key error detected. Please check that:\x1b[0m');
        console.error('1. Your VITE_SUPABASE_SERVICE_ROLE_KEY is correct and not expired');
        console.error('2. You\'re using the service role key, not the anon key');
        console.error('3. Your project URL is correct');
      }
    } else {
      console.log('\x1b[32m✓ The todos table already exists.\x1b[0m');
      
      // Run the comprehensive script to ensure everything is properly configured
      console.log('Running comprehensive setup to ensure all configurations are up to date...');
      try {
        if (createDatabaseSQL) {
          const { error: updateError } = await supabase.rpc('exec_sql', {
            query: createDatabaseSQL
          });
          
          if (updateError) {
            if (updateError.message && updateError.message.includes('function "exec_sql" does not exist')) {
              console.log('\x1b[33mCannot automatically update database configuration. Please run the SQL script manually.\x1b[0m');
              console.log('\n\x1b[34m=== SQL Script to Run in Supabase SQL Editor ===\x1b[0m');
              console.log(createDatabaseSQL);
              console.log('\n\x1b[32mCopy the SQL above and run it in the Supabase SQL Editor at:\x1b[0m');
              console.log(`\x1b[36mhttps://app.supabase.com/project/_/sql\x1b[0m`);
            } else {
              console.error('\x1b[31mError updating database configuration:\x1b[0m', updateError);
            }
          } else {
            console.log('\x1b[32m✓ Database configuration is up to date.\x1b[0m');
          }
        }
      } catch (error) {
        console.error('\x1b[31mError updating database configuration:\x1b[0m', error);
        console.log('\n\x1b[34m=== SQL Script to Run in Supabase SQL Editor ===\x1b[0m');
        console.log(createDatabaseSQL);
      }
      
      // Try to select some data from the todos table to verify access
      console.log('Checking table access rights...');
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('\x1b[31mError accessing todos table:\x1b[0m', error);
      } else {
        console.log(`\x1b[32m✓ Successfully accessed the todos table.\x1b[0m`);
        if (data && data.length > 0) {
          console.log(`\x1b[36mFound ${data.length} record(s) in the table.\x1b[0m`);
        } else {
          console.log('\x1b[36mNo records found in the table yet.\x1b[0m');
        }
      }
    }
    
    console.log('\n\x1b[34m=== Manual Database Setup Instructions ===\x1b[0m');
    console.log('If automatic setup failed, follow these steps:');
    console.log('1. Go to the Supabase SQL Editor: \x1b[36mhttps://app.supabase.com/project/_/sql\x1b[0m');
    console.log('2. Run the comprehensive setup script:');
    console.log('   - db/scripts/create-database.sql - Complete database setup');
    
    console.log('\n\x1b[34m=== Next Steps ===\x1b[0m');
    console.log('1. Run your application: \x1b[36mnpm run dev\x1b[0m');
    console.log('2. Use the app to create and manage todos');
    console.log('3. For troubleshooting, open: \x1b[36msupabase-diagnostic.html\x1b[0m');
    
  } catch (error) {
    console.error('\x1b[31mUnexpected error:\x1b[0m', error);
  }
}

// Run the function
setupDatabase(); 