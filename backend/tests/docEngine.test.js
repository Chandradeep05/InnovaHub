/**
 * Document Engine — Internal Verification Test
 * Tests every module (CSV parser, Document ID generator, Render Engine)
 * and verifies the route file loads cleanly.
 * 
 * Run: node tests/docEngine.test.js
 */

const { parseCSV, normalizeHeader } = require('../engine/csvParser');
const { generateDocumentIds } = require('../engine/documentIdGenerator');
const { renderDocument } = require('../engine/renderEngine');
const { BrevoProvider } = require('../engine/emailProvider');

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${label}`);
  } else {
    failed++;
    console.error(`  ❌ ${label}`);
  }
}

async function runTests() {
  console.log('\n══════════════════════════════════════════');
  console.log(' Document Engine — Verification Tests');
  console.log('══════════════════════════════════════════\n');

  // ── 1. normalizeHeader ──────────────────────────────────────
  console.log('📋 1. Header Normalization');
  assert(normalizeHeader('Blood Group') === 'blood_group', 'Blood Group → blood_group');
  assert(normalizeHeader('Roll No.') === 'roll_no', 'Roll No. → roll_no');
  assert(normalizeHeader('  First Name ') === 'first_name', '  First Name  → first_name');
  assert(normalizeHeader('EMAIL') === 'email', 'EMAIL → email');
  assert(normalizeHeader('student_id') === 'student_id', 'student_id unchanged');
  assert(normalizeHeader('Phone #') === 'phone', 'Phone # → phone');

  // ── 2. parseCSV ─────────────────────────────────────────────
  console.log('\n📋 2. CSV Parsing');
  
  const csv1 = 'Name,Email,Event\nRahul Sharma,rahul@gmail.com,Hackathon 2026\nPriya Singh,priya@gmail.com,Hackathon 2026';
  const result1 = parseCSV(csv1);
  assert(result1.headers.length === 3, `Headers found: ${result1.headers.length}`);
  assert(result1.normalizedHeaders.includes('email'), 'email column detected');
  assert(result1.rows.length === 2, `Rows found: ${result1.rows.length}`);
  assert(result1.rows[0].email === 'rahul@gmail.com', `Row 1 email: ${result1.rows[0].email}`);
  assert(result1.rows[0].merge_fields.name === 'Rahul Sharma', `Row 1 name: ${result1.rows[0].merge_fields.name}`);
  assert(result1.rows[1].merge_fields.event === 'Hackathon 2026', `Row 2 event: ${result1.rows[1].merge_fields.event}`);

  // Test: missing email column
  let threwMissingEmail = false;
  try { parseCSV('Name,Phone\nRahul,123'); } catch (e) { threwMissingEmail = true; }
  assert(threwMissingEmail, 'Throws on missing email column');

  // Test: empty CSV
  let threwEmpty = false;
  try { parseCSV(''); } catch (e) { threwEmpty = true; }
  assert(threwEmpty, 'Throws on empty CSV');

  // Test: header-only CSV
  let threwHeaderOnly = false;
  try { parseCSV('Name,Email'); } catch (e) { threwHeaderOnly = true; }
  assert(threwHeaderOnly, 'Throws on header-only CSV (no data rows)');

  // Test: complex headers with email_address variant
  const csv2 = 'Blood Group,Roll No.,Email Address\nO+,101,test@test.com';
  const result2 = parseCSV(csv2);
  assert(result2.normalizedHeaders.includes('blood_group'), 'Blood Group normalized');
  assert(result2.normalizedHeaders.includes('roll_no'), 'Roll No. normalized');
  assert(result2.normalizedHeaders.includes('email_address'), 'Email Address normalized');
  assert(result2.rows[0].email === 'test@test.com', `Email extracted from email_address column: ${result2.rows[0].email}`);

  // Test: tie-breaker — CSV with both 'Email' and 'Backup Email'
  const csv3 = 'Name,Email,Backup Email\nAlice,alice@main.com,alice@backup.com';
  const result3 = parseCSV(csv3);
  assert(result3.rows[0].email === 'alice@main.com', `Tie-breaker: exact 'email' wins over partial 'backup_email': ${result3.rows[0].email}`);

  // Test: tie-breaker — 'Backup Email' first, 'Email' second
  const csv4 = 'Backup Email,Name,Email\nalice@backup.com,Alice,alice@main.com';
  const result4 = parseCSV(csv4);
  assert(result4.rows[0].email === 'alice@main.com', `Tie-breaker column order: exact 'email' still wins: ${result4.rows[0].email}`);

  // ── 3. Document ID Generator ────────────────────────────────
  console.log('\n📋 3. Document ID Generator');
  const ids1 = generateDocumentIds('HACK', 5);
  assert(ids1.length === 5, `Generated ${ids1.length} IDs`);
  assert(ids1[0].startsWith('HACK'), `Prefix: ${ids1[0]}`);
  assert(ids1[0].includes(new Date().getFullYear().toString()), `Year included: ${ids1[0]}`);
  assert(ids1[4].endsWith('005'), `Last ID padded: ${ids1[4]}`);

  const ids2 = generateDocumentIds('X', 1000, 1);
  assert(ids2.length === 1000, `1000 IDs generated`);
  assert(ids2[999].endsWith('1000'), `ID 1000 padded: ${ids2[999]}`);

  // Unique check
  const idSet = new Set(ids2);
  assert(idSet.size === 1000, `All 1000 IDs unique`);

  // ── 4. Render Engine ────────────────────────────────────────
  console.log('\n📋 4. Render Engine (PDF Generation)');
  
  // Test: blank page (no background)
  const pdf1 = await renderDocument(null, [
    { key: 'name', x: 400, y: 200, fontSize: 36, fontFamily: 'Helvetica-Bold', color: '#1a1a1a', alignment: 'center' },
    { key: 'event', x: 400, y: 280, fontSize: 20, fontFamily: 'Helvetica', color: '#333333', alignment: 'center' },
  ], { name: 'Test User', event: 'Test Event' });
  
  assert(Buffer.isBuffer(pdf1), 'Returns Buffer');
  assert(pdf1.length > 100, `PDF size: ${pdf1.length} bytes`);
  // Check PDF magic bytes
  const pdfHeader = pdf1.slice(0, 5).toString();
  assert(pdfHeader === '%PDF-', `Valid PDF header: ${pdfHeader}`);

  // Test: empty merge fields (should not crash)
  const pdf2 = await renderDocument(null, [
    { key: 'name', x: 100, y: 100, fontSize: 24 },
  ], {});
  assert(Buffer.isBuffer(pdf2), 'Handles empty merge fields gracefully');

  // Test: all font families
  const allFonts = ['Helvetica', 'Helvetica-Bold', 'Helvetica-Italic', 'Times-Roman', 'Times-Bold', 'Times-Italic', 'Courier', 'Courier-Bold'];
  for (const fontFamily of allFonts) {
    const pdfF = await renderDocument(null, [
      { key: 'text', x: 100, y: 100, fontSize: 18, fontFamily },
    ], { text: `Font: ${fontFamily}` });
    assert(Buffer.isBuffer(pdfF), `Font works: ${fontFamily}`);
  }

  // Test: alignments
  for (const alignment of ['left', 'center', 'right']) {
    const pdfA = await renderDocument(null, [
      { key: 'text', x: 400, y: 200, fontSize: 24, alignment },
    ], { text: `Aligned ${alignment}` });
    assert(Buffer.isBuffer(pdfA), `Alignment works: ${alignment}`);
  }

  // Test: custom dimensions
  const pdf3 = await renderDocument(null, [
    { key: 'text', x: 500, y: 200, fontSize: 24 },
  ], { text: 'Custom Size' }, { width: 1000, height: 700 });
  assert(Buffer.isBuffer(pdf3), 'Custom page dimensions work');

  // Test: invalid merge fields type
  let threwInvalid = false;
  try { await renderDocument(null, [], null); } catch (e) { threwInvalid = true; }
  assert(threwInvalid, 'Throws on null mergeFields');

  // ── 5. Email Provider (structure check, no actual send) ─────
  console.log('\n📋 5. Email Provider (Structure Check)');
  const provider = new BrevoProvider();
  assert(typeof provider.send === 'function', 'send() method exists');
  assert(provider.maxRetries === 3, `maxRetries: ${provider.maxRetries}`);
  assert(provider.baseDelay === 1000, `baseDelay: ${provider.baseDelay}ms`);
  
  // Test: missing recipient
  const r1 = await provider.send('', 'Subject', 'Body');
  assert(!r1.success, 'Rejects empty recipient');
  
  // Test: missing subject
  const r2 = await provider.send('test@test.com', '', 'Body');
  assert(!r2.success, 'Rejects empty subject');

  // ── 6. Route module loads ───────────────────────────────────
  console.log('\n📋 6. Route Module');
  try {
    const router = require('../routes/docEngine');
    assert(typeof router === 'function', 'Router exports a function (Express router)');
    assert(router.stack && router.stack.length > 0, `Route stack has ${router.stack.length} entries`);
  } catch (e) {
    assert(false, `Router failed to load: ${e.message}`);
  }

  // ── Summary ─────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════');
  console.log(` Results: ${passed} passed, ${failed} failed`);
  console.log('══════════════════════════════════════════\n');
  
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Test runner crashed:', err);
  process.exit(1);
});
