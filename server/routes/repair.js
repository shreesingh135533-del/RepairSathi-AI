const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const { run, get, all } = require('../db');
const { diagnoseWithAI, generateFollowUpResponse } = require('../aiService');
const { lookupVerifiedRepairPricing } = require('../pricingEngine');
const { verifyDeviceImage } = require('../imageVerifier');
const { validateProblemDescription } = require('../textValidator');
const { authenticateToken } = require('./auth');

// Multer storage configuration
const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `device-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG and WebP images are supported. File rejected.'));
    }
  }
});

// POST /api/repair/verify-image - Pre-Diagnosis Image Verification
router.post('/verify-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'UNCERTAIN',
        isValid: false,
        message: 'No image file uploaded.'
      });
    }

    const { category, brand, model, problemDescription } = req.body;

    const verification = await verifyDeviceImage({
      imagePath: req.file.path,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      category: category || 'Smartphones',
      brand: brand || '',
      model: model || '',
      problemDescription: problemDescription || ''
    });

    res.json({
      verification,
      imageUrl: `/uploads/${req.file.filename}`,
      filename: req.file.filename
    });
  } catch (err) {
    console.error('Image verification error:', err);
    res.status(500).json({
      status: 'UNCERTAIN',
      isValid: false,
      message: 'Failed to verify image: ' + err.message
    });
  }
});

// Optional upload middleware for backward compatibility (no longer required)
const optionalUpload = (req, res, next) => {
  if (req.is('multipart/form-data')) {
    upload.single('image')(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  } else {
    next();
  }
};

// POST /api/repair/validate-problem - Semantic Problem Description Validation
router.post('/validate-problem', (req, res) => {
  const { problemDescription } = req.body;
  const result = validateProblemDescription(problemDescription);
  res.json(result);
});

// POST /api/repair/diagnose - 100% Streamlined Text & Symptom Diagnosis (No Image Required)
router.post('/diagnose', authenticateToken, optionalUpload, async (req, res) => {
  try {
    const {
      category,
      brand,
      deviceName,
      model,
      errorCode,
      problemDescription,
      allowUnverifiedModel
    } = req.body;

    // 0. Semantic problem description validation
    const textValidation = validateProblemDescription(problemDescription);
    if (textValidation.status === 'INVALID') {
      return res.status(400).json({
        error: textValidation.message || 'Invalid problem description. Please describe a real problem with your device.',
        code: 'INVALID_PROBLEM_DESCRIPTION',
        validation: textValidation
      });
    }
    if (textValidation.status === 'NEEDS_CLARIFICATION') {
      return res.status(400).json({
        error: textValidation.message || 'Could you provide a little more detail? Explain what your device is doing (e.g. screen dark, battery draining, not charging).',
        code: 'PROBLEM_NEEDS_CLARIFICATION',
        validation: textValidation
      });
    }

    const cleanCategory = (category || 'other-electronics').toLowerCase().trim();
    const cleanBrand = (brand || deviceName || '').trim();
    const cleanModel = (model || '').trim();

    // 1. Strict Backend Brand-Model Relationship Validation
    if (cleanBrand && cleanModel) {
      // Check if the Model is registered to a DIFFERENT brand
      const conflictingModel = await get(
        `SELECT dm.*, b.name as actual_brand_name, b.slug as actual_brand_slug
         FROM device_models dm
         JOIN brands b ON dm.brand_id = b.id
         WHERE (LOWER(dm.model_name) = ? OR LOWER(dm.model_number) = ?)
         AND LOWER(b.name) != ? AND LOWER(b.slug) != ?`,
        [cleanModel.toLowerCase(), cleanModel.toLowerCase(), cleanBrand.toLowerCase(), cleanBrand.toLowerCase()]
      );

      if (conflictingModel) {
        return res.status(400).json({
          error: `Your selected model "${cleanModel}" does not match the selected brand "${cleanBrand}". Please choose a valid ${cleanBrand} model.`,
          code: 'MISMATCHED_BRAND_MODEL',
          expectedBrand: conflictingModel.actual_brand_name
        });
      }
    }

    // 2. Strict Error Code Verification (if provided)
    let verifiedErrorCode = null;
    if (errorCode && errorCode.trim()) {
      const cleanCode = errorCode.trim().toUpperCase();
      verifiedErrorCode = await get(
        'SELECT * FROM error_codes WHERE UPPER(code) = ? AND (category_slug = ? OR category_slug IS NULL)',
        [cleanCode, cleanCategory]
      );

      // If user entered an error code but it cannot be verified in the catalogue
      if (!verifiedErrorCode) {
        return res.status(400).json({
          error: "Error code not recognized. Please verify the code or remove it if you don't have one.",
          code: 'UNRECOGNIZED_ERROR_CODE',
          unrecognizedCode: errorCode.trim()
        });
      }
    }

    // 3. Run AI Diagnosis with full context (100% photo-free)
    const diagnosis = await diagnoseWithAI({
      category: category || 'Other Electronics',
      brand: cleanBrand,
      deviceName: cleanBrand || deviceName || 'Generic Device',
      model: cleanModel,
      errorCode: errorCode || '',
      verifiedErrorCode,
      problemDescription: problemDescription.trim(),
      imagePath: null,
      imageVerification: null,
      allowUnverifiedModel: Boolean(allowUnverifiedModel)
    });

    // 4. Retrieve Source-Backed Verified Repair Price from Dedicated Pricing Engine
    // (Never uses AI hallucinations or hardcoded generic ranges)
    const verifiedPricing = await lookupVerifiedRepairPricing({
      brand: cleanBrand,
      model: cleanModel,
      component: diagnosis.suspected_component,
      repairMethod: diagnosis.recommended_repair_method,
      faultType: diagnosis.fault_type,
      isElectricalSuspicion: diagnosis.is_electrical_suspicion,
      city: 'Delhi NCR'
    });
    diagnosis.verified_pricing = verifiedPricing;

    const conversationId = randomUUID();
    const userId = req.user ? req.user.id : null;
    const title = `${cleanBrand ? cleanBrand + ' ' : ''}${cleanModel || category || 'Device'}: ${problemDescription.slice(0, 40)}...`;

    // Persist conversation
    await run(
      `INSERT INTO conversations (
        id, user_id, title, category_slug, brand, device_name, model,
        error_code, problem_description, image_url, image_verification_status, image_verification_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        conversationId,
        userId,
        title,
        cleanCategory,
        cleanBrand,
        cleanBrand || 'Device',
        cleanModel,
        errorCode || '',
        problemDescription.trim(),
        null,
        null,
        null
      ]
    );

    // Persist user initial query message
    const userMsgId = randomUUID();
    await run(
      'INSERT INTO messages (id, conversation_id, sender, content) VALUES (?, ?, ?, ?)',
      [userMsgId, conversationId, 'user', problemDescription.trim()]
    );

    // Persist assistant diagnosis
    const assistantMsgId = randomUUID();
    await run(
      'INSERT INTO messages (id, conversation_id, sender, content, diagnosis_json) VALUES (?, ?, ?, ?, ?)',
      [assistantMsgId, conversationId, 'assistant', diagnosis.summary, JSON.stringify(diagnosis)]
    );

    res.json({
      conversationId,
      diagnosis,
      title
    });
  } catch (error) {
    console.error('Diagnosis error:', error);
    res.status(500).json({ error: 'Failed to process diagnostic request. Please try again.' });
  }
});

