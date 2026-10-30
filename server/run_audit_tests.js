const BASE_URL = 'http://localhost:5000';
const fs = require('fs');
const path = require('path');

async function runAutonomousAuditTests() {
  console.log('======================================================================');
  console.log('🛠️ REPAIRSATHI AI — PHASE 9 COMPLETE AUTONOMOUS TEST SUITE (12/12)');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;
  const results = [];

  async function executeTest(testId, name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${testId}: ${name}`);
      passed++;
      results.push({ testId, name, status: 'PASSED' });
    } catch (err) {
      console.error(`❌ [FAIL] ${testId}: ${name}`);
      console.error(`   Error Details: ${err.message}`);
      failed++;
      results.push({ testId, name, status: 'FAILED', error: err.message });
    }
  }

  // TEST CASE 1: Valid Smartphone (Samsung + Galaxy S24)
  await executeTest('Test Case 1', 'Valid Smartphone Manufacturer & Model', async () => {
    const res = await fetch(`${BASE_URL}/api/devices/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'smartphones',
        brandName: 'Samsung',
        modelName: 'Galaxy S24'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.valid || data.status !== 'VERIFIED') {
      throw new Error(`Expected status VERIFIED but got ${data.status}`);
    }
    if (!data.brand?.name || !data.model?.name) {
      throw new Error('Missing verified brand or model in response');
    }
  });

  // TEST CASE 2: Invalid Model (Samsung + obviously nonexistent XYZ 999 Super Pro)
  await executeTest('Test Case 2', 'Invalid / Nonexistent Model', async () => {
    const res = await fetch(`${BASE_URL}/api/devices/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'smartphones',
        brandName: 'Samsung',
        modelName: 'XYZ 999 Super Pro'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== 'UNVERIFIED_MODEL') {
      throw new Error(`Expected UNVERIFIED_MODEL but got ${data.status}`);
    }
    if (data.isVerified === true) {
      throw new Error('Invented specifications detected! Should NOT be marked as verified.');
    }
  });

  // TEST CASE 3: Wrong Brand-Model Combination (Apple + Samsung Galaxy S24)
  await executeTest('Test Case 3', 'Wrong Brand-Model Combination Rejection', async () => {
    const res = await fetch(`${BASE_URL}/api/devices/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'smartphones',
        brandName: 'Apple',
        modelName: 'Galaxy S24'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.valid !== false || data.status !== 'MISMATCHED_BRAND_MODEL') {
      throw new Error(`Expected MISMATCHED_BRAND_MODEL rejection, got status: ${data.status}`);
    }
    if (!data.message.includes('Apple') || !data.message.includes('Samsung')) {
      throw new Error(`Message does not clearly explain the mismatch: "${data.message}"`);
    }
  });

  // TEST CASE 4: Autocomplete Suggestions (Brands & Models)
  await executeTest('Test Case 4', 'Autocomplete Brand & Model Filtering', async () => {
    // Brand search for "Sam"
    const brandRes = await fetch(`${BASE_URL}/api/devices/brands?category=smartphones&query=Sam`);
    const brandData = await brandRes.json();
    if (!brandData.brands?.some(b => b.name === 'Samsung')) {
      throw new Error('Samsung not returned when querying "Sam"');
    }

    // Model search for "Gal" under Samsung
    const modelRes = await fetch(`${BASE_URL}/api/devices/models?brandSlug=samsung&category=smartphones&query=Gal`);
    const modelData = await modelRes.json();
    if (!modelData.models?.length || !modelData.models.some(m => m.model_name.includes('Galaxy'))) {
      throw new Error('Galaxy models not returned when querying "Gal" under Samsung');
    }

    // Brand search for "App"
    const appleRes = await fetch(`${BASE_URL}/api/devices/brands?category=smartphones&query=App`);
    const appleData = await appleRes.json();
    if (!appleData.brands?.some(b => b.name === 'Apple')) {
      throw new Error('Apple not returned when querying "App"');
    }
  });

  // TEST CASE 5: Correct Image (Smartphone category with smartphone photo)
  await executeTest('Test Case 5', 'Relevant Image Verification (MATCHED)', async () => {
    // Construct a valid PNG buffer with reasonable dimensions
    const validPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9QzwAEjDAGYzMGACfT/xHzq2sYAAAAAElFTkSuQmCC',
      'base64'
    );
    // Pad to 6KB to simulate a real photo
    const padded = Buffer.concat([validPng, Buffer.alloc(6000, 0x20)]);
    const blob = new Blob([padded], { type: 'image/png' });

    const form = new FormData();
    form.append('category', 'smartphones');
    form.append('brand', 'Samsung');
    form.append('model', 'Galaxy S24');
    form.append('image', blob, 'samsung_phone_screen.png');

    const res = await fetch(`${BASE_URL}/api/repair/verify-image`, {
      method: 'POST',
      body: form
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.verification?.status !== 'MATCHED') {
      throw new Error(`Expected MATCHED status, got: ${data.verification?.status}`);
    }
  });

  // TEST CASE 6: Wrong Image (Select Smartphone, upload Laptop photo)
  await executeTest('Test Case 6', 'Mismatched Image Rejection (MISMATCHED)', async () => {
    const validPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9QzwAEjDAGYzMGACfT/xHzq2sYAAAAAElFTkSuQmCC',
      'base64'
    );
    const padded = Buffer.concat([validPng, Buffer.alloc(6000, 0x20)]);
    const blob = new Blob([padded], { type: 'image/png' });

    const form = new FormData();
    form.append('category', 'smartphones');
    form.append('brand', 'Samsung');
    form.append('model', 'Galaxy S24');
    form.append('image', blob, 'laptop_keyboard_damage.png');

    const res = await fetch(`${BASE_URL}/api/repair/verify-image`, {
      method: 'POST',
      body: form
    });
    const data = await res.json();
    if (data.verification?.status !== 'MISMATCHED') {
      throw new Error(`Expected MISMATCHED status, got: ${data.verification?.status}`);
    }

    // Now test that POST /api/repair/diagnose rejects the mismatched image
    const diagForm = new FormData();
    diagForm.append('category', 'smartphones');
    diagForm.append('brand', 'Samsung');
    diagForm.append('model', 'Galaxy S24');
    diagForm.append('problemDescription', 'Screen broken and touch unresponsive');
    diagForm.append('image', blob, 'laptop_keyboard_damage.png');

    const diagRes = await fetch(`${BASE_URL}/api/repair/diagnose`, {
      method: 'POST',
      body: diagForm
    });
    if (diagRes.status !== 422) {
      throw new Error(`Expected HTTP 422 Unprocessable Entity for mismatched image, got HTTP ${diagRes.status}`);
    }
  });

  // TEST CASE 7: Blurry / Low-res Image (UNCERTAIN status)
  await executeTest('Test Case 7', 'Blurry / Corrupted Image (UNCERTAIN)', async () => {
    // Only 20 bytes -> corrupted / unreadable
    const tinyBuffer = Buffer.from('corrupted');
    const blob = new Blob([tinyBuffer], { type: 'image/png' });

    const form = new FormData();
    form.append('category', 'smartphones');
    form.append('image', blob, 'blurry_shot.png');

    const res = await fetch(`${BASE_URL}/api/repair/verify-image`, {
      method: 'POST',
      body: form
    });
    const data = await res.json();
    if (data.verification?.status !== 'UNCERTAIN') {
      throw new Error(`Expected UNCERTAIN status for tiny/blurry image, got: ${data.verification?.status}`);
    }
  });

  // TEST CASE 8: Wrong File Type (PDF or text file rejection)
  await executeTest('Test Case 8', 'Unsupported File Type Safe Rejection', async () => {
    const textBlob = new Blob(['Not an image'], { type: 'application/pdf' });
    const form = new FormData();
    form.append('category', 'smartphones');
    form.append('image', textBlob, 'manual.pdf');

    const res = await fetch(`${BASE_URL}/api/repair/verify-image`, {
      method: 'POST',
      body: form
    });
    // Multer file filter rejects non-image with 500 or error
    if (res.ok) {
      const data = await res.json();
      if (data.verification?.status === 'MATCHED') {
        throw new Error('PDF file should NOT have been matched!');
      }
    }
  });

  // TEST CASE 9: Unknown / Unlisted Model Pathway
  await executeTest('Test Case 9', 'Unknown Model Unlisted Pathway', async () => {
    const res = await fetch(`${BASE_URL}/api/devices/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'smartphones',
        brandName: 'Samsung',
        modelName: 'Galaxy S25 Ultra Future'
      })
    });
    const data = await res.json();
    if (data.status !== 'UNVERIFIED_MODEL') {
      throw new Error(`Expected UNVERIFIED_MODEL, got: ${data.status}`);
    }
    if (!data.allowUnlisted) {
      throw new Error('Must provide pathway to proceed with unlisted device');
    }
  });

  // TEST CASE 10: Complete 10-Section Repair Diagnosis
  let testConversationId = '';
  await executeTest('Test Case 10', 'Intelligent 10-Section Repair Diagnosis', async () => {
    const res = await fetch(`${BASE_URL}/api/repair/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'smartphones',
        brand: 'Samsung',
        model: 'Galaxy S24',
        errorCode: '',
        problemDescription: 'Phone battery is draining from 100% to 10% in two hours and gets hot to the touch.'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const d = data.diagnosis;

    // Verify presence of all required structured fields
    if (!d.problem_identification) throw new Error('Missing problem_identification');
    if (!Array.isArray(d.possible_causes) || d.possible_causes.length === 0) throw new Error('Missing possible_causes');
    if (!d.most_likely_explanation) throw new Error('Missing most_likely_explanation');
    if (!d.confidence_and_uncertainty) throw new Error('Missing confidence_and_uncertainty');
    if (!Array.isArray(d.troubleshooting_steps) || d.troubleshooting_steps.length === 0) throw new Error('Missing troubleshooting_steps');
    if (!Array.isArray(d.tools_required)) throw new Error('Missing tools_required');
    if (!d.difficulty) throw new Error('Missing difficulty');
    if (!d.estimated_cost_range) throw new Error('Missing estimated_cost_range');
    if (!Array.isArray(d.safety_precautions)) throw new Error('Missing safety_precautions');
    if (!d.when_to_contact_professional) throw new Error('Missing when_to_contact_professional');

    testConversationId = data.conversationId;
  });

  // TEST CASE 11: Symptom & Error Code Catalogs
  await executeTest('Test Case 11', 'Symptom & Error Code Catalogs', async () => {
    // Symptom search
    const symRes = await fetch(`${BASE_URL}/api/devices/symptoms?category=smartphones&query=battery`);
    const symData = await symRes.json();
    if (!symData.symptoms?.length) {
      throw new Error('No symptoms returned for battery under smartphones');
    }

    // Error code search for washing machine (Samsung 4C)
    const errRes = await fetch(`${BASE_URL}/api/devices/error-codes?category=washing-machines&brand=samsung&query=4C`);
    const errData = await errRes.json();
    if (!errData.errorCodes?.some(e => e.code === '4C')) {
      throw new Error('Error code 4C not found in catalog');
    }
  });

  // TEST CASE 12: Existing Working Features Integrity
  await executeTest('Test Case 12', 'Existing System Integrity (Auth, Admin, History, Follow-up)', async () => {
    // 1. Admin login
    const adminRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@repairsathi.ai', password: 'admin123' })
    });
    if (!adminRes.ok) throw new Error('Admin login failed');
    const { token: adminToken } = await adminRes.json();

    // 2. Admin Stats
    const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!statsRes.ok) throw new Error('Admin stats failed');

    // 3. Follow up message on test conversation
    if (testConversationId) {
      const msgRes = await fetch(`${BASE_URL}/api/repair/conversations/${testConversationId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: 'Can I replace the battery at home safely?' })
      });
      if (!msgRes.ok) throw new Error('Follow up message failed');
    }
  });

  console.log('\n======================================================================');
  console.log(`📊 PHASE 9 TEST AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAutonomousAuditTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
