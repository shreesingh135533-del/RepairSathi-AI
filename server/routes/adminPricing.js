const express = require('express');
const router = express.Router();
const { randomUUID } = require('crypto');
const { all, get, run } = require('../db');
const { authenticateToken, requireAdmin } = require('./auth');

// All admin pricing routes require admin authentication
router.use(authenticateToken, requireAdmin);

// 1. GET /api/admin/costs/prices - List official & authorised prices
router.get('/prices', async (req, res) => {
  try {
    const { brand, model, component, limit = 50 } = req.query;
    let sql = 'SELECT * FROM official_repair_prices WHERE 1=1';
    const params = [];

    if (brand && brand.trim()) {
      sql += ' AND LOWER(brand_slug) LIKE ?';
      params.push(`%${brand.toLowerCase().trim()}%`);
    }
    if (model && model.trim()) {
      sql += ' AND LOWER(model_name) LIKE ?';
      params.push(`%${model.toLowerCase().trim()}%`);
    }
    if (component && component.trim()) {
      sql += ' AND LOWER(component_name) LIKE ?';
      params.push(`%${component.toLowerCase().trim()}%`);
    }

    sql += ' ORDER BY last_verified_date DESC LIMIT ?';
    params.push(parseInt(limit, 10));

    const prices = await all(sql, params);
    res.json({ prices, total: prices.length });
  } catch (err) {
    console.error('Error fetching admin prices:', err);
    res.status(500).json({ error: 'Failed to retrieve repair price catalogue' });
  }
});

// 2. POST /api/admin/costs/prices/entry - Add or update price entry
router.post('/prices/entry', async (req, res) => {
  try {
    const {
      id,
      brand_name,
      model_name,
      variant = 'All Variants',
      component_name,
      part_price,
      labour_price,
      is_tax_inclusive = 1,
      source_url,
      warranty_terms
    } = req.body;

    if (!brand_name || !model_name || !component_name || part_price === undefined || labour_price === undefined) {
      return res.status(400).json({ error: 'Missing mandatory fields' });
    }

    const brandSlug = brand_name.toLowerCase().trim().replace(/\s+/g, '-');
    const pPrice = parseInt(part_price, 10);
    const lPrice = parseInt(labour_price, 10);
    const subtotal = pPrice + lPrice;
    const finalTotal = is_tax_inclusive ? subtotal : Math.round(subtotal * 1.18);
    const today = new Date().toISOString().slice(0, 10);

    let recordId = id;
    if (recordId) {
      // Check existing for audit history
      const prev = await get('SELECT total_price FROM official_repair_prices WHERE id = ?', [recordId]);
      if (prev && prev.total_price !== finalTotal) {
        await run(`
          INSERT INTO price_update_history (id, price_type, brand_slug, model_name, component_name, old_total, new_total, reason, updated_by)
          VALUES (?, 'OFFICIAL', ?, ?, ?, ?, ?, 'Admin manual price adjustment', ?)
        `, [randomUUID(), brandSlug, model_name, component_name, prev.total_price, finalTotal, req.user?.email || 'admin']);
      }

      await run(`
        UPDATE official_repair_prices
        SET brand_slug = ?, brand_name = ?, model_name = ?, variant = ?,
            component_name = ?, part_price = ?, labour_price = ?,
            is_tax_inclusive = ?, total_price = ?, source_url = ?,
            warranty_terms = ?, last_verified_date = ?
        WHERE id = ?
      `, [
        brandSlug, brand_name, model_name, variant,
        component_name, pPrice, lPrice,
        is_tax_inclusive ? 1 : 0, finalTotal, source_url,
        warranty_terms || '90-Day Official Warranty', today, recordId
      ]);
    } else {
      recordId = `off_${brandSlug}_${Date.now()}`;
      await run(`
        INSERT INTO official_repair_prices (
          id, brand_slug, brand_name, model_name, variant,
          component_id, component_name, currency, part_price,
          labour_price, gst_rate, is_tax_inclusive, other_charges,
          total_price, part_quality, source_url, warranty_terms,
          effective_date, last_verified_date
        ) VALUES (?, ?, ?, ?, ?, 'comp_custom', ?, 'INR', ?, ?, 0.18, ?, 0, ?, 'Genuine OEM', ?, ?, ?, ?)
      `, [
        recordId, brandSlug, brand_name, model_name, variant,
        component_name, pPrice, lPrice,
        is_tax_inclusive ? 1 : 0, finalTotal, source_url,
        warranty_terms || '90-Day Official Warranty', today, today
      ]);
    }

    res.json({ success: true, recordId, message: 'Price record saved successfully' });
  } catch (err) {
    console.error('Error saving price entry:', err);
    res.status(500).json({ error: 'Failed to save price record' });
  }
});

