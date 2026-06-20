const express = require('express');
const nodemailer = require('nodemailer');
const supabase = require('../config/db');
const config = require('../config/env');
const authenticateAdmin = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// POST /api/admin/emails/send — Admin: bulk email
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

    if (!config.smtp.user || !config.smtp.pass) {
      console.warn('📧 SMTP credentials missing. Simulating email send for', emailList.length, 'recipients');
      return res.json({
        message: `(Mock Mode) Simulated sending to ${emailList.length} recipients. Configure SMTP for real emails.`,
      });
    }

    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });

    await transporter.sendMail({
      from: `"Innovahub(IH)" <${config.smtp.user}>`,
      to: config.smtp.user,
      bcc: emailList.join(', '),
      subject,
      text: message,
    });

    res.json({ message: `Successfully sent email to ${emailList.length} recipients.` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
