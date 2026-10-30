/**
 * Official Manufacturer Portals & Service Fee Standards for India
 * Provides direct portal links, standard published labour fees, GST rules, and warranty terms.
 */

const OFFICIAL_MANUFACTURERS = {
  apple: {
    name: 'Apple',
    slug: 'apple',
    portalUrl: 'https://support.apple.com/en-in/iphone/repair',
    standardLabour: 999, // Standard out-of-warranty diagnostic & handling fee in India
    inspectionFee: 799,
    taxInclusive: true,
    gstRate: 0.18,
    warrantyDays: 90,
    warrantyTerms: '90-Day Official Apple Limited Warranty or remainder of AppleCare+',
    notes: 'Official pricing in India includes genuine parts, Apple-certified diagnostics, and calibration with Apple repair tools.'
  },
  samsung: {
    name: 'Samsung',
    slug: 'samsung',
    portalUrl: 'https://www.samsung.com/in/support/out-of-warranty-repair-charges/',
    standardLabour: 450, // Standard smartphone labour fee
    inspectionFee: 250,
    taxInclusive: false, // Samsung portal quotes parts exclusive of GST and labour
    gstRate: 0.18,
    warrantyDays: 90,
    warrantyTerms: '90-Day Samsung Genuine Spare Part Warranty',
    notes: 'Official Samsung Service Centers charge part price + labour charge + 18% GST on both.'
  },
  xiaomi: {
    name: 'Xiaomi',
    slug: 'xiaomi',
    portalUrl: 'https://www.mi.com/in/support/spare-part-prices/summary/',
    standardLabour: 350,
    inspectionFee: 150,
    taxInclusive: true, // Mi portal publishes GST inclusive parts
    gstRate: 0.18,
    warrantyDays: 90,
    warrantyTerms: '90-Day Authorized Mi Care Spare Warranty',
    notes: 'Covers Xiaomi, Redmi, and POCO handsets with published spare price schedules.'
  },
  redmi: {
    name: 'Redmi',
    slug: 'redmi',
    portalUrl: 'https://www.mi.com/in/support/spare-part-prices/summary/',
    standardLabour: 350,
    inspectionFee: 150,
    taxInclusive: true,
    gstRate: 0.18,
    warrantyDays: 90,
    warrantyTerms: '90-Day Authorized Mi Care Spare Warranty',
    notes: 'Serviced across Xiaomi Authorized Service Centers (ASCs).'
  },
  poco: {
    name: 'POCO',
    slug: 'poco',
    portalUrl: 'https://www.mi.com/in/support/spare-part-prices/summary/',
    standardLabour: 350,
    inspectionFee: 150,
    taxInclusive: true,
    gstRate: 0.18,
    warrantyDays: 90,
    warrantyTerms: '90-Day Authorized POCO Service Warranty',
    notes: 'Shared infrastructure with Xiaomi India service centers.'
  },
  oneplus: {
    name: 'OnePlus',
    slug: 'oneplus',
    portalUrl: 'https://www.oneplus.in/support/repair-pricing/details',
    standardLabour: 472, // Inclusive of GST
    inspectionFee: 250,
    taxInclusive: true,
    gstRate: 0.18,
    warrantyDays: 90,
    warrantyTerms: '90-Day OnePlus Official Service Replacement Warranty',
    notes: 'OnePlus provides lifetime screen warranty on select green line issues, otherwise standard out-of-warranty spare prices apply.'
  },
  vivo: {
    name: 'Vivo',
    slug: 'vivo',
    portalUrl: 'https://www.vivo.com/in/support/accessory',
    labourPortalUrl: 'https://www.vivo.com/in/content/labour-cost',
    standardLabour: 354, // Including 18% GST (300 base + 54 GST)
    inspectionFee: 150,
    taxInclusive: true,
    gstRate: 0.18,
    warrantyDays: 90,
    warrantyTerms: '90-Day Vivo India Official Warranty',
    notes: 'Spare part costs published on Vivo India portal; labour cost is standardized across tiers.'
  },
  iqoo: {
    name: 'iQOO',
    slug: 'iqoo',
    portalUrl: 'https://www.vivo.com/in/support/accessory',
    standardLabour: 354,
    inspectionFee: 150,
    taxInclusive: true,
    gstRate: 0.18,
    warrantyDays: 90,
    warrantyTerms: '90-Day iQOO Official Service Center Warranty',
    notes: 'Serviced via Vivo & iQOO Exclusive Service Centers across India.'
  },
  motorola: {
    name: 'Motorola',
    slug: 'motorola',
    portalUrl: 'https://en-in.support.motorola.com/app/answers/detail/a_id/133816/~/india-out-of-warranty-parts-price-list',
    standardLabour: 400,
    inspectionFee: 200,
    taxInclusive: false,
    gstRate: 0.18,
    warrantyDays: 90,
    warrantyTerms: '90-Day Motorola India Service Warranty',
    notes: 'Lenovo / Motorola authorized centers publish base spare costs with 18% GST added upon invoicing.'
  },
  google: {
    name: 'Google Pixel',
    slug: 'google',
    portalUrl: 'https://support.google.com/pixelphone/answer/9004345',
    standardLabour: 850,
    inspectionFee: 500,
    taxInclusive: true,
    gstRate: 0.18,
    warrantyDays: 90,
    warrantyTerms: '90-Day Google / F1 Info Solutions Out-of-Warranty Warranty',
    notes: 'Official Google walk-in and mail-in service handled through F1 Info Solutions & Services across major metros.'
  },
  nothing: {
    name: 'Nothing',
    slug: 'nothing',
    portalUrl: 'https://in.nothing.tech/pages/service-center',
    standardLabour: 500,
    inspectionFee: 250,
    taxInclusive: true,
    gstRate: 0.18,
    warrantyDays: 90,
    warrantyTerms: '90-Day Nothing India Care Warranty',
    notes: 'Nothing partnered with regional multi-brand authorized service networks in India.'
  },
  realme: {
    name: 'Realme',
    slug: 'realme',
    portalUrl: 'https://www.realme.com/in/support/spare-parts-price',
    standardLabour: 354,
    inspectionFee: 150,
    taxInclusive: true,
    gstRate: 0.18,
    warrantyDays: 90,
    warrantyTerms: '90-Day Realme Official Service Warranty',
    notes: 'Official Realme Care price list with real-time model search.'
  },
  oppo: {
    name: 'OPPO',
    slug: 'oppo',
    portalUrl: 'https://support.oppo.com/in/spare-parts-price/',
    standardLabour: 354,
    inspectionFee: 150,
    taxInclusive: true,
    gstRate: 0.18,
    warrantyDays: 90,
    warrantyTerms: '90-Day OPPO India Official Warranty',
    notes: 'Official OPPO customer service centres provide published component rates.'
  }
};

