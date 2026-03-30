const express = require('express');
const supabase = require('../config/db');
const authenticateAdmin = require('../middleware/auth');

const router = express.Router();

// GET /api/members — Public: list all members
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('members').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/members — Admin: add member
router.post('/', authenticateAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('members').insert([req.body]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/members/:id — Admin: update member
router.put('/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('members').update(req.body).eq('id', req.params.id).select();
    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ error: 'Member not found' });
    res.json(data[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/members/:id — Admin: delete member
router.delete('/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { error } = await supabase.from('members').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Member deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
