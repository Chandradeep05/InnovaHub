require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function reset() {
  try {
    const hash = await bcrypt.hash('admin123', 10);
    const { data, error } = await supabase
      .from('admins')
      .update({ password_hash: hash })
      .eq('email', 'admin@innovahub.com')
      .select();
      
    if (error) {
      console.error('Error updating password:', error);
    } else {
      console.log('Password successfully reset for admin@innovahub.com! You can now login with "admin123"');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

reset();
