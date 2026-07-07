const express = require('express');
const supabase = require('../config/db');
const config = require('../config/env');
const authenticateAdmin = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// POST /api/admin/emails/send — Admin: bulk email via Brevo HTTP API
router.post('/send', authenticateAdmin, validate({
  recipientType: { required: true },
  subject: { required: true, maxLength: 200 },
  message: { required: true },
}), async (req, res, next) => {
  const { recipientType, customEmails, subject, message, attachment } = req.body;

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

    // Check for Brevo API key
    if (!config.brevoApiKey) {
      console.warn('📧 BREVO_API_KEY missing. Simulating email send for', emailList.length, 'recipients');
      return res.json({
        message: `(Mock Mode) Simulated sending to ${emailList.length} recipients. Set BREVO_API_KEY for real emails.`,
      });
    }

    // Build Brevo API request body
    const brevoPayload = {
      sender: {
        name: config.brevoFromName,
        email: config.brevoFromEmail,
      },
      to: emailList.map(email => ({ email })),
      subject,
      textContent: message,
    };

    // Add attachment if provided (base64 encoded)
    if (attachment && attachment.content && attachment.name) {
      brevoPayload.attachment = [{
        content: attachment.content,
        name: attachment.name,
      }];
    }

    // Send via Brevo HTTP API (uses HTTPS port 443 — works on Render free tier)
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': config.brevoApiKey,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(brevoPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Brevo API error:', result);
      return res.status(502).json({
        error: `Email delivery failed: ${result.message || 'Unknown Brevo error'}`,
        details: result,
      });
    }

    console.log(`✅ Email sent to ${emailList.length} recipients via Brevo`);
    res.json({ message: `Successfully sent email to ${emailList.length} recipients.` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
