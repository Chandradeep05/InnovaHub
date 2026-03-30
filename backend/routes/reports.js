const express = require('express');
const supabase = require('../config/db');
const authenticateAdmin = require('../middleware/auth');

const router = express.Router();

// GET /api/reports — Public: list all reports
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('reports').select('*').order('uploaded_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/reports — Admin: upload report
router.post('/', authenticateAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('reports').insert([req.body]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/reports/:id — Admin: delete report
router.delete('/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { error } = await supabase.from('reports').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
