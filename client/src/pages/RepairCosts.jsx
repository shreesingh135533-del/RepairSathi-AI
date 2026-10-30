import React, { useState, useEffect } from 'react';
import {
  Coins,
  Search,
  Building2,
  ShieldCheck,
  Wrench,
  Sparkles,
  MapPin,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  ChevronDown,
  Info,
  Calendar,
  Percent,
  Clock,
  ArrowRight,
  ShieldAlert,
  Send,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';

import AutocompleteInput from '../components/AutocompleteInput';

export default function RepairCosts({ initialFilters = null, onStartDiagnosis = null }) {
  // 6 Search Inputs
  const [brand, setBrand] = useState(initialFilters?.brand || 'Samsung');
  const [model, setModel] = useState(initialFilters?.model || 'Galaxy A14 5G');
  const [variant, setVariant] = useState(initialFilters?.variant || 'All Variants');
  const [component, setComponent] = useState(initialFilters?.component || 'Display / Screen');
  const [city, setCity] = useState(initialFilters?.city || 'Delhi NCR');
  const [warrantyStatus, setWarrantyStatus] = useState(initialFilters?.warrantyStatus || 'out_of_warranty');

  // Dynamic dropdown data
  const [componentsList, setComponentsList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [variantsList, setVariantsList] = useState(['All Variants', '64GB', '128GB', '256GB', '512GB']);
  const [manufacturersList, setManufacturersList] = useState([]);

  // Query Results State
  const [loading, setLoading] = useState(false);
  const [costData, setCostData] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Submit Quote Modal State
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteShopName, setQuoteShopName] = useState('');
  const [quoteLocality, setQuoteLocality] = useState('');
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteQuality, setQuoteQuality] = useState('Compatible Aftermarket');
  const [quoteWarrantyDays, setQuoteWarrantyDays] = useState(30);
  const [quoteNotes, setQuoteNotes] = useState('');
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState('');

  // Load components, cities, manufacturers
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const compRes = await fetch('/api/costs/components');
        const compData = await compRes.json();
        if (compData.components) setComponentsList(compData.components);

        const cityRes = await fetch('/api/costs/cities');
        const cityData = await cityRes.json();
        if (cityData.cities) setCitiesList(cityData.cities);

        const mfgRes = await fetch('/api/costs/manufacturers');
        const mfgData = await mfgRes.json();
        if (mfgData.manufacturers) setManufacturersList(mfgData.manufacturers);
      } catch (err) {
        console.error('Failed to fetch pricing metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Update variants when model changes
  useEffect(() => {
    if (!model.trim()) return;
    const fetchVariants = async () => {
      try {
        const res = await fetch(`/api/costs/variants?model=${encodeURIComponent(model.trim())}`);
        const data = await res.json();
        if (data.variants && data.variants.length > 0) {
          setVariantsList(data.variants);
          if (!data.variants.includes(variant)) {
            setVariant('All Variants');
          }
        }
      } catch (err) {
        console.error('Failed to fetch variants:', err);
      }
    };
    fetchVariants();
  }, [model]);

  // Execute initial query
  useEffect(() => {
    handleSearch();
  }, []);

  const fetchBrandSuggestions = async (q) => {
    try {
      const res = await fetch(`/api/devices/brands?category=smartphones&query=${encodeURIComponent(q)}`);
      const data = await res.json();
      return data.brands || [];
    } catch {
      return [];
    }
  };

  const fetchModelSuggestions = async (q) => {
    try {
      const bSlug = brand.toLowerCase().trim().replace(/\s+/g, '-');
      const res = await fetch(`/api/devices/models?category=smartphones&brandSlug=${encodeURIComponent(bSlug)}&query=${encodeURIComponent(q)}`);
      const data = await res.json();
      return data.models || [];
    } catch {
      return [];
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!brand.trim() || !model.trim()) {
      setErrorMessage('Please specify device brand and exact model.');
      return;
    }

    setErrorMessage('');
    setLoading(true);
    setHasSearched(true);

    try {
      const url = `/api/costs/query?brand=${encodeURIComponent(brand.trim())}&model=${encodeURIComponent(model.trim())}&variant=${encodeURIComponent(variant)}&component=${encodeURIComponent(component)}&city=${encodeURIComponent(city)}&warranty_status=${encodeURIComponent(warrantyStatus)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok) {
        setCostData(data);
      } else {
        setErrorMessage(data.error || 'Failed to retrieve price benchmarks');
        setCostData(null);
      }
    } catch (err) {
      console.error('Search error:', err);
      setErrorMessage('Network connection error while fetching repair prices.');
      setCostData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    setQuoteSubmitting(true);
    setQuoteSuccessMsg('');
    try {
      const res = await fetch('/api/costs/submit-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand,
          model,
          component,
          city,
          shop_name: quoteShopName,
          address_locality: quoteLocality,
          total_price: quotePrice,
          part_quality: quoteQuality,
          warranty_days: quoteWarrantyDays,
          notes: quoteNotes
        })
      });
      const data = await res.json();
      if (res.ok) {
        setQuoteSuccessMsg(data.message || 'Quotation submitted for verification!');
        setTimeout(() => {
          setShowQuoteModal(false);
          setQuoteShopName('');
          setQuoteLocality('');
          setQuotePrice('');
          setQuoteSuccessMsg('');
        }, 2200);
      } else {
        alert(data.error || 'Failed to submit quote');
      }
    } catch (err) {
      alert('Error submitting quotation');
    } finally {
      setQuoteSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          OFFICIAL INDIA SPARE MATRICES • AUDITED LOCAL QUOTATIONS
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
          Live Repair Cost Intelligence
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 font-sans max-w-3xl">
          Search real manufacturer out-of-warranty price lists, multi-shop local workshop quotations, and RepairSathi fair price indices across India with 100% tax transparency.
        </p>
      </div>

      {/* 6-Input Search Console */}
      <form onSubmit={handleSearch} className="mb-10 p-6 sm:p-7 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.08] shadow-xl shadow-black/5 dark:shadow-black/25">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* 1. Manufacturer */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              1. Manufacturer (Brand)
            </label>
            <AutocompleteInput
              value={brand}
              placeholder="e.g. Apple, Samsung, Xiaomi"
              fetchSuggestions={fetchBrandSuggestions}
              onChange={(val) => setBrand(val)}
              onSelect={(b) => setBrand(b ? b.name : '')}
            />
          </div>

          {/* 2. Exact Phone Model */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              2. Exact Phone Model
            </label>
            <AutocompleteInput
              value={model}
              placeholder="e.g. Galaxy A14 5G, iPhone 15"
              fetchSuggestions={fetchModelSuggestions}
              onChange={(val) => setModel(val)}
              onSelect={(m) => setModel(m ? (m.model_name || m) : '')}
            />
          </div>

          {/* 3. Storage / RAM Variant */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              3. Storage Variant
            </label>
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-charcoal-850 text-slate-900 dark:text-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {variantsList.map((v, i) => (
                <option key={i} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* 4. Repair Category (15 Categories) */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              4. Repair Category (15 Standard)
            </label>
            <select
              value={component}
              onChange={(e) => setComponent(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-charcoal-850 text-slate-900 dark:text-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {componentsList.length > 0 ? (
                componentsList.map((c) => (
                  <option key={c.id || c.slug} value={c.name}>{c.name}</option>
                ))
              ) : (
                <>
                  <option value="Display / Screen">Display / Screen</option>
                  <option value="Battery">Battery</option>
                  <option value="Back Glass / Rear Panel">Back Glass / Rear Panel</option>
                  <option value="Rear Camera">Rear Camera</option>
                  <option value="Front Camera">Front Camera</option>
                  <option value="Charging Port">Charging Port</option>
                  <option value="Speaker">Speaker</option>
                  <option value="Microphone">Microphone</option>
                  <option value="Power Button">Power Button</option>
                  <option value="Volume Button">Volume Button</option>
                  <option value="Motherboard">Motherboard</option>
                  <option value="Water Damage Treatment / Cleaning">Water Damage Treatment / Cleaning</option>
                  <option value="Charging IC">Charging IC</option>
                  <option value="Software Repair / Flashing">Software Repair / Flashing</option>
                  <option value="Other Repairs">Other Repairs</option>
                </>
              )}
            </select>
          </div>

          {/* 5. City / Location in India */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              5. City / Location in India
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-charcoal-850 text-slate-900 dark:text-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {citiesList.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 6. Warranty Status */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              6. Device Warranty Status
            </label>
            <select
              value={warrantyStatus}
              onChange={(e) => setWarrantyStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-charcoal-850 text-slate-900 dark:text-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="out_of_warranty">Out of Warranty (Standard)</option>
              <option value="in_warranty">In-Warranty (Within 1-Year Brand Period)</option>
              <option value="extended_brand_care">Extended Care (AppleCare+ / Care+)</option>
            </select>
          </div>

        </div>

        {/* Action & Metadata bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Strict Indian GST (18%) separation • Zero simulated or fabricated prices</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowQuoteModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 text-xs font-mono font-medium transition-colors"
            >
              + Submit Workshop Quote
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-heading font-bold text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-500/20"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning Market Portals...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Compare Repair Costs</span>
                </>
              )}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </form>

      {/* Main Results View */}
      {costData && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Result Header & Warranty Advisory */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 dark:border-white/[0.06] pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400 font-bold uppercase mb-1">
                  <span>{costData.device.brand}</span>
                  <span>•</span>
                  <span>{costData.device.model}</span>
                  <span>•</span>
                  <span className="text-slate-500">{costData.device.variant}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <MapPin className="w-3 h-3" /> {costData.device.city}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
                  {costData.device.component}
                </h2>
              </div>

              {onStartDiagnosis && (
                <button
                  type="button"
                  onClick={() => onStartDiagnosis({
                    category: 'smartphones',
                    brand: costData.device.brand,
                    model: costData.device.model,
                    problemDescription: `Repair requirement for ${costData.device.component}`
                  })}
                  className="px-4 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/30 text-blue-600 dark:text-blue-400 font-mono font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>Run AI Diagnosis For This Part</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Contextual Warranty Advisory */}
            {costData.warrantyAdvisory && (
              <div className={`p-4 rounded-2xl border text-xs font-sans flex items-start gap-3 ${
                costData.device.warrantyStatus === 'in_warranty'
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200'
                  : costData.device.warrantyStatus === 'extended_brand_care'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-200'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-900 dark:text-blue-200'
              }`}>
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-heading font-bold uppercase font-mono tracking-wider text-[11px] block">
                    Warranty Advisory: {costData.warrantyAdvisory.status} — {costData.warrantyAdvisory.recommendation}
                  </span>
                  <p className="mt-1 leading-relaxed opacity-90">
                    {costData.warrantyAdvisory.detail}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 3 DISTINCT PRICE TIERS (CRITICAL ARCHITECTURE) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* TIER A: OFFICIAL MANUFACTURER / AUTHORISED REPAIR PRICE */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.08] shadow-sm flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" /> Tier A: Official Manufacturer
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-bold">
                    OEM
                  </span>
                </div>

                {costData.official ? (
                  <div className="mt-3">
                    <p className="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
                      ₹{costData.official.finalTotal.toLocaleString()}
                    </p>
                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                      {costData.official.isTaxInclusive ? '18% GST Inclusive' : '+ 18% GST Added'}
                    </span>

                    {/* Breakdown */}
                    <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-charcoal-850 border border-slate-200/70 dark:border-white/[0.06] space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>Original Spare Part:</span>
                        <span className="font-bold">₹{costData.official.partPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>Certified Labour:</span>
                        <span className="font-bold">₹{costData.official.labourPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 pt-1.5 border-t border-slate-200/50 dark:border-white/[0.05]">
                        <span>GST Component (18%):</span>
                        <span>₹{costData.official.gstAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-xs font-sans">
                      <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>Quality:</strong> {costData.official.partQuality} (Factory Calibrated)</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>Warranty:</strong> {costData.official.warrantyTerms}</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-500 text-[11px]">
                        <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>Last Verified: {costData.official.lastVerifiedDate}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-charcoal-850 text-slate-500 text-xs font-mono">
                    No published manufacturer spare bulletin for this component.
                  </div>
                )}
              </div>

              {costData.official?.sourceUrl && (
                <a
                  href={costData.official.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-amber-500/20"
                >
                  <span>Verify on Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* TIER B: LOCAL REPAIR SHOP PRICE (CRITICAL >= 3 QUOTES RULE) */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.08] shadow-sm flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4" /> Tier B: Verified Local Shops
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                    {costData.local?.hasSufficientQuotes ? `${costData.local.quoteCount} Quotes` : 'Audit Alert'}
                  </span>
                </div>

                {costData.local?.hasSufficientQuotes ? (
                  <div className="mt-3">
                    <p className="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
                      ₹{costData.local.minTotal.toLocaleString()} – ₹{costData.local.maxTotal.toLocaleString()}
                    </p>
                    <span className="text-xs font-mono text-slate-500 block mt-0.5">
                      Average: ₹{costData.local.avgTotal.toLocaleString()} in {costData.local.city}
                    </span>

                    {/* Part Quality Categorization Breakdown */}
                    <div className="mt-4 space-y-2 text-xs">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                        Part Quality & Price Tiers:
                      </span>
                      {costData.local.qualityBreakdown?.map((q, idx) => (
                        <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-charcoal-850 border border-slate-200/50 dark:border-white/[0.05] flex justify-between items-center font-mono">
                          <span className="text-slate-700 dark:text-slate-300 text-[11px]">{q.quality}</span>
                          <span className="font-bold text-slate-900 dark:text-white text-[11px]">
                            ₹{q.minPrice.toLocaleString()} {q.minPrice !== q.maxPrice ? `– ₹${q.maxPrice.toLocaleString()}` : ''}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Sample Audited Shops */}
                    {costData.local.sampleQuotes && (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] space-y-1.5">
                        <span className="text-[10px] font-mono text-slate-400 block uppercase">Audited Hubs:</span>
                        {costData.local.sampleQuotes.map((s, idx) => (
                          <div key={idx} className="flex justify-between text-[11px] font-sans text-slate-500">
                            <span>{s.shopName} ({s.locality})</span>
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">₹{s.totalPrice}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* CRITICAL MANDATORY EMPTY STATE MESSAGE */
                  <div className="mt-4 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-3">
                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                    <p className="text-xs font-mono font-bold text-amber-800 dark:text-amber-300 leading-relaxed">
                      "{costData.local?.notice || 'No verified local repair quotations available for this model and location yet.'}"
                    </p>
                    <p className="text-[11px] font-sans text-slate-600 dark:text-slate-400">
                      We require a minimum of 3 independent, audited workshop quotations to compute an honest local price range without misrepresenting market rates.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowQuoteModal(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-charcoal-850 hover:bg-slate-200 dark:hover:bg-charcoal-800 text-slate-800 dark:text-slate-200 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-white/[0.08]"
              >
                <span>Submit Local Quotation</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* TIER C: REPAIRSATHI ESTIMATED PRICE */}
            <div className="p-6 sm:p-7 rounded-3xl bg-blue-600/10 dark:bg-blue-950/40 border-2 border-blue-500/40 dark:border-blue-500/40 flex flex-col justify-between space-y-5 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/10 rounded-full blur-xl pointer-events-none"></div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Tier C: RepairSathi Index
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500 text-white font-bold">
                    Fair Benchmark
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-3xl font-heading font-extrabold text-blue-600 dark:text-white">
                    ₹{costData.estimate?.amount.toLocaleString()}
                  </p>
                  
                  {/* CRITICAL MANDATORY LABEL */}
                  <span className="inline-block mt-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-mono font-bold">
                    {costData.estimate?.label || 'Estimated price — not an official quotation'}
                  </span>

                  <div className="mt-4 p-3.5 rounded-2xl bg-white/60 dark:bg-charcoal-900/60 border border-blue-500/20 space-y-2 text-xs font-sans">
                    <div className="flex justify-between items-center font-mono text-[11px]">
                      <span className="text-slate-500">Confidence Score:</span>
                      <span className={`font-bold px-2 py-0.5 rounded ${
                        costData.estimate?.confidence === 'High' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                      }`}>
                        {costData.estimate?.confidence} Confidence
                      </span>
                    </div>

                    <div className="pt-2 border-t border-blue-500/10 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                      <strong>Methodology:</strong> {costData.estimate?.methodology}
                    </div>
                  </div>
                </div>
              </div>

              {onStartDiagnosis && (
                <button
                  type="button"
                  onClick={() => onStartDiagnosis({
                    category: 'smartphones',
                    brand: costData.device.brand,
                    model: costData.device.model,
                    problemDescription: `Need repair consultation for ${costData.device.component}`
                  })}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-blue-500/20"
                >
                  <span>Troubleshoot First With AI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* COMPREHENSIVE SIDE-BY-SIDE COMPARISON TABLE */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-5">
            <div>
              <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-blue-500" />
                Comprehensive Channel Comparison
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Evaluate quality, warranties, turnaround time, water-resistance preservation, and true costs.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/[0.08] text-[11px] font-mono text-slate-400 uppercase">
                    <th className="py-3 px-3">Dimension</th>
                    <th className="py-3 px-3 text-amber-600 dark:text-amber-400 font-bold">Official Service Center</th>
                    <th className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-bold">Verified Local Workshop</th>
                    <th className="py-3 px-3 text-blue-600 dark:text-blue-400 font-bold">RepairSathi Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                  <tr>
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">Part Quality</td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200">100% Genuine OEM Factory Part</td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200">Compatible Grade A or Verified Pulled</td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-medium">OEM for Screens/Motherboard; Verified for Battery</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">Warranty Coverage</td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200">90-Day Pan-India Brand Warranty</td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200">30–60 Day Testing Warranty (Shop Specific)</td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-medium">Verify written receipt with IMEI recorded</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">Turnaround Time</td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200">2 to 7 working days (order lead-time)</td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200">Same day (30 to 120 minutes)</td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-medium">Local for urgent repairs; Official if spare available</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">IP68 Water Seals</td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200">Restored using OEM thermal compression jigs</td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200">Manual liquid glue (water resistance compromised)</td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-medium">Avoid submersion post-repair regardless of channel</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">Software Calibration</td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200">TrueTone, FaceID, Fingerprint paired via server</td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200">May trigger "Important Display/Battery Message"</td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-medium">Official recommended for Apple FaceID / TrueTone</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">Cost Impact</td>
                    <td className="py-3 px-3 text-amber-600 dark:text-amber-400 font-bold">Higher Premium (Fixed)</td>
                    <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-bold">30% to 60% Savings</td>
                    <td className="py-3 px-3 text-blue-600 dark:text-blue-400 font-bold">Best Value Index: ₹{costData.estimate?.amount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-charcoal-850 text-slate-500 text-[11px] font-mono">
              {costData.taxDisclaimer}
            </div>
          </div>

        </div>
      )}

      {/* Community Quotation Submission Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-charcoal-900 rounded-3xl border border-slate-200 dark:border-white/[0.08] p-6 sm:p-7 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <div>
                <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white">
                  Submit Local Workshop Quotation
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Help fellow device owners track authentic repair market rates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuoteModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-mono font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitQuote} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Device: {brand} {model} ({component})
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-600 dark:text-slate-300 mb-1">
                  Workshop / Shop Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gaffar Mobile Hub, Lamington Tech"
                  value={quoteShopName}
                  onChange={(e) => setQuoteShopName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-charcoal-850 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-600 dark:text-slate-300 mb-1">
                    Locality / Market *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karol Bagh, SP Road"
                    value={quoteLocality}
                    onChange={(e) => setQuoteLocality(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-charcoal-850 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-600 dark:text-slate-300 mb-1">
                    Total Quotation (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1800"
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-charcoal-850 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-600 dark:text-slate-300 mb-1">
                    Part Quality
                  </label>
                  <select
                    value={quoteQuality}
                    onChange={(e) => setQuoteQuality(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-charcoal-850 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Compatible Aftermarket">Compatible Aftermarket</option>
                    <option value="Refurbished">Refurbished</option>
                    <option value="Verified Original (Pulled)">Verified Original (Pulled)</option>
                    <option value="Genuine OEM">Genuine OEM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-600 dark:text-slate-300 mb-1">
                    Shop Warranty Days
                  </label>
                  <select
                    value={quoteWarrantyDays}
                    onChange={(e) => setQuoteWarrantyDays(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-charcoal-850 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={30}>30 Days</option>
                    <option value={60}>60 Days</option>
                    <option value={90}>90 Days</option>
                    <option value={180}>180 Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-600 dark:text-slate-300 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Includes screen guard installation and free cleanup"
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-charcoal-850 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                ></textarea>
              </div>

              {quoteSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
                  {quoteSuccessMsg}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-charcoal-850 text-slate-700 dark:text-slate-300 font-mono text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quoteSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs flex items-center gap-1.5"
                >
                  {quoteSubmitting ? 'Submitting...' : 'Submit For Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
