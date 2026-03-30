const { createClient } = require('@supabase/supabase-js');
const config = require('./env');

if (!config.supabaseUrl || !config.supabaseKey) {
  console.warn('⚠️  WARNING: Missing SUPABASE_URL or SUPABASE_KEY in .env');
}

const supabase = createClient(
  config.supabaseUrl || 'https://placeholder.supabase.co',
  config.supabaseKey || 'placeholder'
);

module.exports = supabase;
