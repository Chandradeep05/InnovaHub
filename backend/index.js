const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

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
const docEngineRoutes = require('./routes/docEngine');

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
app.use(express.json({ limit: '25mb' }));

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
app.use('/api/doc', docEngineRoutes);

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

// Registrations lookup (public, rate-limited)
app.get('/api/registrations', require('./middleware/rateLimiter'), async (req, res, next) => {
  const supabase = require('./config/db');
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    // Query registrations and join with events
    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        id,
        email,
        status,
        registration_date,
        events (
          title,
          event_date,
          category
        )
      `)
      .eq('email', email);

    if (error) throw error;

    // Map to the format the frontend expects
    const mapped = (data || []).map(reg => ({
      id: reg.id,
      event_title: reg.events?.title || 'Unknown Event',
      event_date: reg.events?.event_date || reg.registration_date,
      status: reg.status || 'Registered',
      event_category: reg.events?.category || 'Event',
    }));

    res.json(mapped);
  } catch (err) { next(err); }
});

// Admin Dashboard stats & activity feed (secured under auth middleware)
app.get('/api/admin/dashboard-stats', require('./middleware/auth'), async (req, res, next) => {
  const supabase = require('./config/db');
  try {
    const [eventsRes, ideasRes, registrationsRes, queriesRes] = await Promise.all([
      supabase.from('events').select('id, title, created_at', { count: 'exact' }),
      supabase.from('innovation_ideas').select('id, title, student_name, submitted_at', { count: 'exact' }),
      supabase.from('event_registrations').select('id, student_name, registration_date, events(title)', { count: 'exact' }),
      supabase.from('queries').select('id, name, subject, submitted_at, status', { count: 'exact' }),
    ]);

    if (eventsRes.error) throw eventsRes.error;
    if (ideasRes.error) throw ideasRes.error;
    if (registrationsRes.error) throw registrationsRes.error;
    if (queriesRes.error) throw queriesRes.error;

    // Build recent activities dynamically
    const activities = [];

    // Ideas activities
    (ideasRes.data || []).forEach(idea => {
      activities.push({
        text: `New idea pitched: "${idea.title}" by ${idea.student_name}`,
        timestamp: new Date(idea.submitted_at).getTime(),
        icon: 'fa-lightbulb',
        color: 'text-warning'
      });
    });

    // Registrations activities
    (registrationsRes.data || []).forEach(reg => {
      activities.push({
        text: `${reg.student_name} registered for "${reg.events?.title || 'an event'}"`,
        timestamp: new Date(reg.registration_date).getTime(),
        icon: 'fa-users',
        color: 'text-info'
      });
    });

    // Queries activities
    (queriesRes.data || []).forEach(q => {
      activities.push({
        text: `New query from ${q.name}: "${q.subject}"`,
        timestamp: new Date(q.submitted_at).getTime(),
        icon: 'fa-envelope',
        color: 'text-light'
      });
    });

    // Sort by timestamp descending
    activities.sort((a, b) => b.timestamp - a.timestamp);

    // Format human-friendly time elapsed helper
    const formatTimeAgo = (timestamp) => {
      const diffMs = Date.now() - timestamp;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      const diffDays = Math.floor(diffHrs / 24);
      return `${diffDays}d ago`;
    };

    const formattedActivities = activities.slice(0, 4).map(act => ({
      text: act.text,
      time: formatTimeAgo(act.timestamp),
      icon: act.icon,
      color: act.color
    }));

    const pendingQueriesCount = (queriesRes.data || []).filter(q => q.status === 'Pending').length;

    res.json({
      eventsCount: eventsRes.count || 0,
      ideasCount: ideasRes.count || 0,
      registrationsCount: registrationsRes.count || 0,
      pendingQueriesCount,
      activities: formattedActivities
    });
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