/**
 * Standard 15 Repair Categories in India
 */
const STANDARD_REPAIR_COMPONENTS = [
  { id: 'comp_screen', slug: 'screen-display', name: 'Display / Screen', order: 1, desc: 'Complete front OLED/AMOLED/LCD display assembly, digitizer and glass' },
  { id: 'comp_battery', slug: 'battery', name: 'Battery', order: 2, desc: 'Original Li-ion/Li-Po internal battery replacement with adhesive pull tabs' },
  { id: 'comp_back_glass', slug: 'back-glass', name: 'Back Glass / Rear Panel', order: 3, desc: 'Rear glass panel, camera frame bezel, and adhesive gasket' },
  { id: 'comp_rear_camera', slug: 'rear-camera', name: 'Rear Camera', order: 4, desc: 'Primary rear camera sensor module and optical image stabilizer' },
  { id: 'comp_front_camera', slug: 'front-camera', name: 'Front Camera', order: 5, desc: 'Front selfie camera module and sensor flex cable' },
  { id: 'comp_charging_port', slug: 'charging-port', name: 'Charging Port', order: 6, desc: 'USB Type-C / Lightning charging sub-board connector flex' },
  { id: 'comp_speaker', slug: 'speaker', name: 'Speaker', order: 7, desc: 'Bottom loudspeaker and ringer acoustic buzzer module' },
  { id: 'comp_microphone', slug: 'microphone', name: 'Microphone', order: 8, desc: 'Primary audio input mic module or sub-board microphone array' },
  { id: 'comp_power_button', slug: 'power-button', name: 'Power Button', order: 9, desc: 'Side power switch key flex and internal dome clicker' },
  { id: 'comp_volume_button', slug: 'volume-button', name: 'Volume Button', order: 10, desc: 'Volume rocker switch button flex and contacts' },
  { id: 'comp_motherboard', slug: 'motherboard', name: 'Motherboard', order: 11, desc: 'Main logic board (MLB) replacement with CPU, RAM, and eMMC/UFS storage' },
  { id: 'comp_water_damage', slug: 'water-damage', name: 'Water Damage Treatment / Cleaning', order: 12, desc: 'Ultrasonic board cleaning, corrosion removal, and chemical moisture bake' },
  { id: 'comp_charging_ic', slug: 'charging-ic', name: 'Charging IC', order: 13, desc: 'PMIC / Power management charging micro-soldering IC chip repair' },
  { id: 'comp_software', slug: 'software-repair', name: 'Software Repair / Flashing', order: 14, desc: 'Bootloop recovery, official firmware reflash, and OS re-installation' },
  { id: 'comp_other', slug: 'other-repairs', name: 'Other Repairs', order: 15, desc: 'Vibrator motor, SIM tray, thermal pad, or specialized diagnostic repair' }
];

