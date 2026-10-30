import React, { useState } from 'react';
import {
  Wrench,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Laptop,
  Tv,
  Refrigerator,
  Wind,
  Fan,
  Microwave,
  Wifi,
  Cpu,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Coins,
  Search,
  Zap,
  Building2,
  ExternalLink,
  Flame,
  Check
} from 'lucide-react';

export default function Home({ onStartDiagnosis, onSelectCategory, onNavigateCost }) {
  const [quickInput, setQuickInput] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

  const categories = [
    { id: 'smartphones', name: 'Smartphones', icon: '📱', desc: 'Charging, battery, screens' },
    { id: 'laptops-computers', name: 'Laptops & PCs', icon: '💻', desc: 'Overheating, boot, fans' },
    { id: 'television', name: 'Television', icon: '📺', desc: 'Backlights, sound, lines' },
    { id: 'refrigerators', name: 'Refrigerators', icon: '❄️', desc: 'Cooling, frost, compressor' },
    { id: 'washing-machines', name: 'Washing Machines', icon: '🧺', desc: 'Drainage, spin noise, pumps' },
    { id: 'air-conditioners', name: 'Air Conditioners', icon: '💨', desc: 'Warm air, gas leaks, ice' },
    { id: 'fans', name: 'Fans', icon: '🌀', desc: 'Capacitor, slow speeds' },
    { id: 'kitchen-appliances', name: 'Kitchen Tech', icon: '⚡', desc: 'Mixers, microwaves, ovens' },
    { id: 'wifi-routers', name: 'Wi-Fi Routers', icon: '📡', desc: 'Red LOS lights, drops' },
    { id: 'other-electronics', name: 'Other Tech', icon: '🔌', desc: 'Inverters, gadgets, audio' }
  ];

  const popularProblems = [
    {
      title: 'Phone not charging unless held at angle',
      category: 'smartphones',
      brand: 'Samsung',
      model: 'Galaxy A14 5G',
      query: 'My phone does not charge unless I hold the cable at a specific angle.'
    },
    {
      title: 'Laptop overheating with screaming fan',
      category: 'laptops-computers',
      brand: 'Dell',
      model: 'Inspiron 15 3520',
      query: 'Laptop is getting burning hot on the bottom and the cooling fan is loud.'
    },
    {
      title: 'Washing machine not draining with water inside',
      category: 'washing-machines',
      brand: 'Samsung',
      model: 'Galaxy A14 5G',
      errorCode: '4C',
      query: 'Washing machine stops with water inside and shows 4C / 5E error code.'
    },
    {
      title: 'Fridge freezer freezing but bottom compartment warm',
      category: 'refrigerators',
      brand: 'LG',
      model: 'GL-S292RDSX',
      query: 'The freezer is making ice but the bottom refrigerator compartment is completely warm.'
    },
    {
      title: 'Split AC blowing room-temperature air',
      category: 'air-conditioners',
      brand: 'Daikin',
      model: 'FTKF50TV',
      query: 'The split AC indoor fan runs but only throws normal warm air instead of cooling.'
    },
    {
      title: 'Wi-Fi router Red LOS light flashing',
      category: 'wifi-routers',
      brand: 'TP-Link',
      model: 'Archer AX73',
      query: 'Router power is on but LOS light is flashing red and internet is down.'
    }
  ];

  const faqs = [
    {
      q: 'Do I need to upload photos of my broken device?',
      a: 'No! RepairSathi AI is 100% photo-free. You simply select your device category, choose your verified brand and model, and describe the symptoms in plain English or Hinglish. Our AI maps your issue against genuine service schematics and error code databases without requiring photos.'
    },
    {
      q: 'How does Repair Cost Intelligence work?',
      a: 'We aggregate official manufacturer published spare parts pricing (like Samsung, Apple, Xiaomi, LG), authorized service center benchmarks, and verified local repair quotations across major Indian metros. We show you exact component costs, labour charges, and tax breakdowns so you never get overcharged.'
    },
    {
      q: 'Will RepairSathi tell me when it is unsafe to DIY?',
      a: 'Absolutely. We enforce an active safety protocol. If your problem description indicates smoke, burning smell, sparking, high-voltage components (like microwave magnetrons), or swollen lithium batteries, our engine immediately locks DIY disassembly and provides emergency safety steps.'
    },
    {
      q: 'What if my device model is unlisted?',
      a: 'Our catalogue contains hundreds of verified brands and models. If your model is a newer revision or unlisted, you can check the "Unlisted Model" option to continue with general appliance architectural troubleshooting.'
    }
  ];

  const handleQuickSearchSubmit = (e) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onStartDiagnosis({ problemDescription: quickInput.trim() });
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 px-4 sm:px-6 max-w-6xl mx-auto text-center">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/15 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative space-y-6 max-w-4xl mx-auto">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-xs font-mono font-medium text-slate-700 dark:text-slate-200">
            <span className="w-2 h-2 rounded-full bg-acid animate-pulse"></span>
            <span>NEXT-GEN REPAIR INTELLIGENCE • ZERO BULLSHIT PRICING</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-7xl font-heading font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.08]">
            Your Device Has a Problem.<br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400">
              We've Got the Fix.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 font-sans max-w-2xl mx-auto leading-relaxed">
            Smart diagnostics. Real repair prices. Better decisions. All in one place.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onStartDiagnosis()}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-heading font-bold text-base flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/25 glow-blue"
            >
              <Sparkles className="w-5 h-5 text-acid" />
              <span>Diagnose My Device</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateCost ? onNavigateCost() : onSelectCategory('knowledge')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-charcoal-850 hover:bg-slate-50 dark:hover:bg-charcoal-800 text-slate-900 dark:text-white border border-slate-200 dark:border-white/[0.1] font-heading font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Coins className="w-5 h-5 text-blue-500" />
              <span>Check Repair Costs</span>
            </button>
          </div>

          {/* Stylish Hero Search Interface */}
          <div className="pt-6 max-w-2xl mx-auto">
            <form onSubmit={handleQuickSearchSubmit} className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="Describe your issue: e.g. Phone screen flickering, AC not cooling, washing machine E20..."
                className="w-full pl-12 pr-28 py-4 rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-charcoal-900/90 backdrop-blur-md text-slate-900 dark:text-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-lg shadow-black/5"
              />
              <button
                type="submit"
                className="absolute right-2.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs transition-colors"
              >
                Inspect
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 2. ANIMATED DEVICE CATEGORIES SECTION */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Hardware Coverage
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white mt-0.5">
              Select Your Appliance Category
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">Zero photo uploads needed</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectCategory(c.id)}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.07] hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-200 text-left group flex flex-col justify-between shadow-sm"
            >
              <div>
                <span className="text-3xl sm:text-4xl block mb-2 group-hover:scale-110 transition-transform">{c.icon}</span>
                <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                  {c.name}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-2 leading-tight">
                {c.desc}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* 3. REPAIR COST INTELLIGENCE PREVIEW (GEN Z CARD) */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-blue-900/20 via-charcoal-900 to-charcoal-950 border border-blue-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold">
                <Coins className="w-3.5 h-3.5 text-acid" /> REPAIR COST TRANSPARENCY
              </div>
              <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-white leading-tight">
                Never Pay Double for a Smartphone or Appliance Fix.
              </h2>
              <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
                Service centers quote wildly different numbers. We publish genuine manufacturer spare lists alongside audited local repair benchmarks so you know the exact fair price before handing over your gear.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateCost ? onNavigateCost() : onSelectCategory('knowledge')}
                  className="px-6 py-3.5 rounded-2xl bg-white text-slate-950 font-heading font-bold text-sm hover:bg-slate-100 flex items-center gap-2 transition-all shadow-md"
                >
                  <span>Explore Verified Price Benchmarks</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Live Comparison Preview Card */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-charcoal-850/90 border border-white/[0.1] backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="font-mono text-xs text-slate-300">
                  <span className="font-bold text-white">Samsung Galaxy A14 5G</span> • Screen Replacement
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                  Delhi NCR
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3.5 rounded-xl bg-charcoal-900 border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block">Official Brand Center</span>
                  <span className="text-lg font-heading font-extrabold text-white mt-1 block">₹3,150</span>
                  <span className="text-[10px] text-slate-400 font-sans">OEM Original + ₹500 Labour</span>
                </div>

                <div className="p-3.5 rounded-xl bg-charcoal-900 border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">Verified Local Workshop</span>
                  <span className="text-lg font-heading font-extrabold text-white mt-1 block">₹1,650 – ₹2,100</span>
                  <span className="text-[10px] text-slate-400 font-sans">Grade A+ Panel + ₹350 Labour</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-between text-xs font-mono">
                <span className="text-blue-300 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-acid" /> RepairSathi Fair Price Index:
                </span>
                <span className="text-white font-extrabold text-sm">₹2,150 (GST Included)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. POPULAR REPAIR PROBLEMS QUICK-LAUNCH */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Instant Diagnosis
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white mt-0.5">
              Popular Troubleshooting Scenarios
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">1-Click Pre-filled Inspection</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularProblems.map((prob, idx) => (
            <div
              key={idx}
              onClick={() => onStartDiagnosis(prob)}
              className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.07] hover:border-blue-500/50 hover:shadow-lg cursor-pointer transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400 uppercase">{prob.brand}</span>
                  {prob.errorCode && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                      Code {prob.errorCode}
                    </span>
                  )}
                </div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                  {prob.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-2 line-clamp-2">
                  {prob.query}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                <span>Run Diagnosis</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HOW IT WORKS (3 STEPS) */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Frictionless Flow
          </span>
          <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-white mt-1">
            How RepairSathi Works
          </h2>
          <p className="text-sm text-slate-500 font-sans mt-2">
            No endless forum scrolling, no image upload headaches, no technician scams.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.07] space-y-3">
            <span className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-mono font-extrabold text-lg flex items-center justify-center">
              1
            </span>
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              Pick Your Exact Device
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
              Autocompletes your verified brand and model from our 400+ device catalogue, guaranteeing technical relevance.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.07] space-y-3">
            <span className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-mono font-extrabold text-lg flex items-center justify-center">
              2
            </span>
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              Describe in Plain Words
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
              Our semantic validator parses English or Hinglish symptoms and decodes cryptic error codes instantly.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.07] space-y-3">
            <span className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-mono font-extrabold text-lg flex items-center justify-center">
              3
            </span>
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              Get Steps & Price Truth
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
              Receive verified DIY troubleshooting procedures, safety hazard stops, and genuine market repair price benchmarks.
            </p>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section className="px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white mt-1">
            Frequently Answered Truths
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, fIdx) => (
            <div
              key={fIdx}
              className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-charcoal-900 overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === fIdx ? -1 : fIdx)}
                className="w-full p-5 text-left font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                {openFaq === fIdx ? <ChevronUp className="w-4 h-4 shrink-0 text-blue-500" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />}
              </button>
              {openFaq === fIdx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed border-t border-slate-100 dark:border-white/[0.04] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
