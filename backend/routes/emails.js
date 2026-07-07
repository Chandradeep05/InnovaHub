const express = require('express');
const supabase = require('../config/db');
const config = require('../config/env');
const authenticateAdmin = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// POST /api/admin/emails/send — Admin: bulk email via Resend HTTP API
router.post('/send', authenticateAdmin, validate({
  recipientType: { required: true },
  subject: { required: true, maxLength: 200 },
  message: { required: true },
}), async (req, res, next) => {
  const { recipientType, customEmails, subject, message } = req.body;

  try {
    let emailList = [];

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
      emailList = (customEmails || '').split(',').map(e => e.trim()).filter(e => e);
    }

    emailList = [...new Set(emailList)];

    if (emailList.length === 0) {
      return res.status(400).json({ error: 'No recipients found for the selected group.' });
    }

    // Check for Resend API key
    if (!config.resendApiKey) {
      console.warn('📧 RESEND_API_KEY missing. Simulating email send for', emailList.length, 'recipients');
      return res.json({
        message: `(Mock Mode) Simulated sending to ${emailList.length} recipients. Set RESEND_API_KEY for real emails.`,
      });
    }

    // Send via Resend HTTP API (works on Render free tier — uses HTTPS, not SMTP)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: config.resendFrom,
        to: emailList,
        subject,
        text: message,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Resend API error:', result);
      return res.status(502).json({ 
        error: `Email delivery failed: ${result.message || 'Unknown Resend error'}`,
        details: result,
      });
    }

    console.log(`✅ Email sent to ${emailList.length} recipients via Resend`);
    res.json({ message: `Successfully sent email to ${emailList.length} recipients.` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
