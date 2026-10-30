import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Zap,
  Flame,
  BatteryWarning,
  Droplets,
  Wind,
  CheckCircle2,
  PhoneCall,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function SafetyGuide({ onStartDiagnosis }) {
  const safetyProtocols = [
    {
      title: 'High Voltage & Stored Capacitor Danger',
      icon: Zap,
      color: 'amber',
      warning: 'Capacitors in microwave ovens, television power supply boards, and inverter circuits retain 300V to 4,000V even when completely unplugged for weeks.',
      rules: [
        'NEVER open a microwave oven chassis. The high-voltage capacitor and magnetron carry lethal charge.',
        'Never stick metallic tools, screwdrivers, or wires into appliance vents or ports.',
        'Always discharge capacitors using rated ceramic discharge resistors before touching power circuits (certified technicians only).'
      ]
    },
    {
      title: 'Lithium-Ion Battery Safety (Smartphones & Laptops)',
      icon: BatteryWarning,
      color: 'red',
      warning: 'Lithium polymer batteries can experience thermal runaway, emitting toxic fumes and violent flames if bent, punctured, or overheated.',
      rules: [
        'If you notice your phone back cover lifting, screen popping out, or a "pillow-like" bulge, STOP USING IT IMMEDIATELY.',
        'Never use metallic pry tools near the battery. Use plastic guitar picks or spudgers.',
        'Do not charge swollen or physically dented batteries.',
        'Never dispose of damaged lithium batteries in regular trash.'
      ]
    },
    {
      title: 'Water Intrusion & Electrical Shock Hazards',
      icon: Droplets,
      color: 'blue',
      warning: 'Water and electricity create extreme shock and electrocution hazards, especially in washing machines, dishwashers, and water heaters.',
      rules: [
        'Always unplug the appliance before inspecting filters, hoses, or pumps.',
        'Never touch a wet washing machine or water-flooded power strip while standing barefoot on a moist floor.',
        'Allow water-damaged electronics to dry for at least 48-72 hours before attempting to power them on.'
      ]
    },
    {
      title: 'Pressurized Refrigerant Coils (Fridges & ACs)',
      icon: Wind,
      color: 'teal',
      warning: 'Refrigerants (R32, R134a, R600a/Isobutane) are pressurized and flammable. Escaping vapor causes instantaneous skin frostbite.',
      rules: [
        'Never use knives, ice picks, or metal scrapers to chip ice from freezer evaporator coils.',
        'Only licensed HVAC/EPA-certified technicians may connect manifolds or charge refrigerant.',
        'Ensure proper room ventilation whenever working near refrigerator compressor compartments.'
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 font-sans">
      {/* Page Title */}
      <div className="border-b border-slate-200 dark:border-white/[0.08] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-mono font-medium mb-3">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>ZERO CASUALTY HARDWARE PROTOCOL</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
          Hardware Safety Directives
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-sans mt-2 max-w-2xl">
          Essential electrical, chemical, and pressure safeguards before inspecting any electronic appliance.
        </p>
      </div>

      {/* Emergency Quick Action Banner */}
      <div className="p-6 rounded-3xl bg-red-600/10 border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Flame className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-heading font-bold text-base text-red-700 dark:text-red-300">
              Active Fire, Smoke, or Sparking Emergency?
            </h3>
            <p className="text-xs text-red-600 dark:text-red-400 font-sans mt-0.5">
              Turn off the main household electrical circuit breaker immediately. Do NOT touch smoking cables with bare hands.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-600 dark:text-red-300 bg-red-500/10 px-3 py-2 rounded-xl shrink-0">
          <PhoneCall className="w-4 h-4" /> Emergency: 112 / 101
        </div>
      </div>

      {/* Safety Protocols Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {safetyProtocols.map((protocol, pIdx) => {
          const Icon = protocol.icon;
          return (
            <div
              key={pIdx}
              className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                  {protocol.title}
                </h3>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-charcoal-850 text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed border border-slate-100 dark:border-white/[0.05]">
                <span className="font-mono font-bold text-red-500 block mb-1">HAZARD PROFILE:</span>
                {protocol.warning}
              </div>

              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                  Mandatory Safety Rules:
                </span>
                <ul className="space-y-2">
                  {protocol.rules.map((rule, rIdx) => (
                    <li key={rIdx} className="text-xs text-slate-600 dark:text-slate-300 font-sans flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* When to Call a Pro */}
      <div className="p-8 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.08] space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
            When Must You Stop and Call an Authorized Brand Technician?
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-850 border border-slate-100 dark:border-white/[0.05]">
            <p className="font-mono font-bold text-xs text-blue-500 mb-1">1. Sealed Gas Lines</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-sans">
              Refrigerant leaks, compressor copper brazing, and nitrogen pressure tests require certified vacuum pumps.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-850 border border-slate-100 dark:border-white/[0.05]">
            <p className="font-mono font-bold text-xs text-blue-500 mb-1">2. Microwave Magnetrons</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-sans">
              Microwaves use 2,000V–4,000V DC and radiation-blocking door seals. Never open the case yourself.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-850 border border-slate-100 dark:border-white/[0.05]">
            <p className="font-mono font-bold text-xs text-blue-500 mb-1">3. PCB Micro-Soldering</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-sans">
              SMD chip replacement, BGA reballing, and multi-layer traces require digital microscopes and hot air stations.
            </p>
          </div>
        </div>

        {onStartDiagnosis && (
          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => onStartDiagnosis()}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-heading font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <span>Proceed to AI Safe Diagnosis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
