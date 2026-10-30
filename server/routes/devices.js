const express = require('express');
const router = express.Router();
const { all, get } = require('../db');

// GET /api/devices/brands
router.get('/brands', async (req, res) => {
  try {
    const { category, query } = req.query;
    let sql = 'SELECT id, name, slug, category_slug, popularity_score FROM brands WHERE 1=1';
    const params = [];

    if (category) {
      sql += ' AND category_slug = ?';
      params.push(category.toLowerCase().trim());
    }

    if (query && query.trim()) {
      sql += ' AND name LIKE ?';
      params.push(`%${query.trim()}%`);
    }

    sql += ' ORDER BY popularity_score DESC, name ASC LIMIT 30';
    const brands = await all(sql, params);

    res.json({ brands });
  } catch (err) {
    console.error('Error fetching brands:', err);
    res.status(500).json({ error: 'Failed to retrieve brands' });
  }
});

// GET /api/devices/models
router.get('/models', async (req, res) => {
  try {
    const { brandId, brandSlug, category, query } = req.query;
    let sql = 'SELECT id, brand_id, brand_slug, model_name, model_number, category_slug, is_verified FROM device_models WHERE 1=1';
    const params = [];

    if (brandId) {
      sql += ' AND brand_id = ?';
      params.push(brandId);
    } else if (brandSlug) {
      sql += ' AND brand_slug = ?';
      params.push(brandSlug.toLowerCase().trim());
    }

    if (category) {
      sql += ' AND category_slug = ?';
      params.push(category.toLowerCase().trim());
    }

    if (query && query.trim()) {
      sql += ' AND (model_name LIKE ? OR model_number LIKE ?)';
      params.push(`%${query.trim()}%`, `%${query.trim()}%`);
    }

    sql += ' ORDER BY model_name ASC LIMIT 50';
    const models = await all(sql, params);

    res.json({ models });
  } catch (err) {
    console.error('Error fetching models:', err);
    res.status(500).json({ error: 'Failed to retrieve models' });
  }
});

// POST /api/devices/validate
router.post('/validate', async (req, res) => {
  try {
    const { category, brandName, modelName, brandId, modelId } = req.body;

    if (!category) {
      return res.status(400).json({ valid: false, message: 'Please select a device category.' });
    }

    if (!brandName || !brandName.trim()) {
      return res.status(400).json({ valid: false, message: 'Please specify a device brand.' });
    }

    if (!modelName || !modelName.trim()) {
      return res.status(400).json({ valid: false, message: 'Please enter a device model.' });
    }

    const cleanCategory = category.toLowerCase().trim();
    const cleanBrand = brandName.trim();
    const cleanModel = modelName.trim();

    // 1. Locate Brand in database
    let brand = null;
    if (brandId) {
      brand = await get('SELECT * FROM brands WHERE id = ?', [brandId]);
    }
    if (!brand) {
      brand = await get(
        'SELECT * FROM brands WHERE (LOWER(name) = ? OR LOWER(slug) = ?) AND category_slug = ?',
        [cleanBrand.toLowerCase(), cleanBrand.toLowerCase(), cleanCategory]
      );
    }
    // Also try case-insensitive partial match if exact didn't match
    if (!brand) {
      brand = await get(
        'SELECT * FROM brands WHERE LOWER(name) LIKE ? AND category_slug = ?',
        [`%${cleanBrand.toLowerCase()}%`, cleanCategory]
      );
    }

    // 2. Check if the Model exists in our verified catalogue anywhere
    const matchedModelRow = await get(
      'SELECT dm.*, b.name as actual_brand_name FROM device_models dm JOIN brands b ON dm.brand_id = b.id WHERE LOWER(dm.model_name) = ? OR LOWER(dm.model_number) = ?',
      [cleanModel.toLowerCase(), cleanModel.toLowerCase()]
    );

    // If model exists in catalog under a different brand -> Brand-Model Mismatch!
    if (matchedModelRow && brand && matchedModelRow.brand_id !== brand.id) {
      return res.json({
        valid: false,
        status: 'MISMATCHED_BRAND_MODEL',
        message: `Your selected model "${cleanModel}" does not match the selected brand "${cleanBrand}". This model is manufactured by ${matchedModelRow.actual_brand_name}. Please choose a valid ${brand.name} model.`,
        expectedBrand: matchedModelRow.actual_brand_name,
        selectedBrand: brand.name
      });
    }

    // Check if model matches under the chosen brand
    let verifiedModel = null;
    if (brand) {
      verifiedModel = await get(
        'SELECT * FROM device_models WHERE brand_id = ? AND (LOWER(model_name) = ? OR LOWER(model_name) LIKE ?)',
        [brand.id, cleanModel.toLowerCase(), `%${cleanModel.toLowerCase()}%`]
      );
    }

    if (verifiedModel) {
      return res.json({
        valid: true,
        status: 'VERIFIED',
        isVerified: true,
        message: 'Device brand and model verified in RepairSathi catalogue.',
        brand: {
          id: brand.id,
          name: brand.name,
          slug: brand.slug
        },
        model: {
          id: verifiedModel.id,
          name: verifiedModel.model_name,
          number: verifiedModel.model_number
        }
      });
    }

    // If Brand exists but Model is not in catalog -> Unlisted / Unknown Model Pathway
    if (brand) {
      return res.json({
        valid: true,
        status: 'UNVERIFIED_MODEL',
        isVerified: false,
        allowUnlisted: true,
        message: `"${cleanModel}" was not found in our verified ${brand.name} database. You can proceed with an unverified model, but AI diagnostic accuracy may be slightly limited.`,
        brand: {
          id: brand.id,
          name: brand.name,
          slug: brand.slug
        },
        model: {
          name: cleanModel,
          unverified: true
        }
      });
    }

    // If neither Brand nor Model are recognized in this category
    return res.json({
      valid: true,
      status: 'CUSTOM_DEVICE',
      isVerified: false,
      allowUnlisted: true,
      message: `Brand "${cleanBrand}" is not listed under ${category}. You can proceed with custom device troubleshooting.`,
      brand: { name: cleanBrand, unverified: true },
      model: { name: cleanModel, unverified: true }
    });
  } catch (err) {
    console.error('Device validation error:', err);
    res.status(500).json({ error: 'Failed to validate device' });
  }
});

