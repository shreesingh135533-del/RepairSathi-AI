const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING AUTONOMOUS REPAIRSATHI FULL-STACK TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Health check
  await test('Health check endpoint /api/health', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== 'healthy') throw new Error('Unhealthy status');
  });

  // 2. Frontend landing page delivery
  await test('Frontend HTML delivery on root /', async () => {
    const res = await fetch(`${BASE_URL}/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    if (!html.includes('RepairSathi AI')) throw new Error('Title not found in HTML');
  });

  // 3. User Login
  let userToken = '';
  await test('User login with demo credentials', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@repairsathi.ai', password: 'user123' })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.token) throw new Error('No token returned');
    userToken = data.token;
  });

  // 4. Admin Login
  let adminToken = '';
  await test('Admin login with admin credentials', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@repairsathi.ai', password: 'admin123' })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.user?.role !== 'admin') throw new Error('Not admin role');
    adminToken = data.token;
  });

  // 5. Categories fetch
  await test('Fetch categories /api/categories', async () => {
    const res = await fetch(`${BASE_URL}/api/categories`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.categories || data.categories.length < 5) throw new Error('Missing categories');
  });

  // 6. Knowledge base fetch & search
  await test('Knowledge Base search /api/knowledge-base', async () => {
    const res = await fetch(`${BASE_URL}/api/knowledge-base?search=charging`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.articles || data.articles.length === 0) throw new Error('No articles found');
  });

  // 7. Normal Diagnostic Query (Laptop overheating)
  let convId = '';
  await test('AI Diagnosis: Standard problem (Laptop overheating)', async () => {
    const res = await fetch(`${BASE_URL}/api/repair/diagnose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        category: 'laptops-computers',
        deviceName: 'Dell Inspiron 15',
        model: '3520',
        errorCode: '',
        problemDescription: 'My laptop fan is spinning very fast and bottom base is burning hot during normal browsing.'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.diagnosis?.troubleshooting_steps || data.diagnosis.troubleshooting_steps.length === 0) {
      throw new Error('Diagnosis missing troubleshooting steps');
    }
    if (!data.diagnosis?.estimated_cost_range) {
      throw new Error('Diagnosis missing estimated cost range');
    }
    convId = data.conversationId;
  });

  // 8. Safety Hazard Diagnostic Query (Microwave sparking & smoking)
  await test('Safety System: Critical emergency detection (Smoke & sparks)', async () => {
    const res = await fetch(`${BASE_URL}/api/repair/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'kitchen-appliances',
        deviceName: 'Microwave Oven',
        problemDescription: 'The microwave started smoking and threw big sparks from the inside!'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.diagnosis?.safety_alert?.isCritical) {
      throw new Error('Critical safety hazard was NOT detected!');
    }
    if (data.diagnosis.severity !== 'Critical') {
      throw new Error('Severity level should be Critical');
    }
  });

  // 9. Follow-up Message
  await test('Follow-up conversation retaining context', async () => {
    if (!convId) throw new Error('No active conversation ID from previous test');
    const res = await fetch(`${BASE_URL}/api/repair/conversations/${convId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        question: 'I tried cleaning the vents with compressed air, what should I check next?'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.message?.content) throw new Error('Missing follow up response content');
  });

  // 10. User Feedback
  await test('Record user feedback and satisfaction rating', async () => {
    const res = await fetch(`${BASE_URL}/api/repair/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        conversationId: convId,
        rating: 5,
        comment: 'Very helpful and safe step-by-step guidance!'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  // 11. Admin Statistics
  await test('Admin stats retrieval /api/admin/stats', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.stats?.totalUsers === undefined) throw new Error('Missing totalUsers in stats');
    if (data.categoryStats?.length === 0) throw new Error('Missing categoryStats breakdown');
  });

  // 12. Admin Users List
  await test('Admin users management /api/admin/users', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.users)) throw new Error('Users is not an array');
  });

  console.log('\n====================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Test execution fatal error:', err);
  process.exit(1);
});
