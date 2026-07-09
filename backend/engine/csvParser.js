/**
 * @module csvParser
 * @description CSV parsing with automatic placeholder detection for the Document Engine.
 * Parses CSV strings, normalizes headers to snake_case, validates required columns,
 * and returns structured row data ready for mail-merge operations.
 */

const { parse } = require('csv-parse/sync');

/**
 * Normalizes a CSV header string to a consistent snake_case identifier.
 *
 * @param {string} header - The raw CSV header string.
 * @returns {string} The normalized snake_case header.
 *
 * @example
 * normalizeHeader("Blood Group")   // → "blood_group"
 * normalizeHeader("Roll No.")      // → "roll_no"
 * normalizeHeader("  First Name ") // → "first_name"
 */
function normalizeHeader(header) {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Parses a CSV string and returns structured data with normalized headers.
 *
 * - Automatically normalizes all headers to snake_case identifiers.
 * - Validates that an `email` column exists (case-insensitive match).
 * - Each row is returned with its `email` extracted and remaining fields
 *   grouped under `merge_fields` for template rendering.
 *
 * @param {string} csvString - The raw CSV content as a string.
 * @returns {{ headers: string[], normalizedHeaders: string[], rows: Array<{ email: string, merge_fields: Object }> }}
 *
 * @throws {Error} If csvString is empty or not a string.
 * @throws {Error} If the CSV contains no data rows.
 * @throws {Error} If no `email` column is found in the headers.
 *
 * @example
 * const result = parseCSV("Name,Email\nRahul,rahul@example.com");
 * // result.rows[0].email === "rahul@example.com"
 * // result.rows[0].merge_fields === { name: "Rahul", email: "rahul@example.com" }
 */
function parseCSV(csvString) {
  // Validate input
  if (!csvString || typeof csvString !== 'string') {
    throw new Error('CSV input is empty or not a string. Please provide valid CSV content.');
  }

  const trimmed = csvString.trim();
  if (trimmed.length === 0) {
    throw new Error('CSV input is empty. Please provide CSV content with headers and at least one data row.');
  }

  // Parse CSV with csv-parse/sync
  let records;
  try {
    records = parse(trimmed, {
      columns: false,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });
  } catch (err) {
    throw new Error(`Failed to parse CSV: ${err.message}`);
  }

  if (records.length === 0) {
    throw new Error('CSV contains no data. Please provide CSV content with headers and at least one data row.');
  }

  // First row is headers
  const rawHeaders = records[0];
  if (!rawHeaders || rawHeaders.length === 0) {
    throw new Error('CSV contains no headers. The first row must contain column names.');
  }

  const headers = rawHeaders.map((h) => h.trim());
  const normalizedHeaders = headers.map(normalizeHeader);

  // Validate: email column must exist — accept 'email', 'email_address', 'e_mail', or any containing 'email'
  let emailIndex = normalizedHeaders.indexOf('email');
  if (emailIndex === -1) emailIndex = normalizedHeaders.indexOf('email_address');
  if (emailIndex === -1) emailIndex = normalizedHeaders.indexOf('e_mail');
  if (emailIndex === -1) emailIndex = normalizedHeaders.findIndex(h => h.includes('email'));
  if (emailIndex === -1) {
    throw new Error(
      `Missing required "email" column. Found columns: [${headers.join(', ')}]. ` +
        'Please ensure your CSV has a column named "Email" (case-insensitive).'
    );
  }

  // Extract data rows (everything after the header row)
  const dataRows = records.slice(1);
  if (dataRows.length === 0) {
    throw new Error('CSV contains headers but no data rows. Please add at least one data row.');
  }

  // Build structured rows
  const rows = dataRows.map((row, rowIndex) => {
    const email = (row[emailIndex] || '').trim();
    if (!email) {
      console.warn(`⚠️  Row ${rowIndex + 2} has an empty email field — it will still be included.`);
    }

    // Build merge_fields as a flat object of all normalizedHeader:value pairs
    const merge_fields = {};
    normalizedHeaders.forEach((normHeader, colIndex) => {
      merge_fields[normHeader] = (row[colIndex] || '').trim();
    });

    return { email, merge_fields };
  });

  return { headers, normalizedHeaders, rows };
}

module.exports = { parseCSV, normalizeHeader };
