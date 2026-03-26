require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-iic-key-change-this-in-prod';

app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("WARNING: Missing SUPABASE_URL or SUPABASE_KEY in .env");
}

const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'IIC Backend is running!' });
});

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const { data: admins, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .limit(1);
      
    if (error) throw error;
    if (!admins || admins.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const admin = admins[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '30m' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role }
    });
    
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Auth Middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Submit a contact query (Public)
app.post('/api/queries', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  const query_id = `Q-${Math.floor(1000 + Math.random() * 9000)}`;
  
  try {
    const { data, error } = await supabase
      .from('queries')
      .insert([{ query_id, name, email, phone, subject, message }])
      .select();

    if (error) throw error;
    res.status(201).json({ message: 'Query submitted successfully', query: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all queries
app.get('/api/admin/queries', authenticateAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('queries')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all events
app.get('/api/events', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new event
app.post('/api/events', async (req, res) => {
  const { title, description, event_date, category, registration_link } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('events')
      .insert([
        { title, description, event_date, category, registration_link }
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: err.message });
  }
});

// Submit an innovation idea (Public)
app.post('/api/ideas', async (req, res) => {
  const { title, description, category, student_name, email, phone, pitch_deck_url } = req.body;
  const tracking_id = `ID-${Math.floor(10000 + Math.random() * 90000)}`;
  
  try {
    const { data, error } = await supabase
      .from('innovation_ideas')
      .insert([{ tracking_id, title, description, category, student_name, email, phone, pitch_deck_url }])
      .select();

    if (error) throw error;
    res.status(201).json({ message: 'Idea submitted successfully', idea: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all innovation ideas
app.get('/api/admin/ideas', authenticateAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('innovation_ideas')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GALLERY (PHOTOS) ---
app.get('/api/photos', async (req, res) => {
  try {
    const { data, error } = await supabase.from('photos').select('*').order('uploaded_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/photos', authenticateAdmin, async (req, res) => {
  const { title, event_name, category, year, image_url, thumbnail_url } = req.body;
  try {
    const { data, error } = await supabase.from('photos').insert([{ title, event_name, category, year, image_url, thumbnail_url }]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- REPORTS ---
app.get('/api/reports', async (req, res) => {
  try {
    const { data, error } = await supabase.from('reports').select('*').order('uploaded_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/reports', authenticateAdmin, async (req, res) => {
  const { title, description, report_type, event_name, year, pdf_url, file_size } = req.body;
  try {
    const { data, error } = await supabase.from('reports').insert([{ title, description, report_type, event_name, year, pdf_url, file_size }]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- MEMBERS ---
app.get('/api/members', async (req, res) => {
  try {
    const { data, error } = await supabase.from('members').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/members', authenticateAdmin, async (req, res) => {
  const { name, role, department, year, email, phone, linkedin_url, bio, is_faculty, is_active, photo_url } = req.body;
  try {
    const { data, error } = await supabase.from('members').insert([{ name, role, department, year, email, phone, linkedin_url, bio, is_faculty, is_active, photo_url }]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- EMAIL COMMUNICATIONS HUB ---
app.post('/api/admin/emails/send', authenticateAdmin, async (req, res) => {
  const { recipientType, customEmails, subject, message } = req.body;

  try {
    let emailList = [];

    // 1. Gather recipients
    if (recipientType === 'ALL_REGISTRANTS') {
      const { data, error } = await supabase.from('event_registrations').select('email');
      if (error) throw error;
      emailList = data.map(r => r.email);
    } else if (recipientType === 'ALL_MEMBERS') {
      const { data, error } = await supabase.from('members').select('email').eq('is_active', true);
      if (error) throw error;
      emailList = data.map(m => m.email);
    } else if (recipientType === 'ALL_IDEAS') {
      const { data, error } = await supabase.from('innovation_ideas').select('email');
      if (error) throw error;
      emailList = data.map(i => i.email);
    } else if (recipientType === 'CUSTOM') {
      emailList = customEmails.split(',').map(e => e.trim()).filter(e => e);
    }

    // De-duplicate emails
    emailList = [...new Set(emailList)];

    if (emailList.length === 0) {
      return res.status(400).json({ error: 'No recipients found for the selected group.' });
    }

    // 2. Transporter Configuration (Using SMTP settings from DB or ENV)
    // Here we use ENV for safety, or Ethereal for testing if ENV is missing
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      console.warn("SMTP credentials missing. Mocking email send for:", emailList.length, "recipients");
      return res.status(200).json({ 
        message: `(Mock Mode) Simulated sending email to ${emailList.length} recipients successfully. Configure SMTP to send real emails.` 
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // 3. Send Emails (Using BCC for bulk to protect privacy)
    const mailOptions = {
      from: `"IIC Innovates" <${smtpUser}>`,
      to: smtpUser, // Send to self
      bcc: emailList.join(', '), // BCC everyone else
      subject: subject,
      text: message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);

    res.status(200).json({ message: `Successfully sent email to ${emailList.length} recipients.` });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
