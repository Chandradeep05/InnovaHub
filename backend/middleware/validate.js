/**
 * Middleware: Validate request body against a schema.
 * Schema is an object where keys = field names, values = { required, type, maxLength, pattern, patternMsg }
 *
 * Usage:
 *   router.post('/endpoint', validate({ name: { required: true, maxLength: 100 } }), handler);
 */
const validate = (schema) => (req, res, next) => {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = req.body[field];

    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors.push(`${field} is required`);
      continue;
    }

    if (value !== undefined && value !== null && value !== '') {
      if (rules.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push(`${field} must be a valid email address`);
      }

      if (rules.type === 'phone' && !/^[0-9]{10}$/.test(value)) {
        errors.push(`${field} must be a 10-digit phone number`);
      }

      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        errors.push(`${field} must be at most ${rules.maxLength} characters`);
      }

      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(rules.patternMsg || `${field} has an invalid format`);
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
};

module.exports = validate;