// GET /api/repair/conversations - List user's conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const search = req.query.search ? `%${req.query.search}%` : null;

    let query = 'SELECT * FROM conversations WHERE 1=1';
    const params = [];

    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    } else {
      query += ' AND user_id IS NULL';
    }

    if (search) {
      query += ' AND (title LIKE ? OR problem_description LIKE ? OR device_name LIKE ? OR brand LIKE ? OR model LIKE ?)';
      params.push(search, search, search, search, search);
    }

    query += ' ORDER BY created_at DESC LIMIT 50';

    const conversations = await all(query, params);
    res.json({ conversations });
  } catch (err) {
    console.error('Fetch conversations error:', err);
    res.status(500).json({ error: 'Failed to retrieve repair history' });
  }
});

// GET /api/repair/conversations/:id - Retrieve single conversation with messages
router.get('/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const conversation = await get('SELECT * FROM conversations WHERE id = ?', [req.params.id]);
    if (!conversation) {
      return res.status(404).json({ error: 'Repair session not found' });
    }

    const messages = await all(
      'SELECT id, sender, content, diagnosis_json, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [req.params.id]
    );

    const formattedMessages = messages.map(msg => ({
      ...msg,
      diagnosis: msg.diagnosis_json ? JSON.parse(msg.diagnosis_json) : null
    }));

    res.json({
      conversation,
      messages: formattedMessages
    });
  } catch (err) {
    console.error('Fetch conversation details error:', err);
    res.status(500).json({ error: 'Failed to retrieve conversation details' });
  }
});

// POST /api/repair/conversations/:id/message - Follow-up conversation
router.post('/conversations/:id/message', authenticateToken, async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question cannot be empty' });
    }

    const conversation = await get('SELECT * FROM conversations WHERE id = ?', [req.params.id]);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Insert user question
    const userMsgId = randomUUID();
    await run(
      'INSERT INTO messages (id, conversation_id, sender, content) VALUES (?, ?, ?, ?)',
      [userMsgId, conversation.id, 'user', question.trim()]
    );

    // Retrieve conversation history
    const history = await all(
      'SELECT sender, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversation.id]
    );

    // Generate AI response
    const { reply, engine } = await generateFollowUpResponse({
      conversation,
      history,
      userQuestion: question.trim()
    });

    // Insert assistant response
    const assistantMsgId = randomUUID();
    await run(
      'INSERT INTO messages (id, conversation_id, sender, content) VALUES (?, ?, ?, ?)',
      [assistantMsgId, conversation.id, 'assistant', reply]
    );

    // Update conversation timestamp
    await run('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [conversation.id]);

    res.json({
      message: {
        id: assistantMsgId,
        sender: 'assistant',
        content: reply,
        created_at: new Date().toISOString()
      },
      engine
    });
  } catch (err) {
    console.error('Follow-up message error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// DELETE /api/repair/conversations/:id
router.delete('/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const conv = await get('SELECT * FROM conversations WHERE id = ?', [req.params.id]);
    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (req.user && conv.user_id && conv.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this conversation' });
    }

    await run('DELETE FROM messages WHERE conversation_id = ?', [req.params.id]);
    await run('DELETE FROM feedback WHERE conversation_id = ?', [req.params.id]);
    await run('DELETE FROM conversations WHERE id = ?', [req.params.id]);

    res.json({ message: 'Conversation deleted successfully' });
  } catch (err) {
    console.error('Delete conversation error:', err);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// POST /api/repair/feedback
router.post('/feedback', authenticateToken, async (req, res) => {
  try {
    const { conversationId, rating, comment, isIncorrectReport } = req.body;
    const userId = req.user ? req.user.id : null;

    const id = randomUUID();
    await run(
      `INSERT INTO feedback (id, user_id, conversation_id, rating, comment, is_incorrect_report)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, userId, conversationId || null, rating || 5, comment || '', isIncorrectReport ? 1 : 0]
    );

    res.json({ message: 'Thank you for your feedback! It helps improve RepairSathi AI.' });
  } catch (err) {
    console.error('Feedback error:', err);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
});

module.exports = router;
