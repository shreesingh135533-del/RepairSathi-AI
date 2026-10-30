const assert = require('assert');

async function runTests() {
  console.log('=====================================================');
  console.log('🧪 RUNNING REPAIRSATHI LIVE COST ENGINE AUDIT SUITE');
  console.log('=====================================================');

  const BASE_URL = 'http://localhost:5000';

  // 1. Health check
  console.log('\n[Test 1] Health Check...');
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const healthData = await healthRes.json();
  assert.strictEqual(healthRes.status, 200);
  assert.strictEqual(healthData.status, 'healthy');
  console.log('✓ Health check passed');

  // 2. 15 Standard Repair Categories
  console.log('\n[Test 2] 15 Standard Repair Categories...');
  const compRes = await fetch(`${BASE_URL}/api/costs/components`);
  const compData = await compRes.json();
  assert.strictEqual(compRes.status, 200);
  assert(compData.components && compData.components.length >= 15);
  const compNames = compData.components.map(c => c.name);
  assert(compNames.includes('Display / Screen'));
  assert(compNames.includes('Battery'));
  assert(compNames.includes('Back Glass / Rear Panel'));
  assert(compNames.includes('Motherboard'));
  assert(compNames.includes('Water Damage Treatment / Cleaning'));
  console.log(`✓ 15 Categories verified (${compData.components.length} components available)`);

  // 3. Supported Cities
  console.log('\n[Test 3] Supported Cities in India...');
  const cityRes = await fetch(`${BASE_URL}/api/costs/cities`);
  const cityData = await cityRes.json();
  assert.strictEqual(cityRes.status, 200);
  assert(cityData.cities.includes('Delhi NCR'));
  assert(cityData.cities.includes('Mumbai'));
  assert(cityData.cities.includes('Bengaluru'));
  console.log(`✓ Supported cities verified (${cityData.cities.length} cities active)`);

  // 4. Query 1: Samsung Galaxy A14 5G Display in Delhi NCR (Tests >= 3 local quotes rule)
  console.log('\n[Test 4] Query: Galaxy A14 5G Screen in Delhi NCR (Multi-Quote Tier)...');
  const q1Res = await fetch(`${BASE_URL}/api/costs/query?brand=Samsung&model=Galaxy%20A14%205G&component=Display%20%2F%20Screen&city=Delhi%20NCR&warranty_status=out_of_warranty`);
  const q1Data = await q1Res.json();
  assert.strictEqual(q1Res.status, 200);

  // Check Official Tier
  assert(q1Data.official && q1Data.official.available);
  assert.strictEqual(q1Data.official.partPrice, 2750);
  assert.strictEqual(q1Data.official.labourPrice, 450);
  assert.strictEqual(q1Data.official.gstAmount, Math.round((2750 + 450) * 0.18));
  assert.strictEqual(q1Data.official.finalTotal, (2750 + 450) + Math.round((2750 + 450) * 0.18));
  console.log(`  - Official Tier: Part ₹${q1Data.official.partPrice} + Labour ₹${q1Data.official.labourPrice} + 18% GST ₹${q1Data.official.gstAmount} = Final ₹${q1Data.official.finalTotal}`);

  // Check Local Tier (Must have >= 3 quotes)
  assert(q1Data.local && q1Data.local.hasSufficientQuotes);
  assert(q1Data.local.quoteCount >= 3);
  assert(q1Data.local.minTotal > 0 && q1Data.local.maxTotal >= q1Data.local.minTotal);
  assert(q1Data.local.qualityBreakdown && q1Data.local.qualityBreakdown.length > 0);
  console.log(`  - Local Tier: ${q1Data.local.quoteCount} verified quotes found: Range ₹${q1Data.local.minTotal} – ₹${q1Data.local.maxTotal} (Avg ₹${q1Data.local.avgTotal})`);

  // Check RepairSathi Estimated Index
  assert(q1Data.estimate);
  assert.strictEqual(q1Data.estimate.label, 'Estimated price — not an official quotation');
  assert.strictEqual(q1Data.estimate.confidence, 'High');
  console.log(`  - RepairSathi Index: ₹${q1Data.estimate.amount} [${q1Data.estimate.confidence} Confidence: "${q1Data.estimate.label}"]`);
  console.log('✓ Query 1 passed with all 3 price tiers');

  // 5. Query 2: Apple iPhone 15 Battery (GST inclusive portal rate)
  console.log('\n[Test 5] Query: Apple iPhone 15 Battery (Apple India Support Verification)...');
  const q2Res = await fetch(`${BASE_URL}/api/costs/query?brand=Apple&model=iPhone%2015&component=Battery&city=Mumbai`);
  const q2Data = await q2Res.json();
  assert.strictEqual(q2Res.status, 200);
  assert(q2Data.official && q2Data.official.available);
  assert.strictEqual(q2Data.official.partPrice, 8800);
  assert(q2Data.official.sourceUrl.includes('apple.com'));
  console.log(`  - Apple Official Rate: ₹${q2Data.official.finalTotal} verified at ${q2Data.official.sourceUrl}`);
  console.log('✓ Query 2 Apple verification passed');

  // 6. Query 3: Strict < 3 Quotes Empty State Rule
  console.log('\n[Test 6] Strict Threshold Test: Galaxy S24 Ultra Screen in Patna (< 3 quotes in DB)...');
  const q3Res = await fetch(`${BASE_URL}/api/costs/query?brand=Samsung&model=Galaxy%20S24%20Ultra&component=Display%20%2F%20Screen&city=Patna`);
  const q3Data = await q3Res.json();
  assert.strictEqual(q3Res.status, 200);
  assert.strictEqual(q3Data.local.hasSufficientQuotes, false);
  assert.strictEqual(
    q3Data.local.notice,
    'No verified local repair quotations available for this model and location yet.'
  );
  console.log(`  - Verified exact required message: "${q3Data.local.notice}"`);
  console.log('✓ Query 3 threshold enforcement passed');

  // 7. Community Quote Submission
  console.log('\n[Test 7] Community Quote Submission API...');
  const subRes = await fetch(`${BASE_URL}/api/costs/submit-quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brand: 'Samsung',
      model: 'Galaxy S24 Ultra',
      component: 'Display / Screen',
      city: 'Pune',
      shop_name: 'FC Road Screen Clinic',
      address_locality: 'Shivajinagar, Pune',
      total_price: 11500,
      part_quality: 'Refurbished',
      warranty_days: 60,
      notes: 'OLED panel change test'
    })
  });
  const subData = await subRes.json();
  assert.strictEqual(subRes.status, 200);
  assert(subData.success);
  assert(subData.submissionId);
  console.log(`  - Submitted quote recorded with ID: ${subData.submissionId}`);
  console.log('✓ Quote submission passed');

  // 8. Admin Authentication & Pricing Management
  console.log('\n[Test 8] Admin Login & Pricing Panel...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@repairsathi.ai',
      password: 'admin123'
    })
  });
  const loginData = await loginRes.json();
  assert(loginData.token, 'Admin login failed');
  const adminToken = loginData.token;

  // Verify pending quotes queue
  const pendingRes = await fetch(`${BASE_URL}/api/admin/costs/quotes/pending`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const pendingData = await pendingRes.json();
  assert(Array.isArray(pendingData.quotes));
  const foundPending = pendingData.quotes.find(q => q.id === subData.submissionId);
  assert(foundPending, 'Submitted quote should be in pending verification queue');
  console.log(`  - Found pending quotation in admin queue: ${foundPending.shop_name} (₹${foundPending.total_price})`);

  // Approve the pending quote
  const approveRes = await fetch(`${BASE_URL}/api/admin/costs/quotes/${subData.submissionId}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({ action: 'approve', notes: 'Verified workshop audit invoice' })
  });
  const approveData = await approveRes.json();
  assert(approveData.success);
  console.log('  - Admin approved submitted quotation');

  // CSV Bulk Import Test
  console.log('\n[Test 9] Admin CSV Bulk Importer...');
  const csvContent = `brand,model,component,part_price,labour_price,variant,source_url
Realme,Realme 12 Pro,Display / Screen,4800,354,All Variants,https://www.realme.com/in/support/spare-parts-price
Motorola,G84 5G,Battery,1600,400,All Variants,https://en-in.support.motorola.com/app/answers/detail/a_id/133816/~/india-out-of-warranty-parts-price-list`;

  const csvRes = await fetch(`${BASE_URL}/api/admin/costs/import-csv`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({ csvContent })
  });
  const csvData = await csvRes.json();
  assert(csvData.success);
  assert(csvData.stats.totalProcessed >= 2);
  console.log(`  - CSV Import result: ${csvData.message}`);

  // Audit Logs Verification
  console.log('\n[Test 10] Admin Audit Logs...');
  const logRes = await fetch(`${BASE_URL}/api/admin/costs/audit-logs`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const logData = await logRes.json();
  assert(Array.isArray(logData.verifications));
  assert(logData.verifications.length > 0);
  console.log(`  - Audit log entries verified (${logData.verifications.length} admin actions recorded)`);

  console.log('\n=====================================================');
  console.log('🎉 ALL 10 TESTS PASSED — LIVE PRICING ENGINE 100% OPERATIONAL');
  console.log('=====================================================');
}

runTests().catch(err => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
