require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Usage: node reset-password.js <admin-email> <new-password>
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error('Usage: node reset-password.js <admin-email> <new-password>');
  process.exit(1);
}

async function reset() {
  try {
    const hash = await bcrypt.hash(newPassword, 10);
    const { data, error } = await supabase
      .from('admins')
      .update({ password_hash: hash })
      .eq('email', email)
      .select();
      
    if (error) {
      console.error('Error updating password:', error);
    } else if (!data || data.length === 0) {
      console.error(`No admin found with email: ${email}`);
    } else {
      console.log(`Password successfully reset for ${email}`);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

reset();
