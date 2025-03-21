const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Supabase URL and service role key are required.');
  console.error('Make sure you have the following environment variables set:');
  console.error('- VITE_SUPABASE_URL: Your Supabase project URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key (not the anon key)');
  process.exit(1);
}

// Create Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  try {
    console.log('Setting up the appointment system...');
    
    // Read the SQL schema
    const schema = fs.readFileSync('./src/db/schema.sql', 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => s + ';');
    
    console.log(`Found ${statements.length} SQL statements to execute.`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabase.rpc('admin_exec_sql', { sql: statement });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error.message);
          console.error('Statement:', statement);
        }
      } catch (error) {
        console.error(`Error executing statement ${i + 1}:`, error.message);
        console.error('Statement:', statement);
      }
    }
    
    console.log('Schema setup complete!');
    
    // Prompt for admin user setup
    const userId = process.argv[2];
    
    if (userId) {
      console.log(`Setting up admin user with ID: ${userId}`);
      
      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from('auth.users')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error('Error finding user:', userError.message);
        process.exit(1);
      }
      
      if (!user) {
        console.error(`User with ID ${userId} not found.`);
        process.exit(1);
      }
      
      // Set up admin role
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: 'admin'
        });
      
      if (error) {
        console.error('Error setting admin role:', error.message);
        process.exit(1);
      }
      
      console.log(`User ${userId} successfully set as admin!`);
    } else {
      console.log('No user ID provided. To set an admin user, run:');
      console.log('node setup-appointments.js <USER_ID>');
    }
    
    console.log('Setup complete!');
  } catch (error) {
    console.error('An error occurred:', error.message);
    process.exit(1);
  }
}

main(); 