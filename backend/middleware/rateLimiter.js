/**
 * NAT-Safe In-Memory Rate Limiter for Public Lookups
 * Limits requests per IP to accommodate shared hostel/lab NAT configurations.
 * 
 * Default: 60 requests per 15 minutes per IP.
 */

const lookupLimits = new Map();

const lookupRateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  const limitWindow = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 60; // NAT-safe ceiling: 60 lookups per IP per 15 mins

  if (!lookupLimits.has(ip)) {
    lookupLimits.set(ip, { count: 1, resetTime: now + limitWindow });
    return next();
  }

  const limit = lookupLimits.get(ip);
  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + limitWindow;
    return next();
  }

  limit.count++;
  if (limit.count > maxRequests) {
    return res.status(429).json({ 
      error: 'Too many lookup requests. Please try again after 15 minutes.' 
    });
  }

  next();
};

module.exports = lookupRateLimiter;
