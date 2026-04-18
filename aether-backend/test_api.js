/**
 * Aether API Integration Test
 * Tests the full approval + notification lifecycle
 * Run with: node test_api.js
 */
const http = require('http');

const BASE = 'http://localhost:3000';

function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const STUDENT_HEADERS = {
  Authorization: 'Bearer MOCK_TOKEN',
  'x-mock-role': 'STUDENT',
};
const FACULTY_HEADERS = {
  Authorization: 'Bearer MOCK_TOKEN',
  'x-mock-role': 'FACULTY',
};
const PROFESSOR_HEADERS = {
  Authorization: 'Bearer MOCK_TOKEN',
  'x-mock-role': 'PROFESSOR',
};

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, label) {
    if (condition) {
      console.log(`  ✅ ${label}`);
      passed++;
    } else {
      console.log(`  ❌ ${label}`);
      failed++;
    }
  }

  console.log('\n=== TEST 1: Health Check ===');
  const health = await request('GET', '/health');
  assert(health.status === 200, `Health returns 200 (got ${health.status})`);

  console.log('\n=== TEST 2: Student creates approval ===');
  const createRes = await request('POST', '/api/approvals', {
    type: 'Leave',
    content: JSON.stringify({ reason: 'Medical leave' }),
  }, STUDENT_HEADERS);
  console.log(`  Status: ${createRes.status}, Body:`, JSON.stringify(createRes.body).slice(0, 200));
  assert(createRes.status === 201, `POST /api/approvals returns 201 (got ${createRes.status})`);
  assert(createRes.body?.id, `Approval has an id`);
  assert(createRes.body?.status === 'PENDING_PROFESSOR', `Status is PENDING_PROFESSOR (got ${createRes.body?.status})`);
  const approvalId = createRes.body?.id;

  console.log('\n=== TEST 3: Student can GET own approvals ===');
  const studentList = await request('GET', '/api/approvals', null, STUDENT_HEADERS);
  assert(studentList.status === 200, `GET /api/approvals returns 200 (got ${studentList.status})`);
  assert(Array.isArray(studentList.body), `Response is an array`);
  const found = studentList.body?.find?.((a) => a.id === approvalId);
  assert(!!found, `Created approval found in student's list`);

  console.log('\n=== TEST 4: Faculty (as FACULTY role) can GET approvals ===');
  const facultyList = await request('GET', '/api/approvals', null, FACULTY_HEADERS);
  assert(facultyList.status === 200, `GET /api/approvals returns 200 for FACULTY (got ${facultyList.status})`);
  console.log(`  Faculty sees ${facultyList.body?.length ?? 0} approvals`);
  const facultyFound = facultyList.body?.find?.((a) => a.id === approvalId);
  assert(!!facultyFound, `Faculty can see the student's approval`);

  console.log('\n=== TEST 5: Professor (as PROFESSOR role) can GET approvals ===');
  const profList = await request('GET', '/api/approvals', null, PROFESSOR_HEADERS);
  assert(profList.status === 200, `GET /api/approvals returns 200 for PROFESSOR (got ${profList.status})`);
  const profFound = profList.body?.find?.((a) => a.id === approvalId);
  assert(!!profFound, `Professor can see the student's approval`);

  console.log('\n=== TEST 6: Faculty (as FACULTY) tries to advance approval ===');
  if (approvalId) {
    const advanceFaculty = await request('PATCH', `/api/approvals/${approvalId}/advance`, {}, FACULTY_HEADERS);
    console.log(`  Status: ${advanceFaculty.status}, Body:`, JSON.stringify(advanceFaculty.body).slice(0, 200));
    assert(advanceFaculty.status === 200, `PATCH advance returns 200 for FACULTY (got ${advanceFaculty.status})`);
  }

  console.log('\n=== TEST 7: Professor (as PROFESSOR) tries to advance approval ===');
  // Create a fresh one to test with PROFESSOR
  const create2 = await request('POST', '/api/approvals', {
    type: 'Room Booking',
    content: JSON.stringify({ reason: 'Conference room' }),
  }, STUDENT_HEADERS);
  assert(create2.status === 201, `Second approval created (got ${create2.status})`);
  const approvalId2 = create2.body?.id;

  if (approvalId2) {
    const advanceProf = await request('PATCH', `/api/approvals/${approvalId2}/advance`, {}, PROFESSOR_HEADERS);
    console.log(`  Status: ${advanceProf.status}, Body:`, JSON.stringify(advanceProf.body).slice(0, 200));
    assert(advanceProf.status === 200, `PATCH advance returns 200 for PROFESSOR (got ${advanceProf.status})`);
    assert(advanceProf.body?.status === 'PENDING_HOD', `Status advanced to PENDING_HOD (got ${advanceProf.body?.status})`);
  }

  console.log('\n=== TEST 8: Notification created for student on advance ===');
  const notifs = await request('GET', '/api/notifications', null, STUDENT_HEADERS);
  assert(notifs.status === 200, `GET /api/notifications returns 200 (got ${notifs.status})`);
  assert(notifs.body?.length > 0, `Student has notifications (count: ${notifs.body?.length})`);

  console.log('\n=== TEST 9: Reject approval ===');
  const create3 = await request('POST', '/api/approvals', {
    type: 'Fee Waiver',
    content: JSON.stringify({ reason: 'Financial hardship' }),
  }, STUDENT_HEADERS);
  assert(create3.status === 201, `Third approval created`);
  if (create3.body?.id) {
    const rejectRes = await request('PATCH', `/api/approvals/${create3.body.id}/reject`, {}, PROFESSOR_HEADERS);
    assert(rejectRes.status === 200, `Reject returns 200 (got ${rejectRes.status})`);
    assert(rejectRes.body?.status === 'REJECTED', `Status is REJECTED (got ${rejectRes.body?.status})`);
  }

  console.log('\n=== TEST 10: Ticket flow ===');
  const ticketRes = await request('POST', '/api/tickets', {
    title: 'Broken projector',
    description: 'Projector in A-104 not working',
    location: 'Room A-104',
  }, STUDENT_HEADERS);
  console.log(`  Ticket create status: ${ticketRes.status}`);
  assert(ticketRes.status === 201, `POST /api/tickets returns 201 (got ${ticketRes.status})`);

  console.log(`\n=============================`);
  console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed}`);
  console.log(`=============================\n`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