const AUTHORISED_SERVICE_PROVIDERS = {
  aptronix: {
    name: 'Aptronix (Apple Authorised Service Provider)',
    slug: 'aptronix',
    brand: 'Apple',
    brandSlug: 'apple',
    portalUrl: 'https://portal.aptronixindia.com/service/replacement-charges',
    serviceInfoUrl: 'https://www.aptronixindia.com/pages/service',
    standardServiceCharge: 1000, // Aptronix published ₹1,000 service charge for repairs involving part replacement
    inspectionFee: 999,
    taxInclusive: false,
    gstRate: 0.18,
    warrantyDays: 90,
    warrantyTerms: '90-Day Apple Official Limited Warranty on Replaced Genuine Part',
    notes: 'Aptronix published terms: ₹1,000 service charge applies to repairs involving part replacements in India.'
  },
  f1_info: {
    name: 'F1 Info Solutions & Services (Google / Asus Partner)',
    slug: 'f1_info',
    brand: 'Google',
    brandSlug: 'google',
    portalUrl: 'https://support.google.com/pixelphone/answer/9004345',
    standardServiceCharge: 850,
    inspectionFee: 500,
    taxInclusive: true,
    gstRate: 0.18,
    warrantyDays: 90,
    warrantyTerms: '90-Day Manufacturer Authorized Service Warranty',
    notes: 'Official walk-in and mail-in service network across Indian metros.'
  }
};

function getManufacturerConfig(brandSlug) {
  if (!brandSlug) return null;
  const key = brandSlug.toLowerCase().trim().replace(/\s+/g, '-');
  return OFFICIAL_MANUFACTURERS[key] || null;
}

function getAuthorisedProviderConfig(providerSlug) {
  if (!providerSlug) return null;
  return AUTHORISED_SERVICE_PROVIDERS[providerSlug] || null;
}

module.exports = {
  OFFICIAL_MANUFACTURERS,
  AUTHORISED_SERVICE_PROVIDERS,
  STANDARD_REPAIR_COMPONENTS,
  getManufacturerConfig,
  getAuthorisedProviderConfig
};
