require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Initialize and export the client
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;