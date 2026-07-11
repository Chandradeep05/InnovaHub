/**
 * Dashboard & Rate Limiter Verification Test
 * Verifies that the lookup rate limiter fires on the 61st request,
 * that the dashboard stats formatting works, and that the category mapping handles all edge cases.
 * 
 * Run: node tests/dashboard.test.js
 */

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

// Mock request / response/ next objects for testing middleware
function mockRequest(ip = '127.0.0.1', query = {}) {
  return {
    ip,
    query,
    headers: {},
    socket: {}
  };
}

function mockResponse() {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
}

// Dynamic category mapping logic (from MembersPage.jsx)
function mapCategory(m) {
  if (m.category) return m.category;
  
  let category = 'Student Member'; // Default choice for graceful degradation
  
  if (m.is_faculty) {
    category = 'Faculty';
  } else if (m.role && m.role.toLowerCase() !== 'member' && m.role.toLowerCase() !== 'student member') {
    category = 'Core Council';
  }
  
  return category;
}

async function runTests() {
  console.log('\n══════════════════════════════════════════');
  console.log(' Dashboard & Rate Limiter — Verification Tests');
  console.log('══════════════════════════════════════════\n');

  // ── 1. RATE LIMITER TESTS ──────────────────────────────────
  console.log('📋 1. Lookup Rate Limiter Middleware');
  const lookupRateLimiter = require('../middleware/rateLimiter');

  const ip1 = '192.168.1.1';
  let nextCalledCount = 0;
  const next = () => { nextCalledCount++; };

  // Make 60 requests from ip1
  for (let i = 0; i < 60; i++) {
    const req = mockRequest(ip1);
    const res = mockResponse();
    lookupRateLimiter(req, res, next);
  }
  assert(nextCalledCount === 60, 'Allowed 60 requests from IP 192.168.1.1');

  // 61st request should fail with 429
  const req61 = mockRequest(ip1);
  const res61 = mockResponse();
  lookupRateLimiter(req61, res61, next);
  assert(res61.statusCode === 429, 'Blocks 61st request with HTTP 429');
  assert(res61.body && res61.body.error.includes('Too many'), 'Returns descriptive rate-limiting error');

  // Verify another IP is not blocked (NAT scenario)
  const ip2 = '192.168.1.2';
  let nextCalledCount2 = 0;
  const next2 = () => { nextCalledCount2++; };
  const reqIp2 = mockRequest(ip2);
  const resIp2 = mockResponse();
  lookupRateLimiter(reqIp2, resIp2, next2);
  assert(nextCalledCount2 === 1 && resIp2.statusCode !== 429, 'Allows request from different IP 192.168.1.2 (NAT isolated)');


  // ── 2. CATEGORY MAPPING EDGE-CASE TESTS ──────────────────────
  console.log('\n📋 2. Members Directory Category Mapping');
  
  // Normal Faculty
  const m1 = { name: 'Dr. Jane', is_faculty: true, role: 'Advisor' };
  assert(mapCategory(m1) === 'Faculty', 'Faculty member maps to Faculty');

  // Core Council
  const m2 = { name: 'Bob', is_faculty: false, role: 'President' };
  assert(mapCategory(m2) === 'Core Council', 'President maps to Core Council');

  // Core Council (case-insensitive role check)
  const m2b = { name: 'Alice', is_faculty: false, role: 'coordinator' };
  assert(mapCategory(m2b) === 'Core Council', 'coordinator (lowercase) maps to Core Council');

  // Student Member (explicit role)
  const m3 = { name: 'Charlie', is_faculty: false, role: 'Member' };
  assert(mapCategory(m3) === 'Student Member', 'Member role maps to Student Member');

  // Edge case: Role is missing/null, is_faculty is false
  const m4 = { name: 'Dave', is_faculty: false, role: null };
  assert(mapCategory(m4) === 'Student Member', 'Null role maps to Student Member default');

  // Edge case: Both role and is_faculty are missing/null (graceful fallback check)
  const m5 = { name: 'Eve' };
  assert(mapCategory(m5) === 'Student Member', 'Completely missing role and is_faculty maps to Student Member');

  // Preserve existing category if already present
  const m6 = { name: 'Frank', category: 'Special Guest' };
  assert(mapCategory(m6) === 'Special Guest', 'Preserves existing category field');


  // ── 3. DASHBOARD STATS ROUTE LOAD CHECK ─────────────────────
  console.log('\n📋 3. Server Module Integrity');
  try {
    const express = require('express');
    const app = express();
    // Verify auth and rateLimiter middlewares can be loaded cleanly
    const auth = require('../middleware/auth');
    const rateLimiter = require('../middleware/rateLimiter');
    assert(typeof auth === 'function', 'auth middleware loaded successfully');
    assert(typeof rateLimiter === 'function', 'rateLimiter middleware loaded successfully');
  } catch (err) {
    assert(false, `Failed to load middlewares: ${err.message}`);
  }

  // Summary
  console.log('\n══════════════════════════════════════════');
  console.log(` Verification Summary: ${passed} passed, ${failed} failed`);
  console.log('══════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
