/**
 * @module documentIdGenerator
 * @description Generates unique, human-readable document IDs for the Document Engine.
 * IDs follow the format `{PREFIX}{YEAR}-{SEQ}` (e.g., `XENO2026-001`)
 * with configurable prefix, count, and starting sequence number.
 */

/**
 * Generates an array of unique, human-readable document IDs.
 *
 * Each ID follows the format: `{PREFIX}{YEAR}-{SEQ}`
 * - `PREFIX` — a customizable string prefix (default: `"DOC"`)
 * - `YEAR` — the current 4-digit year
 * - `SEQ` — a zero-padded sequence number (minimum 3 digits)
 *
 * The zero-padding width automatically increases if the total count
 * exceeds 999 (e.g., 4 digits for counts up to 9999).
 *
 * @param {string} [prefix='DOC'] - The prefix string for each ID.
 * @param {number} [count=1] - The number of IDs to generate.
 * @param {number} [startFrom=1] - The starting sequence number (defaults to 1).
 * @returns {string[]} An array of generated document ID strings.
 *
 * @throws {Error} If count is not a positive integer.
 * @throws {Error} If startFrom is not a positive integer.
 *
 * @example
 * generateDocumentIds('XENO', 3);
 * // → ["XENO2026-001", "XENO2026-002", "XENO2026-003"]
 *
 * @example
 * generateDocumentIds('CERT', 2, 50);
 * // → ["CERT2026-050", "CERT2026-051"]
 *
 * @example
 * generateDocumentIds('ID', 1, 1500);
 * // → ["ID2026-1500"]  (4-digit padding since startFrom > 999)
 */
function generateDocumentIds(prefix = 'DOC', count = 1, startFrom = 1) {
  // Validate inputs
  if (typeof count !== 'number' || !Number.isInteger(count) || count < 1) {
    throw new Error(`Invalid count: "${count}". Must be a positive integer.`);
  }

  if (typeof startFrom !== 'number' || !Number.isInteger(startFrom) || startFrom < 1) {
    throw new Error(`Invalid startFrom: "${startFrom}". Must be a positive integer.`);
  }

  if (typeof prefix !== 'string') {
    throw new Error(`Invalid prefix: "${prefix}". Must be a string.`);
  }

  const year = new Date().getFullYear();
  const maxSeq = count + startFrom - 1;
  const padLen = Math.max(3, String(maxSeq).length);

  const ids = [];
  for (let i = 0; i < count; i++) {
    const seq = String(startFrom + i).padStart(padLen, '0');
    ids.push(`${prefix}${year}-${seq}`);
  }

  return ids;
}

module.exports = { generateDocumentIds };
