const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/db');
const config = require('../config/env');
const validate = require('../middleware/validate');

const router = express.Router();

// POST /api/admin/login
router.post('/login', validate({
  email: { required: true, type: 'email' },
  password: { required: true, minLength: 8 },
}), async (req, res, next) => {
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

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      config.jwtSecret,
      { expiresIn: '30m' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
