const express = require('express');
const supabase = require('../config/db');
const authenticateAdmin = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// GET /api/events — Public: list all events
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/events — Admin: create event
router.post('/', authenticateAdmin, validate({
  title: { required: true, maxLength: 200 },
  event_date: { required: true },
  category: { required: true },
}), async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert([req.body])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/events/:id — Admin: update event
router.put('/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .update(req.body)
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ error: 'Event not found' });
    res.json(data[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/events/:id — Admin: delete event
router.delete('/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/events/:id/register — Public: register for event
router.post('/:id/register', validate({
  student_name: { required: true, maxLength: 100 },
  roll_number: { required: true, maxLength: 20 },
  email: { required: true, type: 'email' },
  phone: { required: true, type: 'phone' },
  department: { required: true },
  year: { required: true },
}), async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .insert([{ ...req.body, event_id: req.params.id }])
      .select();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'You have already registered for this event.' });
      }
      throw error;
    }
    res.status(201).json({ message: 'Registration successful! Check your email for QR code.', registration: data[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
