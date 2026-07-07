require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'super-secret-innovahub-key-change-this-in-prod',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  brevoApiKey: process.env.BREVO_API_KEY,
  brevoFromName: process.env.BREVO_FROM_NAME || 'Innovahub(IH)',
  brevoFromEmail: process.env.BREVO_FROM_EMAIL || process.env.SMTP_USER || 'noreply@innovahub.com',
};
