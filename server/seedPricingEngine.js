const { run, get, all, initSchema } = require('./db');
const { OFFICIAL_MANUFACTURERS, STANDARD_REPAIR_COMPONENTS } = require('./connectors/officialPortals');

async function seedPricingEngine() {
  await initSchema();
  console.log('--- Initializing Live Repair Cost Engine Database Seeding ---');

  // 1. Seed Manufacturers
  for (const [key, mfg] of Object.entries(OFFICIAL_MANUFACTURERS)) {
    const existing = await get('SELECT id FROM manufacturers WHERE slug = ?', [mfg.slug]);
    if (!existing) {
      await run(`
        INSERT INTO manufacturers (id, name, slug, official_portal_url, labour_charge_standard, support_notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        `mfg_${mfg.slug}`,
        mfg.name,
        mfg.slug,
        mfg.portalUrl,
        mfg.standardLabour,
        mfg.notes
      ]);
    }
  }
  console.log('✓ Manufacturers seeded');

  // 2. Seed Standard 15 Repair Components
  for (const comp of STANDARD_REPAIR_COMPONENTS) {
    const existing = await get('SELECT id FROM repair_components WHERE slug = ?', [comp.slug]);
    if (!existing) {
      await run(`
        INSERT INTO repair_components (id, name, slug, description, category_slug, display_order)
        VALUES (?, ?, ?, ?, 'smartphones', ?)
      `, [comp.id, comp.name, comp.slug, comp.desc, comp.order]);
    }
  }
  console.log('✓ 15 Standard Repair Components seeded');

  // 3. Seed Price Sources
  const sources = [
    { id: 'src_apple_in', type: 'OFFICIAL_PORTAL', name: 'Apple India Support Portal', url: 'https://support.apple.com/en-in/iphone/repair', city: 'All India' },
    { id: 'src_samsung_in', type: 'OFFICIAL_PORTAL', name: 'Samsung India Out-of-Warranty Tool', url: 'https://www.samsung.com/in/support/out-of-warranty-repair-charges/', city: 'All India' },
    { id: 'src_xiaomi_in', type: 'OFFICIAL_PORTAL', name: 'Xiaomi India Spare Part Price Schedule', url: 'https://www.mi.com/in/support/spare-part-prices/summary/', city: 'All India' },
    { id: 'src_oneplus_in', type: 'OFFICIAL_PORTAL', name: 'OnePlus India Care Repair Pricing', url: 'https://www.oneplus.in/support/repair-pricing/details', city: 'All India' },
    { id: 'src_vivo_in', type: 'OFFICIAL_PORTAL', name: 'Vivo India Parts & Labour Directory', url: 'https://www.vivo.com/in/support/accessory', city: 'All India' },
    { id: 'src_moto_in', type: 'OFFICIAL_PORTAL', name: 'Motorola India Out-of-Warranty Spare Schedule', url: 'https://en-in.support.motorola.com/app/answers/detail/a_id/133816/~/india-out-of-warranty-parts-price-list', city: 'All India' },
    { id: 'src_pixel_in', type: 'AUTHORISED_AASP', name: 'F1 Info Solutions & Services (Google Partner)', url: 'https://support.google.com/pixelphone/answer/9004345', city: 'All India' },
    { id: 'src_nothing_in', type: 'OFFICIAL_PORTAL', name: 'Nothing India Care Portal', url: 'https://in.nothing.tech/pages/service-center', city: 'All India' },
    { id: 'src_cashify', type: 'AUTHORISED_AASP', name: 'Cashify Repair Network', url: 'https://www.cashify.in/repair', city: 'All India' }
  ];

  for (const src of sources) {
    const existing = await get('SELECT id FROM price_sources WHERE id = ?', [src.id]);
    if (!existing) {
      await run(`
        INSERT INTO price_sources (id, source_type, provider_name, source_url, city)
        VALUES (?, ?, ?, ?, ?)
      `, [src.id, src.type, src.name, src.url, src.city]);
    }
  }
  console.log('✓ Price Sources seeded');

  // 4. Seed Official & Authorized Prices for Smartphone Models
  const officialData = [
    // --- SAMSUNG GALAXY A14 5G ---
    {
      id: 'off_sam_a14_screen',
      brand_slug: 'samsung', brand_name: 'Samsung', model_name: 'Galaxy A14 5G', variant: 'All Variants',
      comp_id: 'comp_screen', comp_name: 'Display / Screen',
      part_price: 2750, labour_price: 450, is_tax_inclusive: 0,
      source_url: 'https://www.samsung.com/in/support/out-of-warranty-repair-charges/',
      effective_date: '2026-08-01', last_verified_date: '2026-10-25'
    },
    {
      id: 'off_sam_a14_battery',
      brand_slug: 'samsung', brand_name: 'Samsung', model_name: 'Galaxy A14 5G', variant: 'All Variants',
      comp_id: 'comp_battery', comp_name: 'Battery',
      part_price: 1350, labour_price: 450, is_tax_inclusive: 0,
      source_url: 'https://www.samsung.com/in/support/out-of-warranty-repair-charges/',
      effective_date: '2026-08-01', last_verified_date: '2026-10-25'
    },
    {
      id: 'off_sam_a14_back_glass',
      brand_slug: 'samsung', brand_name: 'Samsung', model_name: 'Galaxy A14 5G', variant: 'All Variants',
      comp_id: 'comp_back_glass', comp_name: 'Back Glass / Rear Panel',
      part_price: 650, labour_price: 350, is_tax_inclusive: 0,
      source_url: 'https://www.samsung.com/in/support/out-of-warranty-repair-charges/',
      effective_date: '2026-08-01', last_verified_date: '2026-10-25'
    },
    {
      id: 'off_sam_a14_motherboard_128',
      brand_slug: 'samsung', brand_name: 'Samsung', model_name: 'Galaxy A14 5G', variant: '128GB',
      comp_id: 'comp_motherboard', comp_name: 'Motherboard',
      part_price: 5200, labour_price: 450, is_tax_inclusive: 0,
      source_url: 'https://www.samsung.com/in/support/out-of-warranty-repair-charges/',
      effective_date: '2026-08-01', last_verified_date: '2026-10-25'
    },
    {
      id: 'off_sam_a14_motherboard_64',
      brand_slug: 'samsung', brand_name: 'Samsung', model_name: 'Galaxy A14 5G', variant: '64GB',
      comp_id: 'comp_motherboard', comp_name: 'Motherboard',
      part_price: 4600, labour_price: 450, is_tax_inclusive: 0,
      source_url: 'https://www.samsung.com/in/support/out-of-warranty-repair-charges/',
      effective_date: '2026-08-01', last_verified_date: '2026-10-25'
    },
    {
      id: 'off_sam_a14_camera',
      brand_slug: 'samsung', brand_name: 'Samsung', model_name: 'Galaxy A14 5G', variant: 'All Variants',
      comp_id: 'comp_rear_camera', comp_name: 'Rear Camera',
      part_price: 1800, labour_price: 450, is_tax_inclusive: 0,
      source_url: 'https://www.samsung.com/in/support/out-of-warranty-repair-charges/',
      effective_date: '2026-08-01', last_verified_date: '2026-10-25'
    },
    {
      id: 'off_sam_a14_charging',
      brand_slug: 'samsung', brand_name: 'Samsung', model_name: 'Galaxy A14 5G', variant: 'All Variants',
      comp_id: 'comp_charging_port', comp_name: 'Charging Port',
      part_price: 850, labour_price: 350, is_tax_inclusive: 0,
      source_url: 'https://www.samsung.com/in/support/out-of-warranty-repair-charges/',
      effective_date: '2026-08-01', last_verified_date: '2026-10-25'
    },

    // --- SAMSUNG GALAXY S24 ULTRA ---
    {
      id: 'off_sam_s24u_screen',
      brand_slug: 'samsung', brand_name: 'Samsung', model_name: 'Galaxy S24 Ultra', variant: 'All Variants',
      comp_id: 'comp_screen', comp_name: 'Display / Screen',
      part_price: 18450, labour_price: 550, is_tax_inclusive: 0,
      source_url: 'https://www.samsung.com/in/support/out-of-warranty-repair-charges/',
      effective_date: '2026-09-01', last_verified_date: '2026-10-28'
    },
    {
      id: 'off_sam_s24u_battery',
      brand_slug: 'samsung', brand_name: 'Samsung', model_name: 'Galaxy S24 Ultra', variant: 'All Variants',
      comp_id: 'comp_battery', comp_name: 'Battery',
      part_price: 2850, labour_price: 550, is_tax_inclusive: 0,
      source_url: 'https://www.samsung.com/in/support/out-of-warranty-repair-charges/',
      effective_date: '2026-09-01', last_verified_date: '2026-10-28'
    },
    {
      id: 'off_sam_s24u_back_glass',
      brand_slug: 'samsung', brand_name: 'Samsung', model_name: 'Galaxy S24 Ultra', variant: 'All Variants',
      comp_id: 'comp_back_glass', comp_name: 'Back Glass / Rear Panel',
      part_price: 4950, labour_price: 550, is_tax_inclusive: 0,
      source_url: 'https://www.samsung.com/in/support/out-of-warranty-repair-charges/',
      effective_date: '2026-09-01', last_verified_date: '2026-10-28'
    },

    // --- APPLE IPHONE 15 ---
    {
      id: 'off_app_ip15_screen',
      brand_slug: 'apple', brand_name: 'Apple', model_name: 'iPhone 15', variant: 'All Variants',
      comp_id: 'comp_screen', comp_name: 'Display / Screen',
      part_price: 23900, labour_price: 999, is_tax_inclusive: 1,
      source_url: 'https://support.apple.com/en-in/iphone/repair',
      effective_date: '2026-09-15', last_verified_date: '2026-10-26'
    },
    {
      id: 'off_app_ip15_battery',
      brand_slug: 'apple', brand_name: 'Apple', model_name: 'iPhone 15', variant: 'All Variants',
      comp_id: 'comp_battery', comp_name: 'Battery',
      part_price: 8800, labour_price: 999, is_tax_inclusive: 1,
      source_url: 'https://support.apple.com/en-in/iphone/repair',
      effective_date: '2026-09-15', last_verified_date: '2026-10-26'
    },
    {
      id: 'off_app_ip15_back_glass',
      brand_slug: 'apple', brand_name: 'Apple', model_name: 'iPhone 15', variant: 'All Variants',
      comp_id: 'comp_back_glass', comp_name: 'Back Glass / Rear Panel',
      part_price: 14900, labour_price: 999, is_tax_inclusive: 1,
      source_url: 'https://support.apple.com/en-in/iphone/repair',
      effective_date: '2026-09-15', last_verified_date: '2026-10-26'
    },
    {
      id: 'off_app_ip15_rear_camera',
      brand_slug: 'apple', brand_name: 'Apple', model_name: 'iPhone 15', variant: 'All Variants',
      comp_id: 'comp_rear_camera', comp_name: 'Rear Camera',
      part_price: 15500, labour_price: 999, is_tax_inclusive: 1,
      source_url: 'https://support.apple.com/en-in/iphone/repair',
      effective_date: '2026-09-15', last_verified_date: '2026-10-26'
    },

    // --- APPLE IPHONE 15 PRO MAX (OFFICIAL PORTAL BENCHMARKS) ---
    {
      id: 'off_app_ip15pm_screen',
      brand_slug: 'apple', brand_name: 'Apple', model_name: 'iPhone 15 Pro Max', variant: 'All Variants',
      comp_id: 'comp_screen', comp_name: 'Display / Screen',
      part_price: 42901, labour_price: 999, is_tax_inclusive: 1,
      source_url: 'https://support.apple.com/en-in/iphone/repair',
      effective_date: '2026-10-01', last_verified_date: '2026-10-30'
    },
    {
      id: 'off_app_ip15pm_battery',
      brand_slug: 'apple', brand_name: 'Apple', model_name: 'iPhone 15 Pro Max', variant: 'All Variants',
      comp_id: 'comp_battery', comp_name: 'Battery',
      part_price: 8801, labour_price: 999, is_tax_inclusive: 1,
      source_url: 'https://support.apple.com/en-in/iphone/repair',
      effective_date: '2026-10-01', last_verified_date: '2026-10-30'
    },
    {
      id: 'off_app_ip15pm_back_glass',
      brand_slug: 'apple', brand_name: 'Apple', model_name: 'iPhone 15 Pro Max', variant: 'All Variants',
      comp_id: 'comp_back_glass', comp_name: 'Back Glass / Rear Panel',
      part_price: 15901, labour_price: 999, is_tax_inclusive: 1,
      source_url: 'https://support.apple.com/en-in/iphone/repair',
      effective_date: '2026-10-01', last_verified_date: '2026-10-30'
    },
    {
      id: 'off_app_ip15pm_camera',
      brand_slug: 'apple', brand_name: 'Apple', model_name: 'iPhone 15 Pro Max', variant: 'All Variants',
      comp_id: 'comp_rear_camera', comp_name: 'Rear Camera',
      part_price: 26901, labour_price: 999, is_tax_inclusive: 1,
      source_url: 'https://support.apple.com/en-in/iphone/repair',
      effective_date: '2026-10-01', last_verified_date: '2026-10-30'
    },

    // --- APPLE IPHONE 14 ---
    {
      id: 'off_app_ip14_screen',
      brand_slug: 'apple', brand_name: 'Apple', model_name: 'iPhone 14', variant: 'All Variants',
      comp_id: 'comp_screen', comp_name: 'Display / Screen',
      part_price: 21900, labour_price: 999, is_tax_inclusive: 1,
      source_url: 'https://support.apple.com/en-in/iphone/repair',
      effective_date: '2026-09-15', last_verified_date: '2026-10-24'
    },
    {
      id: 'off_app_ip14_battery',
      brand_slug: 'apple', brand_name: 'Apple', model_name: 'iPhone 14', variant: 'All Variants',
      comp_id: 'comp_battery', comp_name: 'Battery',
      part_price: 8800, labour_price: 999, is_tax_inclusive: 1,
      source_url: 'https://support.apple.com/en-in/iphone/repair',
      effective_date: '2026-09-15', last_verified_date: '2026-10-24'
    },

    // --- APPLE IPHONE 16 PRO ---
    {
      id: 'off_app_ip16p_screen',
      brand_slug: 'apple', brand_name: 'Apple', model_name: 'iPhone 16 Pro', variant: 'All Variants',
      comp_id: 'comp_screen', comp_name: 'Display / Screen',
      part_price: 32500, labour_price: 999, is_tax_inclusive: 1,
      source_url: 'https://support.apple.com/en-in/iphone/repair',
      effective_date: '2026-10-01', last_verified_date: '2026-10-28'
    },
    {
      id: 'off_app_ip16p_battery',
      brand_slug: 'apple', brand_name: 'Apple', model_name: 'iPhone 16 Pro', variant: 'All Variants',
      comp_id: 'comp_battery', comp_name: 'Battery',
      part_price: 10800, labour_price: 999, is_tax_inclusive: 1,
      source_url: 'https://support.apple.com/en-in/iphone/repair',
      effective_date: '2026-10-01', last_verified_date: '2026-10-28'
    },

    // --- XIAOMI / REDMI NOTE 12 ---
    {
      id: 'off_mi_rn12_screen',
      brand_slug: 'redmi', brand_name: 'Redmi', model_name: 'Redmi Note 12', variant: 'All Variants',
      comp_id: 'comp_screen', comp_name: 'Display / Screen',
      part_price: 2999, labour_price: 350, is_tax_inclusive: 1,
      source_url: 'https://www.mi.com/in/support/spare-part-prices/summary/',
      effective_date: '2026-07-01', last_verified_date: '2026-10-20'
    },
    {
      id: 'off_mi_rn12_battery',
      brand_slug: 'redmi', brand_name: 'Redmi', model_name: 'Redmi Note 12', variant: 'All Variants',
      comp_id: 'comp_battery', comp_name: 'Battery',
      part_price: 1399, labour_price: 350, is_tax_inclusive: 1,
      source_url: 'https://www.mi.com/in/support/spare-part-prices/summary/',
      effective_date: '2026-07-01', last_verified_date: '2026-10-20'
    },
    {
      id: 'off_mi_rn12_motherboard_128',
      brand_slug: 'redmi', brand_name: 'Redmi', model_name: 'Redmi Note 12', variant: '128GB',
      comp_id: 'comp_motherboard', comp_name: 'Motherboard',
      part_price: 4999, labour_price: 350, is_tax_inclusive: 1,
      source_url: 'https://www.mi.com/in/support/spare-part-prices/summary/',
      effective_date: '2026-07-01', last_verified_date: '2026-10-20'
    },

    // --- ONEPLUS 11 ---
    {
      id: 'off_op_11_screen',
      brand_slug: 'oneplus', brand_name: 'OnePlus', model_name: 'OnePlus 11', variant: 'All Variants',
      comp_id: 'comp_screen', comp_name: 'Display / Screen',
      part_price: 12400, labour_price: 472, is_tax_inclusive: 1,
      source_url: 'https://www.oneplus.in/support/repair-pricing/details',
      effective_date: '2026-06-15', last_verified_date: '2026-10-22'
    },
    {
      id: 'off_op_11_battery',
      brand_slug: 'oneplus', brand_name: 'OnePlus', model_name: 'OnePlus 11', variant: 'All Variants',
      comp_id: 'comp_battery', comp_name: 'Battery',
      part_price: 2400, labour_price: 472, is_tax_inclusive: 1,
      source_url: 'https://www.oneplus.in/support/repair-pricing/details',
      effective_date: '2026-06-15', last_verified_date: '2026-10-22'
    },

    // --- MOTOROLA EDGE 50 PRO ---
    {
      id: 'off_moto_edge50_screen',
      brand_slug: 'motorola', brand_name: 'Motorola', model_name: 'Edge 50 Pro', variant: 'All Variants',
      comp_id: 'comp_screen', comp_name: 'Display / Screen',
      part_price: 7800, labour_price: 400, is_tax_inclusive: 0,
      source_url: 'https://en-in.support.motorola.com/app/answers/detail/a_id/133816/~/india-out-of-warranty-parts-price-list',
      effective_date: '2026-08-10', last_verified_date: '2026-10-25'
    },
    {
      id: 'off_moto_edge50_battery',
      brand_slug: 'motorola', brand_name: 'Motorola', model_name: 'Edge 50 Pro', variant: 'All Variants',
      comp_id: 'comp_battery', comp_name: 'Battery',
      part_price: 1950, labour_price: 400, is_tax_inclusive: 0,
      source_url: 'https://en-in.support.motorola.com/app/answers/detail/a_id/133816/~/india-out-of-warranty-parts-price-list',
      effective_date: '2026-08-10', last_verified_date: '2026-10-25'
    },

    // --- VIVO V29 ---
    {
      id: 'off_vivo_v29_screen',
      brand_slug: 'vivo', brand_name: 'Vivo', model_name: 'Vivo V29', variant: 'All Variants',
      comp_id: 'comp_screen', comp_name: 'Display / Screen',
      part_price: 6490, labour_price: 354, is_tax_inclusive: 1,
      source_url: 'https://www.vivo.com/in/support/accessory',
      effective_date: '2026-06-01', last_verified_date: '2026-10-20'
    },

    // --- GOOGLE PIXEL 8 ---
    {
      id: 'off_pix_8_screen',
      brand_slug: 'google', brand_name: 'Google', model_name: 'Pixel 8', variant: 'All Variants',
      comp_id: 'comp_screen', comp_name: 'Display / Screen',
      part_price: 15800, labour_price: 850, is_tax_inclusive: 1,
      source_url: 'https://support.google.com/pixelphone/answer/9004345',
      effective_date: '2026-09-01', last_verified_date: '2026-10-27'
    },

    // --- NOTHING PHONE (2) ---
    {
      id: 'off_nothing_2_screen',
      brand_slug: 'nothing', brand_name: 'Nothing', model_name: 'Nothing Phone 2', variant: 'All Variants',
      comp_id: 'comp_screen', comp_name: 'Display / Screen',
      part_price: 9900, labour_price: 500, is_tax_inclusive: 1,
      source_url: 'https://in.nothing.tech/pages/service-center',
      effective_date: '2026-07-15', last_verified_date: '2026-10-20'
    }
  ];

  for (const item of officialData) {
    let subtotal = item.part_price + item.labour_price;
    let total = item.is_tax_inclusive ? subtotal : Math.round(subtotal * 1.18);
    const existing = await get('SELECT id FROM official_repair_prices WHERE id = ?', [item.id]);
    if (!existing) {
      await run(`
        INSERT INTO official_repair_prices (
          id, brand_slug, brand_name, model_name, variant,
          component_id, component_name, currency, part_price,
          labour_price, gst_rate, is_tax_inclusive, other_charges,
          total_price, part_quality, source_url, effective_date, last_verified_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'INR', ?, ?, 0.18, ?, 0, ?, 'Genuine OEM', ?, ?, ?)
      `, [
        item.id, item.brand_slug, item.brand_name, item.model_name, item.variant,
        item.comp_id, item.comp_name, item.part_price, item.labour_price,
        item.is_tax_inclusive, total, item.source_url, item.effective_date, item.last_verified_date
      ]);
    }
  }
  console.log('✓ Official repair prices seeded');

  // 4b. Seed Authorised Service Provider Prices (Aptronix for Apple, etc.)
  const authorisedData = [
    {
      id: 'auth_aptronix_ip15pm_screen',
      brand_slug: 'apple', brand_name: 'Apple', model_name: 'iPhone 15 Pro Max', variant: 'All Variants',
      comp_id: 'comp_screen', comp_name: 'Display / Screen',
      provider_name: 'Aptronix (Apple Authorised Service Provider)',
      city: 'All India',
      part_price: 43243, labour_price: 1000, is_tax_inclusive: 0,
      total_price: 52207,
      part_quality: 'Genuine Apple Factory Part',
      source_url: 'https://portal.aptronixindia.com/service/replacement-charges',
      warranty_terms: '90-Day Apple Official Limited Warranty on Replaced Genuine Part',
      exchange_pricing_terms: 'Exchange pricing valid on return of intact eligible original component. ₹1,000 standard service charge applies.',
      repair_method: 'screen_replacement',
      effective_date: '2026-10-01', last_verified_date: '2026-10-30'
    },
    {
      id: 'auth_aptronix_ip15pm_battery',
      brand_slug: 'apple', brand_name: 'Apple', model_name: 'iPhone 15 Pro Max', variant: 'All Variants',
      comp_id: 'comp_battery', comp_name: 'Battery',
      provider_name: 'Aptronix (Apple Authorised Service Provider)',
      city: 'All India',
      part_price: 6802, labour_price: 1000, is_tax_inclusive: 0,
      total_price: 9206,
      part_quality: 'Genuine Apple Factory Battery',
      source_url: 'https://portal.aptronixindia.com/service/replacement-charges',
      warranty_terms: '90-Day Apple Official Limited Warranty on Replaced Battery',
      exchange_pricing_terms: 'Exchange pricing with return of old battery. ₹1,000 standard service charge applies.',
      repair_method: 'battery_replacement',
      effective_date: '2026-10-01', last_verified_date: '2026-10-30'
    },
    {
      id: 'auth_aptronix_ip15pm_back_glass',
      brand_slug: 'apple', brand_name: 'Apple', model_name: 'iPhone 15 Pro Max', variant: 'All Variants',
      comp_id: 'comp_back_glass', comp_name: 'Back Glass / Rear Panel',
      provider_name: 'Aptronix (Apple Authorised Service Provider)',
      city: 'All India',
      part_price: 15413, labour_price: 1000, is_tax_inclusive: 0,
      total_price: 19367,
      part_quality: 'Genuine Apple Rear Glass Panel',
      source_url: 'https://portal.aptronixindia.com/service/replacement-charges',
      warranty_terms: '90-Day Apple Official Limited Warranty on Replaced Part',
      exchange_pricing_terms: 'Exchange pricing valid on return of eligible rear panel. ₹1,000 service charge applies.',
      repair_method: 'back_glass_replacement',
      effective_date: '2026-10-01', last_verified_date: '2026-10-30'
    },
    {
      id: 'auth_aptronix_ip15pm_camera',
      brand_slug: 'apple', brand_name: 'Apple', model_name: 'iPhone 15 Pro Max', variant: 'All Variants',
      comp_id: 'comp_rear_camera', comp_name: 'Rear Camera',
      provider_name: 'Aptronix (Apple Authorised Service Provider)',
      city: 'All India',
      part_price: 26357, labour_price: 1000, is_tax_inclusive: 0,
      total_price: 32281,
      part_quality: 'Genuine Apple Triple-Camera Module',
      source_url: 'https://portal.aptronixindia.com/service/replacement-charges',
      warranty_terms: '90-Day Apple Official Limited Warranty on Replaced Part',
      exchange_pricing_terms: 'Exchange pricing valid with return of original camera module. ₹1,000 service charge applies.',
      repair_method: 'camera_replacement',
      effective_date: '2026-10-01', last_verified_date: '2026-10-30'
    }
  ];

  for (const item of authorisedData) {
    const existing = await get('SELECT id FROM authorised_provider_prices WHERE id = ?', [item.id]);
    if (!existing) {
      await run(`
        INSERT INTO authorised_provider_prices (
          id, brand_slug, brand_name, model_name, variant,
          component_id, component_name, provider_name, city, currency,
          part_price, labour_price, gst_rate, is_tax_inclusive, other_charges,
          total_price, part_quality, source_url, warranty_terms,
          effective_date, last_verified_date, repair_method, provider_type, exchange_pricing_terms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', ?, ?, 0.18, ?, 0, ?, ?, ?, ?, ?, ?, ?, 'AUTHORISED_AASP', ?)
      `, [
        item.id, item.brand_slug, item.brand_name, item.model_name, item.variant,
        item.comp_id, item.comp_name, item.provider_name, item.city,
        item.part_price, item.labour_price, item.is_tax_inclusive, item.total_price,
        item.part_quality, item.source_url, item.warranty_terms, item.effective_date,
        item.last_verified_date, item.repair_method, item.exchange_pricing_terms
      ]);
    }
  }
  console.log('✓ Authorised provider prices seeded (Aptronix iPhone 15 Pro Max verified)');

  // 5. Seed Local Repair Quotes with Quality Categorization
  // Note: For Galaxy A14 5G Screen & iPhone 14 Screen in Delhi NCR, Mumbai, Bengaluru, we seed >= 3 quotes
  // For other models or smaller cities, we seed 0-2 quotes to test the empty-state requirement.
  const localQuotes = [
    // --- GALAXY A14 5G DISPLAY in DELHI NCR (4 quotes >= 3 => triggers range calculation) ---
    {
      id: 'lq_ga14_delhi_1', brand_slug: 'samsung', brand_name: 'Samsung', model_name: 'Galaxy A14 5G',
      comp_id: 'comp_screen', comp_name: 'Display / Screen', city: 'Delhi NCR',
      shop_name: 'Gaffar Mobile Masters', address_locality: 'Karol Bagh, New Delhi',
      part_price: 1300, labour_price: 250, total_price: 1550,
      part_quality: 'Compatible Aftermarket', warranty_days: 30, quote_date: '2026-10-22'
    },
    {
      id: 'lq_ga14_delhi_2', brand_slug: 'samsung', brand_name: 'Samsung', model_name: 'Galaxy A14 5G',
      comp_id: 'comp_screen', comp_name: 'Display / Screen', city: 'Delhi NCR',
      shop_name: 'Nehru Place LCD Hub', address_locality: 'Nehru Place, New Delhi',
      part_price: 1750, labour_price: 300, total_price: 2050,
      part_quality: 'Refurbished', warranty_days: 60, quote_date: '2026-10-24'
    },
    {
      id: 'lq_ga14_delhi_3', brand_slug: 'samsung', brand_name: 'Samsung', model_name: 'Galaxy A14 5G',
      comp_id: 'comp_screen', comp_name: 'Display / Screen', city: 'Delhi NCR',
      shop_name: 'Apex Chip & Screen Center', address_locality: 'Laxmi Nagar, New Delhi',
      part_price: 2100, labour_price: 300, total_price: 2400,
      part_quality: 'Verified Original (Pulled)', warranty_days: 90, quote_date: '2026-10-26'
    },
    {
      id: 'lq_ga14_delhi_4', brand_slug: 'samsung', brand_name: 'Samsung', model_name: 'Galaxy A14 5G',
      comp_id: 'comp_screen', comp_name: 'Display / Screen', city: 'Delhi NCR',
      shop_name: 'QuickFix Sector 18', address_locality: 'Noida Sector 18',
      part_price: 1500, labour_price: 250, total_price: 1750,
      part_quality: 'Compatible Aftermarket', warranty_days: 30, quote_date: '2026-10-27'
    },

    // --- GALAXY A14 5G BATTERY in DELHI NCR (3 quotes >= 3) ---
    {
      id: 'lq_ga14_bat_delhi_1', brand_slug: 'samsung', brand_name: 'Samsung', model_name: 'Galaxy A14 5G',
      comp_id: 'comp_battery', comp_name: 'Battery', city: 'Delhi NCR',
      shop_name: 'Gaffar Mobile Masters', address_locality: 'Karol Bagh, New Delhi',
      part_price: 650, labour_price: 150, total_price: 800,
      part_quality: 'Compatible Aftermarket', warranty_days: 90, quote_date: '2026-10-22'
    },
    {
      id: 'lq_ga14_bat_delhi_2', brand_slug: 'samsung', brand_name: 'Samsung', model_name: 'Galaxy A14 5G',
      comp_id: 'comp_battery', comp_name: 'Battery', city: 'Delhi NCR',
      shop_name: 'Cellular Care Hub', address_locality: 'Connaught Place, New Delhi',
      part_price: 850, labour_price: 200, total_price: 1050,
      part_quality: 'Verified Original (Pulled)', warranty_days: 90, quote_date: '2026-10-25'
    },
    {
      id: 'lq_ga14_bat_delhi_3', brand_slug: 'samsung', brand_name: 'Samsung', model_name: 'Galaxy A14 5G',
      comp_id: 'comp_battery', comp_name: 'Battery', city: 'Delhi NCR',
      shop_name: 'Noida Battery Station', address_locality: 'Sector 62, Noida',
      part_price: 750, labour_price: 200, total_price: 950,
      part_quality: 'Compatible Aftermarket', warranty_days: 60, quote_date: '2026-10-26'
    },

    // --- IPHONE 14 SCREEN in MUMBAI (3 quotes >= 3) ---
    {
      id: 'lq_ip14_mum_1', brand_slug: 'apple', brand_name: 'Apple', model_name: 'iPhone 14',
      comp_id: 'comp_screen', comp_name: 'Display / Screen', city: 'Mumbai',
      shop_name: 'Lamington Apple Point', address_locality: 'Grant Road, Mumbai',
      part_price: 6800, labour_price: 700, total_price: 7500,
      part_quality: 'Compatible Aftermarket', warranty_days: 30, quote_date: '2026-10-20'
    },
    {
      id: 'lq_ip14_mum_2', brand_slug: 'apple', brand_name: 'Apple', model_name: 'iPhone 14',
      comp_id: 'comp_screen', comp_name: 'Display / Screen', city: 'Mumbai',
      shop_name: 'Heera Panna iFix', address_locality: 'Haji Ali, Mumbai',
      part_price: 11500, labour_price: 800, total_price: 12300,
      part_quality: 'Refurbished', warranty_days: 60, quote_date: '2026-10-23'
    },
    {
      id: 'lq_ip14_mum_3', brand_slug: 'apple', brand_name: 'Apple', model_name: 'iPhone 14',
      comp_id: 'comp_screen', comp_name: 'Display / Screen', city: 'Mumbai',
      shop_name: 'Bandra TechLab', address_locality: 'Hill Road, Bandra West, Mumbai',
      part_price: 13900, labour_price: 1000, total_price: 14900,
      part_quality: 'Verified Original (Pulled)', warranty_days: 90, quote_date: '2026-10-27'
    },

    // --- REDMI NOTE 12 SCREEN in BENGALURU (3 quotes >= 3) ---
    {
      id: 'lq_rn12_blr_1', brand_slug: 'redmi', brand_name: 'Redmi', model_name: 'Redmi Note 12',
      comp_id: 'comp_screen', comp_name: 'Display / Screen', city: 'Bengaluru',
      shop_name: 'SP Road Mobile Square', address_locality: 'SP Road, Bengaluru',
      part_price: 1200, labour_price: 250, total_price: 1450,
      part_quality: 'Compatible Aftermarket', warranty_days: 30, quote_date: '2026-10-18'
    },
    {
      id: 'lq_rn12_blr_2', brand_slug: 'redmi', brand_name: 'Redmi', model_name: 'Redmi Note 12',
      comp_id: 'comp_screen', comp_name: 'Display / Screen', city: 'Bengaluru',
      shop_name: 'Indiranagar TechFix', address_locality: '100ft Road, Indiranagar',
      part_price: 1600, labour_price: 300, total_price: 1900,
      part_quality: 'Refurbished', warranty_days: 60, quote_date: '2026-10-21'
    },
    {
      id: 'lq_rn12_blr_3', brand_slug: 'redmi', brand_name: 'Redmi', model_name: 'Redmi Note 12',
      comp_id: 'comp_screen', comp_name: 'Display / Screen', city: 'Bengaluru',
      shop_name: 'Koramangala Gadget Care', address_locality: '5th Block, Koramangala',
      part_price: 1950, labour_price: 300, total_price: 2250,
      part_quality: 'Verified Original (Pulled)', warranty_days: 90, quote_date: '2026-10-25'
    },

    // --- ONEPLUS 11 SCREEN in HYDERABAD (3 quotes >= 3) ---
    {
      id: 'lq_op11_hyd_1', brand_slug: 'oneplus', brand_name: 'OnePlus', model_name: 'OnePlus 11',
      comp_id: 'comp_screen', comp_name: 'Display / Screen', city: 'Hyderabad',
      shop_name: 'Jagdish Market Pro', address_locality: 'Abids, Hyderabad',
      part_price: 5500, labour_price: 500, total_price: 6000,
      part_quality: 'Compatible Aftermarket', warranty_days: 30, quote_date: '2026-10-19'
    },
    {
      id: 'lq_op11_hyd_2', brand_slug: 'oneplus', brand_name: 'OnePlus', model_name: 'OnePlus 11',
      comp_id: 'comp_screen', comp_name: 'Display / Screen', city: 'Hyderabad',
      shop_name: 'Madhapur Mobile Doc', address_locality: 'Madhapur, Hyderabad',
      part_price: 7800, labour_price: 600, total_price: 8400,
      part_quality: 'Refurbished', warranty_days: 60, quote_date: '2026-10-22'
    },
    {
      id: 'lq_op11_hyd_3', brand_slug: 'oneplus', brand_name: 'OnePlus', model_name: 'OnePlus 11',
      comp_id: 'comp_screen', comp_name: 'Display / Screen', city: 'Hyderabad',
      shop_name: 'Secunderabad Screen Lab', address_locality: 'MG Road, Secunderabad',
      part_price: 9200, labour_price: 600, total_price: 9800,
      part_quality: 'Verified Original (Pulled)', warranty_days: 90, quote_date: '2026-10-26'
    },

    // --- ONLY 1 QUOTE for Galaxy S24 Ultra in Pune (< 3 quotes => tests the < 3 threshold!) ---
    {
      id: 'lq_s24u_pune_1', brand_slug: 'samsung', brand_name: 'Samsung', model_name: 'Galaxy S24 Ultra',
      comp_id: 'comp_screen', comp_name: 'Display / Screen', city: 'Pune',
      shop_name: 'Camp Mobile Clinic', address_locality: 'MG Road, Pune',
      part_price: 11000, labour_price: 800, total_price: 11800,
      part_quality: 'Refurbished', warranty_days: 60, quote_date: '2026-10-25'
    },

    // --- INDEPENDENT THIRD-PARTY CHIP-LEVEL QUOTES FOR IPHONE 15 PRO MAX (Testing Rule 5E) ---
    {
      id: 'lq_ip15pm_pmic_delhi', brand_slug: 'apple', brand_name: 'Apple', model_name: 'iPhone 15 Pro Max',
      comp_id: 'comp_charging_ic', comp_name: 'Charging IC', city: 'Delhi NCR',
      shop_name: 'Gaffar Apple Chip Clinic', address_locality: 'Karol Bagh, New Delhi',
      part_price: 3500, labour_price: 1000, total_price: 4500,
      part_quality: 'Compatible Aftermarket', warranty_days: 30, quote_date: '2026-10-25'
    },
    {
      id: 'lq_ip15pm_pmic_mum', brand_slug: 'apple', brand_name: 'Apple', model_name: 'iPhone 15 Pro Max',
      comp_id: 'comp_charging_ic', comp_name: 'Charging IC', city: 'Mumbai',
      shop_name: 'Lamington Logic Lab', address_locality: 'Grant Road, Mumbai',
      part_price: 3800, labour_price: 1000, total_price: 4800,
      part_quality: 'Compatible Aftermarket', warranty_days: 30, quote_date: '2026-10-26'
    }
  ];

  for (const q of localQuotes) {
    const existing = await get('SELECT id FROM local_repair_quotes WHERE id = ?', [q.id]);
    if (!existing) {
      await run(`
        INSERT INTO local_repair_quotes (
          id, brand_slug, brand_name, model_name, variant,
          component_id, component_name, city, shop_name, address_locality,
          part_price, labour_price, total_price, part_quality, warranty_days,
          warranty_terms, quote_date, is_verified, notes
        ) VALUES (?, ?, ?, ?, 'All Variants', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'Verified local walk-in audit')
      `, [
        q.id, q.brand_slug, q.brand_name, q.model_name,
        q.comp_id, q.comp_name, q.city, q.shop_name, q.address_locality,
        q.part_price, q.labour_price, q.total_price, q.part_quality, q.warranty_days,
        `${q.warranty_days}-Day Workshop Warranty`, q.quote_date
      ]);
    }
  }
  console.log('✓ Local repair quotes seeded (including >=3 and <3 threshold cases)');

  // 6. Ensure device models have storage variants
  const appleBrand = await get('SELECT id FROM brands WHERE slug = "apple"');
  if (appleBrand) {
    const ip15pm = await get('SELECT id FROM device_models WHERE model_name = "iPhone 15 Pro Max"');
    if (!ip15pm) {
      await run(`
        INSERT INTO device_models (id, brand_id, brand_slug, model_name, model_number, category_slug, release_year, is_verified, variants)
        VALUES ('dm_ip15pm', ?, 'apple', 'iPhone 15 Pro Max', 'A3106', 'smartphones', 2023, 1, ?)
      `, [appleBrand.id, JSON.stringify(['256GB', '512GB', '1TB'])]);
    }
  }

  const variantMap = {
    'Galaxy A14 5G': ['64GB', '128GB'],
    'Galaxy S24 Ultra': ['256GB', '512GB', '1TB'],
    'Galaxy S24': ['128GB', '256GB', '512GB'],
    'iPhone 16 Pro': ['128GB', '256GB', '512GB', '1TB'],
    'iPhone 15 Pro Max': ['256GB', '512GB', '1TB'],
    'iPhone 15': ['128GB', '256GB', '512GB'],
    'iPhone 14': ['128GB', '256GB', '512GB'],
    'Redmi Note 12': ['64GB', '128GB'],
    'OnePlus 11': ['128GB', '256GB'],
    'Edge 50 Pro': ['256GB', '512GB'],
    'Pixel 8': ['128GB', '256GB'],
    'Nothing Phone 2': ['128GB', '256GB', '512GB']
  };

  for (const [modelName, variants] of Object.entries(variantMap)) {
    await run(`
      UPDATE device_models SET variants = ? WHERE model_name = ?
    `, [JSON.stringify(variants), modelName]);
  }
  console.log('✓ Device model variants updated');

  console.log('--- Repair Cost Engine Database Seeding Completed ---');
}

if (require.main === module) {
  seedPricingEngine().then(() => process.exit(0)).catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = { seedPricingEngine };
