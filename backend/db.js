const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ FATAL: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    throw new Error('Missing Supabase environment variables. Check your Vercel environment settings.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase client initialized');

module.exports = { supabase };
