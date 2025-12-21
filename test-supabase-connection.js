// Test Supabase Connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jleufzctebtcpdqlzckf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsZXVmemN0ZWJ0Y3BkcWx6Y2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMDQ2NDgsImV4cCI6MjA3NDg4MDY0OH0.jfGP-rbDFlxp5bTmjD90f0dLq42OvGTkN3xr3dZuny8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Basic connection
    const { data, error } = await supabase.from('companies').select('count');
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      if (error.message.includes('relation "companies" does not exist')) {
        console.log('💡 Solution: Run the supabase-schema.sql in your Supabase SQL Editor');
      }
    } else {
      console.log('✅ Connection successful!');
      console.log('📊 Data:', data);
    }
    
    // Test 2: Check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names');
      
    if (!tablesError) {
      console.log('📋 Available tables:', tables);
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testConnection();