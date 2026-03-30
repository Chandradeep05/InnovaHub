const express = require('express');
const supabase = require('../config/db');
const authenticateAdmin = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// POST /api/ideas — Public: submit idea
router.post('/', validate({
  title: { required: true, maxLength: 200 },
  description: { required: true, maxLength: 2000 },
  category: { required: true },
  student_name: { required: true, maxLength: 100 },
  email: { required: true, type: 'email' },
}), async (req, res, next) => {
  const tracking_id = `ID-${Math.floor(10000 + Math.random() * 90000)}`;

  try {
    const { data, error } = await supabase
      .from('innovation_ideas')
      .insert([{ ...req.body, tracking_id }])
      .select();

    if (error) throw error;
    res.status(201).json({ message: 'Idea submitted successfully', idea: data[0] });
  } catch (err) {
    next(err);
  }
});

// GET /api/ideas — Public: list approved ideas
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('innovation_ideas')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/ideas — Admin: list all ideas
router.get('/admin', authenticateAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('innovation_ideas')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/ideas/:id/status — Admin: update idea status
router.patch('/:id/status', authenticateAdmin, validate({
  status: { required: true },
}), async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('innovation_ideas')
      .update({ status: req.body.status })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ error: 'Idea not found' });
    res.json(data[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/ideas/:id — Admin: delete idea
router.delete('/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { error } = await supabase.from('innovation_ideas').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Idea deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
