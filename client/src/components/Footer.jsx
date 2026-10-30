import React from 'react';
import { Cpu, ShieldCheck, Sparkles, Coins } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-charcoal-900/80 backdrop-blur-xl transition-colors mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Cpu className="w-4 h-4 text-acid" />
              </div>
              <span className="font-heading font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                RepairSathi<span className="text-blue-500">.ai</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              Next-generation hardware intelligence platform. Transparent appliance repair diagnostics, verified spare pricing benchmarks, and zero-guesswork decisions.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Platform
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-sans">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-blue-500 transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('assistant')} className="hover:text-blue-500 transition-colors">
                  AI Repair Diagnosis
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('costs')} className="hover:text-blue-500 transition-colors flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                  <span>Repair Cost Intelligence</span>
                  <span className="px-1 py-0.2 rounded bg-acid/20 text-emerald-600 dark:text-acid text-[9px] font-mono">NEW</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('knowledge')} className="hover:text-blue-500 transition-colors">
                  Hardware Troubleshooting DB
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('safety')} className="hover:text-blue-500 transition-colors">
                  Hazard Safety Protocols
                </button>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Hardware Coverage
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-sans">
              <li>Smartphones & Mobile Devices</li>
              <li>Laptops & Desktop Workstations</li>
              <li>Smart Televisions & Display Panels</li>
              <li>Smart Inverter Refrigerators</li>
              <li>Front & Top Load Washing Machines</li>
              <li>Inverter Split Air Conditioners</li>
            </ul>
          </div>

          {/* Legal / Safety Disclaimer */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Safety & Transparency</span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              RepairSathi AI provides independent diagnostic guidance. Always isolate mains power before touching electrical circuitry. For sealed refrigerant systems, microwave magnetrons, or live high-voltage boards, hire certified technicians.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-100 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-400 gap-2">
          <p>© {new Date().getFullYear()} RepairSathi AI • Built for hardware transparency & device longevity.</p>
          <p className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Independent Benchmark Engine v2.5</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