// GET /api/devices/symptoms
router.get('/symptoms', async (req, res) => {
  try {
    const { category, query } = req.query;
    let sql = 'SELECT id, category_slug, symptom_text, related_keywords, frequency_score FROM symptom_catalog WHERE 1=1';
    const params = [];

    if (category) {
      sql += ' AND category_slug = ?';
      params.push(category.toLowerCase().trim());
    }

    if (query && query.trim()) {
      sql += ' AND (symptom_text LIKE ? OR related_keywords LIKE ?)';
      const term = `%${query.trim()}%`;
      params.push(term, term);
    }

    sql += ' ORDER BY frequency_score DESC, id ASC LIMIT 15';
    const symptoms = await all(sql, params);

    res.json({ symptoms });
  } catch (err) {
    console.error('Error fetching symptoms:', err);
    res.status(500).json({ error: 'Failed to retrieve symptoms' });
  }
});

// GET /api/devices/error-codes
router.get('/error-codes', async (req, res) => {
  try {
    const { category, brand, query } = req.query;
    let sql = 'SELECT * FROM error_codes WHERE 1=1';
    const params = [];

    if (category) {
      sql += ' AND category_slug = ?';
      params.push(category.toLowerCase().trim());
    }

    if (brand && brand.trim()) {
      sql += ' AND (brand_slug = ? OR brand_slug IS NULL)';
      params.push(brand.toLowerCase().trim());
    }

    if (query && query.trim()) {
      sql += ' AND (code LIKE ? OR title LIKE ? OR meaning LIKE ?)';
      const term = `%${query.trim()}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY code ASC LIMIT 20';
    const errorCodes = await all(sql, params);

    res.json({ errorCodes });
  } catch (err) {
    console.error('Error fetching error codes:', err);
    res.status(500).json({ error: 'Failed to retrieve error codes' });
  }
});

// POST /api/devices/validate-error-code
router.post('/validate-error-code', async (req, res) => {
  try {
    const { code, category, brand } = req.body;
    if (!code || !code.trim()) {
      return res.json({ valid: true, status: 'EMPTY', message: 'No error code specified.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanCategory = (category || '').toLowerCase().trim();

    let sql = 'SELECT * FROM error_codes WHERE UPPER(code) = ?';
    const params = [cleanCode];
    if (cleanCategory) {
      sql += ' AND (category_slug = ? OR category_slug IS NULL)';
      params.push(cleanCategory);
    }

    const match = await get(sql, params);
    if (match) {
      return res.json({
        valid: true,
        status: 'VERIFIED',
        errorCode: match,
        message: `Verified Error Code: ${match.title}`
      });
    }

    return res.json({
      valid: false,
      status: 'UNRECOGNIZED',
      message: "Error code not recognized. Please verify the code or remove it if you don't have one."
    });
  } catch (err) {
    console.error('Error validating error code:', err);
    res.status(500).json({ error: 'Failed to validate error code' });
  }
});

module.exports = router;
