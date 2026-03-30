const express = require('express');
const supabase = require('../config/db');
const authenticateAdmin = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// POST /api/queries — Public: submit a contact query
router.post('/', validate({
  name: { required: true, maxLength: 100 },
  email: { required: true, type: 'email' },
  subject: { required: true, maxLength: 200 },
  message: { required: true, maxLength: 2000 },
}), async (req, res, next) => {
  const query_id = `Q-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    const { data, error } = await supabase
      .from('queries')
      .insert([{ ...req.body, query_id }])
      .select();

    if (error) throw error;
    res.status(201).json({ message: 'Query submitted successfully', query: data[0] });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/queries — Admin: list all queries
router.get('/admin', authenticateAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('queries')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/queries/:id — Admin: delete query
router.delete('/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { error } = await supabase.from('queries').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Query deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
