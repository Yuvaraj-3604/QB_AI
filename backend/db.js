const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ FATAL: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    console.log('   Please add these environment variables in your Vercel Dashboard Settings > Environment Variables.');
}

// Create client or dummy if missing keys (to prevent crash on export)
const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : new Proxy({}, {
        get: () => {
            const fail = () => Promise.reject(new Error("Supabase is not configured. Please check your Vercel Environment Variables."));
            const handler = { get: () => fail, apply: () => fail };
            return () => new Proxy(() => { }, handler);
        }
    });

if (supabaseUrl && supabaseKey) {
    console.log('✅ Supabase client initialized');
}

module.exports = { supabase };
