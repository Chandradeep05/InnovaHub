const express = require('express');
const supabase = require('../config/db');
const authenticateAdmin = require('../middleware/auth');

const router = express.Router();

// GET /api/photos — Public: list all photos
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('photos').select('*').order('uploaded_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/photos — Admin: upload photo record
router.post('/', authenticateAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('photos').insert([req.body]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/photos/:id — Admin: delete photo
router.delete('/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { error } = await supabase.from('photos').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Photo deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
