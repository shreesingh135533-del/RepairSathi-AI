const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to SQLite database at', dbPath);
  }
});

// Helper for promise-based queries
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const exec = (sql) => {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const initSchema = async () => {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT NOT NULL,
      description TEXT,
      display_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS knowledge_base (
      id TEXT PRIMARY KEY,
      category_slug TEXT NOT NULL,
      device_name TEXT NOT NULL,
      problem_title TEXT NOT NULL,
      keywords TEXT,
      symptoms TEXT,
      possible_causes TEXT,
      troubleshooting_steps TEXT,
      tools_required TEXT,
      difficulty TEXT DEFAULT 'Moderate',
      estimated_cost_range TEXT,
      safety_warning TEXT,
      professional_recommended INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT NOT NULL,
      category_slug TEXT,
      device_name TEXT,
      model TEXT,
      error_code TEXT,
      problem_description TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      content TEXT NOT NULL,
      diagnosis_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      conversation_id TEXT,
      rating INTEGER,
      comment TEXT,
      is_incorrect_report INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      category_slug TEXT NOT NULL,
      popularity_score INTEGER DEFAULT 0,
      UNIQUE(slug, category_slug)
    );

    CREATE TABLE IF NOT EXISTS device_models (
      id TEXT PRIMARY KEY,
      brand_id TEXT NOT NULL,
      brand_slug TEXT NOT NULL,
      model_name TEXT NOT NULL,
      model_number TEXT,
      category_slug TEXT NOT NULL,
      release_year INTEGER,
      is_verified INTEGER DEFAULT 1,
      aliases TEXT,
      FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS symptom_catalog (
      id TEXT PRIMARY KEY,
      category_slug TEXT NOT NULL,
      symptom_text TEXT NOT NULL,
      related_keywords TEXT,
      frequency_score INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS error_codes (
      id TEXT PRIMARY KEY,
      category_slug TEXT NOT NULL,
      brand_slug TEXT,
      code TEXT NOT NULL,
      title TEXT NOT NULL,
      meaning TEXT NOT NULL,
      typical_cause TEXT,
      severity TEXT DEFAULT 'Medium'
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS repair_costs (
      id TEXT PRIMARY KEY,
      category_slug TEXT NOT NULL,
      brand_slug TEXT NOT NULL,
      brand_name TEXT NOT NULL,
      model_name TEXT NOT NULL,
      variant TEXT DEFAULT 'All Variants',
      component_name TEXT NOT NULL,
      city TEXT NOT NULL,
      official_price INTEGER NOT NULL,
      official_labour INTEGER NOT NULL,
      official_tax_inclusive INTEGER DEFAULT 1,
      official_part_quality TEXT DEFAULT 'OEM Original',
      official_source_url TEXT,
      official_warranty TEXT DEFAULT '90-Day Official Warranty',
      auth_price INTEGER NOT NULL,
      auth_labour INTEGER NOT NULL,
      auth_tax_inclusive INTEGER DEFAULT 1,
      auth_part_quality TEXT DEFAULT 'Authorized Grade / Service Center Part',
      auth_source_url TEXT,
      auth_warranty TEXT DEFAULT '60-Day Service Warranty',
      local_min_price INTEGER NOT NULL,
      local_max_price INTEGER NOT NULL,
      local_labour INTEGER NOT NULL,
      local_part_quality TEXT DEFAULT 'Grade A Compatible / Certified Refurbished',
      local_warranty TEXT DEFAULT '30-Day Testing Warranty',
      repairsathi_estimate INTEGER NOT NULL,
      last_verified_date TEXT NOT NULL,
      data_confidence TEXT DEFAULT 'High (Verified Provider Benchmark)'
    );

    CREATE TABLE IF NOT EXISTS manufacturers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      official_portal_url TEXT,
      labour_charge_standard INTEGER DEFAULT 350,
      support_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS repair_components (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      category_slug TEXT DEFAULT 'smartphones',
      display_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS price_sources (
      id TEXT PRIMARY KEY,
      source_type TEXT NOT NULL,
      provider_name TEXT NOT NULL,
      source_url TEXT,
      city TEXT DEFAULT 'All India',
      is_active INTEGER DEFAULT 1,
      last_checked_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS official_repair_prices (
      id TEXT PRIMARY KEY,
      brand_slug TEXT NOT NULL,
      brand_name TEXT NOT NULL,
      model_name TEXT NOT NULL,
      model_number TEXT,
      variant TEXT DEFAULT 'All Variants',
      component_id TEXT NOT NULL,
      component_name TEXT NOT NULL,
      currency TEXT DEFAULT 'INR',
      part_price INTEGER NOT NULL,
      labour_price INTEGER NOT NULL,
      gst_rate REAL DEFAULT 0.18,
      is_tax_inclusive INTEGER DEFAULT 1,
      other_charges INTEGER DEFAULT 0,
      total_price INTEGER NOT NULL,
      part_quality TEXT DEFAULT 'Genuine OEM',
      source_url TEXT,
      warranty_terms TEXT DEFAULT '90-Day Official Brand Warranty',
      effective_date TEXT,
      last_verified_date TEXT NOT NULL,
      is_stale INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS authorised_provider_prices (
      id TEXT PRIMARY KEY,
      brand_slug TEXT NOT NULL,
      brand_name TEXT NOT NULL,
      model_name TEXT NOT NULL,
      variant TEXT DEFAULT 'All Variants',
      component_id TEXT NOT NULL,
      component_name TEXT NOT NULL,
      provider_name TEXT NOT NULL,
      city TEXT DEFAULT 'All India',
      currency TEXT DEFAULT 'INR',
      part_price INTEGER NOT NULL,
      labour_price INTEGER NOT NULL,
      gst_rate REAL DEFAULT 0.18,
      is_tax_inclusive INTEGER DEFAULT 1,
      other_charges INTEGER DEFAULT 0,
      total_price INTEGER NOT NULL,
      part_quality TEXT DEFAULT 'Authorised Replacement (OEM Grade)',
      source_url TEXT,
      warranty_terms TEXT DEFAULT '60-Day Service Warranty',
      effective_date TEXT,
      last_verified_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS local_repair_quotes (
      id TEXT PRIMARY KEY,
      brand_slug TEXT NOT NULL,
      brand_name TEXT NOT NULL,
      model_name TEXT NOT NULL,
      variant TEXT DEFAULT 'All Variants',
      component_id TEXT NOT NULL,
      component_name TEXT NOT NULL,
      city TEXT NOT NULL,
      shop_name TEXT NOT NULL,
      address_locality TEXT,
      part_price INTEGER NOT NULL,
      labour_price INTEGER NOT NULL,
      total_price INTEGER NOT NULL,
      part_quality TEXT NOT NULL,
      warranty_days INTEGER DEFAULT 30,
      warranty_terms TEXT DEFAULT '30-Day Workshop Testing Warranty',
      quote_date TEXT NOT NULL,
      is_verified INTEGER DEFAULT 1,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS price_update_history (
      id TEXT PRIMARY KEY,
      price_type TEXT NOT NULL,
      brand_slug TEXT NOT NULL,
      model_name TEXT NOT NULL,
      component_name TEXT NOT NULL,
      old_total INTEGER,
      new_total INTEGER,
      reason TEXT,
      updated_by TEXT DEFAULT 'system',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_verification_logs (
      id TEXT PRIMARY KEY,
      record_id TEXT NOT NULL,
      table_name TEXT NOT NULL,
      action TEXT NOT NULL,
      admin_id TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await exec(schema);

  // Safe migrations for table extensions
  try { await run('ALTER TABLE conversations ADD COLUMN brand TEXT'); } catch (_) {}
  try { await run('ALTER TABLE conversations ADD COLUMN is_verified_device INTEGER DEFAULT 1'); } catch (_) {}
  try { await run('ALTER TABLE conversations ADD COLUMN image_verification_status TEXT'); } catch (_) {}
  try { await run('ALTER TABLE conversations ADD COLUMN image_verification_json TEXT'); } catch (_) {}
  try { await run('ALTER TABLE device_models ADD COLUMN variants TEXT'); } catch (_) {}
  try { await run('ALTER TABLE repair_costs ADD COLUMN variant TEXT DEFAULT "All Variants"'); } catch (_) {}
  try { await run('ALTER TABLE official_repair_prices ADD COLUMN repair_method TEXT DEFAULT "part_replacement"'); } catch (_) {}
  try { await run('ALTER TABLE official_repair_prices ADD COLUMN provider_name TEXT DEFAULT "Official Brand Service"'); } catch (_) {}
  try { await run('ALTER TABLE official_repair_prices ADD COLUMN provider_type TEXT DEFAULT "OFFICIAL_MANUFACTURER"'); } catch (_) {}
  try { await run('ALTER TABLE official_repair_prices ADD COLUMN country TEXT DEFAULT "IN"'); } catch (_) {}
  try { await run('ALTER TABLE official_repair_prices ADD COLUMN exchange_pricing_terms TEXT'); } catch (_) {}
  try { await run('ALTER TABLE authorised_provider_prices ADD COLUMN repair_method TEXT DEFAULT "part_replacement"'); } catch (_) {}
  try { await run('ALTER TABLE authorised_provider_prices ADD COLUMN provider_type TEXT DEFAULT "AUTHORISED_AASP"'); } catch (_) {}
  try { await run('ALTER TABLE authorised_provider_prices ADD COLUMN country TEXT DEFAULT "IN"'); } catch (_) {}
  try { await run('ALTER TABLE authorised_provider_prices ADD COLUMN exchange_pricing_terms TEXT'); } catch (_) {}
  try { await run('ALTER TABLE local_repair_quotes ADD COLUMN repair_method TEXT DEFAULT "part_replacement"'); } catch (_) {}
  try { await run('ALTER TABLE local_repair_quotes ADD COLUMN provider_type TEXT DEFAULT "INDEPENDENT_WORKSHOP"'); } catch (_) {}
  try { await run('ALTER TABLE local_repair_quotes ADD COLUMN country TEXT DEFAULT "IN"'); } catch (_) {}

  console.log('Database schema verified/created successfully.');
};

module.exports = {
  db,
  run,
  get,
  all,
  exec,
  initSchema
};
