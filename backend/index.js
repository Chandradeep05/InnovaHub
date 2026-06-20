const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

// Route modules
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const ideaRoutes = require('./routes/ideas');
const queryRoutes = require('./routes/queries');
const galleryRoutes = require('./routes/gallery');
const reportRoutes = require('./routes/reports');
const memberRoutes = require('./routes/members');
const emailRoutes = require('./routes/emails');

const app = express();

// ── Global Middleware ────────────────────────────
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      config.frontendUrl,
      'http://localhost:5173',
      'http://localhost:3000',
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in current phase; tighten later
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// ── Keep-Alive Ping (prevents Render cold start) ─
app.get('/ping', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

// ── Health Check ─────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Innovahub(IH) Backend is running!', timestamp: new Date().toISOString() });
});

// ── API Routes ───────────────────────────────────
app.use('/api/admin', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/photos', galleryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/admin/emails', emailRoutes);

// Legacy route compatibility (admin pages use /api/admin/queries etc.)
app.use('/api/admin/queries', require('./middleware/auth'), async (req, res, next) => {
  // Forward to queries route admin handler
  const supabase = require('./config/db');
  try {
    const { data, error } = await supabase.from('queries').select('*').order('submitted_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

app.use('/api/admin/ideas', require('./middleware/auth'), async (req, res, next) => {
  const supabase = require('./config/db');
  try {
    const { data, error } = await supabase.from('innovation_ideas').select('*').order('submitted_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

app.use('/api/admin/photos', require('./middleware/auth'), async (req, res, next) => {
  if (req.method === 'POST') {
    const supabase = require('./config/db');
    try {
      const { data, error } = await supabase.from('photos').insert([req.body]).select();
      if (error) throw error;
      res.status(201).json(data[0]);
    } catch (err) { next(err); }
  } else { next(); }
});

app.use('/api/admin/reports', require('./middleware/auth'), async (req, res, next) => {
  if (req.method === 'POST') {
    const supabase = require('./config/db');
    try {
      const { data, error } = await supabase.from('reports').insert([req.body]).select();
      if (error) throw error;
      res.status(201).json(data[0]);
    } catch (err) { next(err); }
  } else { next(); }
});

app.use('/api/admin/members', require('./middleware/auth'), async (req, res, next) => {
  if (req.method === 'POST') {
    const supabase = require('./config/db');
    try {
      const { data, error } = await supabase.from('members').insert([req.body]).select();
      if (error) throw error;
      res.status(201).json(data[0]);
    } catch (err) { next(err); }
  } else { next(); }
});

// Registrations (public submit)
app.post('/api/registrations', async (req, res, next) => {
  const supabase = require('./config/db');
  try {
    const { data, error } = await supabase.from('event_registrations').insert([req.body]).select();
    if (error) throw error;
    res.status(201).json({ message: 'Registration successful!', registration: data[0] });
  } catch (err) { next(err); }
});

// ── 404 Handler ──────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// ── Global Error Handler (must be last) ──────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────
app.listen(config.port, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🚀 Innovahub(IH) Backend Running       ║
  ║   Port: ${config.port}                            ║
  ║   Mode: ${process.env.NODE_ENV || 'development'}                    ║
  ╚══════════════════════════════════════════╝
  `);
});
