/**
 * Keep-Alive Service
 * 
 * Pings the Render backend every 4 minutes to prevent cold starts.
 * Render free tier sleeps after 15 min of inactivity.
 * This keeps latency under 2-3 seconds instead of 30+ seconds.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const PING_INTERVAL = 4 * 60 * 1000; // 4 minutes

let intervalId = null;

async function pingBackend() {
  try {
    const res = await fetch(`${API_BASE}/ping`, { method: 'GET' });
    if (res.ok) {
      console.log('[KeepAlive] Backend is alive ✓');
    }
  } catch (err) {
    console.warn('[KeepAlive] Ping failed — backend may be waking up');
  }
}

/**
 * Start the keep-alive ping loop.
 * Call this once when the app mounts.
 */
export function startKeepAlive() {
  if (intervalId) return; // already running

  // Ping immediately on app load (wakes backend if sleeping)
  pingBackend();

  // Then ping every 4 minutes
  intervalId = setInterval(pingBackend, PING_INTERVAL);
  console.log('[KeepAlive] Started — pinging every 4 min');
}

/**
 * Stop the ping loop (cleanup).
 */
export function stopKeepAlive() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[KeepAlive] Stopped');
  }
}