// 3. POST /api/admin/costs/import-csv - Bulk CSV Import for Repair Costs
router.post('/import-csv', async (req, res) => {
  try {
    const { csvContent } = req.body;
    if (!csvContent || typeof csvContent !== 'string') {
      return res.status(400).json({ error: 'Valid CSV text content is required' });
    }

    const lines = csvContent.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      return res.status(400).json({ error: 'CSV file must contain a header row and at least one data row' });
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    const expectedHeaders = ['brand', 'model', 'component', 'part_price'];
    const hasRequired = expectedHeaders.every(h => headers.includes(h));
    if (!hasRequired) {
      return res.status(400).json({
        error: `CSV headers must include at least: ${expectedHeaders.join(', ')}. Found: ${headers.join(', ')}`
      });
    }

    const brandIdx = headers.indexOf('brand');
    const modelIdx = headers.indexOf('model');
    const compIdx = headers.indexOf('component');
    const partIdx = headers.indexOf('part_price');
    const labourIdx = headers.indexOf('labour_price');
    const variantIdx = headers.indexOf('variant');
    const urlIdx = headers.indexOf('source_url');

    let inserted = 0;
    let updated = 0;
    const today = new Date().toISOString().slice(0, 10);

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length <= Math.max(brandIdx, modelIdx, compIdx, partIdx)) continue;

      const brand = cols[brandIdx];
      const model = cols[modelIdx];
      const comp = cols[compIdx];
      const partPrice = parseInt(cols[partIdx], 10) || 0;
      const labourPrice = labourIdx !== -1 && cols[labourIdx] ? parseInt(cols[labourIdx], 10) : 400;
      const variant = variantIdx !== -1 && cols[variantIdx] ? cols[variantIdx] : 'All Variants';
      const sourceUrl = urlIdx !== -1 && cols[urlIdx] ? cols[urlIdx] : '';

      if (!brand || !model || !comp || partPrice <= 0) continue;

      const brandSlug = brand.toLowerCase().replace(/\s+/g, '-');
      const total = partPrice + labourPrice;

      const existing = await get(`
        SELECT id FROM official_repair_prices
        WHERE LOWER(brand_slug) = ? AND LOWER(model_name) = ? AND LOWER(component_name) = ? AND variant = ?
      `, [brandSlug, model.toLowerCase(), comp.toLowerCase(), variant]);

      if (existing) {
        await run(`
          UPDATE official_repair_prices
          SET part_price = ?, labour_price = ?, total_price = ?, source_url = ?, last_verified_date = ?
          WHERE id = ?
        `, [partPrice, labourPrice, total, sourceUrl, today, existing.id]);
        updated++;
      } else {
        const newId = `csv_${brandSlug}_${Date.now()}_${i}`;
        await run(`
          INSERT INTO official_repair_prices (
            id, brand_slug, brand_name, model_name, variant,
            component_id, component_name, currency, part_price,
            labour_price, gst_rate, is_tax_inclusive, other_charges,
            total_price, part_quality, source_url, effective_date, last_verified_date
          ) VALUES (?, ?, ?, ?, ?, 'comp_csv', ?, 'INR', ?, ?, 0.18, 1, 0, ?, 'Genuine OEM', ?, ?, ?)
        `, [newId, brandSlug, brand, model, variant, comp, partPrice, labourPrice, total, sourceUrl, today, today]);
        inserted++;
      }
    }

    res.json({
      success: true,
      message: `CSV processing finished: ${inserted} records imported, ${updated} records updated.`,
      stats: { inserted, updated, totalProcessed: inserted + updated }
    });
  } catch (err) {
    console.error('Error importing CSV:', err);
    res.status(500).json({ error: 'Failed to process CSV import' });
  }
});

// 4. GET /api/admin/costs/quotes/pending - Pending local quotations for review
router.get('/quotes/pending', async (req, res) => {
  try {
    const quotes = await all(`
      SELECT * FROM local_repair_quotes
      WHERE is_verified = 0
      ORDER BY quote_date DESC
    `);
    res.json({ quotes });
  } catch (err) {
    console.error('Error fetching pending quotes:', err);
    res.status(500).json({ error: 'Failed to retrieve pending quotes' });
  }
});

// 5. POST /api/admin/costs/quotes/:id/verify - Approve or reject quote
router.post('/quotes/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body; // 'approve' or 'reject'

    if (action === 'approve') {
      await run('UPDATE local_repair_quotes SET is_verified = 1 WHERE id = ?', [id]);
      await run(`
        INSERT INTO admin_verification_logs (id, record_id, table_name, action, admin_id, notes)
        VALUES (?, ?, 'local_repair_quotes', 'APPROVED', ?, ?)
      `, [randomUUID(), id, req.user?.email || 'admin', notes || 'Approved after audit']);
      res.json({ success: true, message: 'Quotation verified and published.' });
    } else {
      await run('DELETE FROM local_repair_quotes WHERE id = ?', [id]);
      await run(`
        INSERT INTO admin_verification_logs (id, record_id, table_name, action, admin_id, notes)
        VALUES (?, ?, 'local_repair_quotes', 'REJECTED', ?, ?)
      `, [randomUUID(), id, req.user?.email || 'admin', notes || 'Rejected due to audit discrepancy']);
      res.json({ success: true, message: 'Quotation rejected and removed.' });
    }
  } catch (err) {
    console.error('Error verifying quote:', err);
    res.status(500).json({ error: 'Failed to verify quote' });
  }
});

// 6. GET /api/admin/costs/audit-logs - Audit History
router.get('/audit-logs', async (req, res) => {
  try {
    const history = await all('SELECT * FROM price_update_history ORDER BY created_at DESC LIMIT 50');
    const verifications = await all('SELECT * FROM admin_verification_logs ORDER BY created_at DESC LIMIT 50');
    res.json({ history, verifications });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

// 7. POST /api/admin/costs/update-labour - Update manufacturer standard labour charge
router.post('/update-labour', async (req, res) => {
  try {
    const { slug, labourCharge } = req.body;
    if (!slug || labourCharge === undefined) {
      return res.status(400).json({ error: 'Slug and labourCharge are required' });
    }

    await run('UPDATE manufacturers SET labour_charge_standard = ? WHERE slug = ?', [parseInt(labourCharge, 10), slug]);
    res.json({ success: true, message: `Standard labour charge updated for ${slug}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update manufacturer labour charge' });
  }
});

module.exports = router;
