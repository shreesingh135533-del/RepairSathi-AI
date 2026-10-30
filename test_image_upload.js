const fs = require('fs');
const path = require('path');

async function testImageUpload() {
  console.log('Testing image upload diagnostic endpoint...');

  // Create a 1x1 dummy PNG in memory
  const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  const tempPath = path.resolve(__dirname, 'test_image.png');
  fs.writeFileSync(tempPath, dummyPng);

  const formData = new FormData();
  formData.append('category', 'smartphones');
  formData.append('deviceName', 'iPhone 13');
  formData.append('problemDescription', 'Cracked glass and touch screen is flickering green lines.');
  const fileBlob = new Blob([dummyPng], { type: 'image/png' });
  formData.append('image', fileBlob, 'test_image.png');

  const res = await fetch('http://localhost:5000/api/repair/diagnose', {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    throw new Error(`Upload test failed with status ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  console.log('Diagnosis with Image Success:', {
    conversationId: data.conversationId,
    summary: data.diagnosis.summary,
    imageUrl: data.imageUrl,
    difficulty: data.diagnosis.difficulty,
    cost: data.diagnosis.estimated_cost_range
  });

  // Clean up
  fs.unlinkSync(tempPath);
  console.log('✅ Image diagnostic test passed successfully!');
}

testImageUpload().catch(console.error);
