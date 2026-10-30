import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

export default function DeviceVerificationBadge({
  validation,
  allowUnverifiedModel,
  onToggleAllowUnverified
}) {
  if (!validation) return null;

  // 1. Matched & Verified in Catalogue
  if (validation.status === 'VERIFIED') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold animate-fade-in">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span>Verified in RepairSathi Catalogue</span>
      </div>
    );
  }

  // 2. Critical Mismatched Brand & Model (e.g. Apple + Galaxy S24)
  if (validation.status === 'MISMATCHED_BRAND_MODEL') {
    return (
      <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start gap-2.5 animate-fade-in font-sans">
        <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-heading font-bold text-red-800 dark:text-red-200">Manufacturer & Model Mismatch Detected</p>
          <p className="mt-0.5 text-xs text-red-700 dark:text-red-300 leading-relaxed">{validation.message}</p>
        </div>
      </div>
    );
  }

  // 3. Unlisted / Unverified Model
  if (validation.status === 'UNVERIFIED_MODEL') {
    return (
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm space-y-2 animate-fade-in font-sans">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-heading font-bold text-amber-800 dark:text-amber-200">Model Not Listed in Verified Catalogue</p>
            <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{validation.message}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between font-mono">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-800 dark:text-amber-300 select-none">
            <input
              type="checkbox"
              checked={allowUnverifiedModel}
              onChange={(e) => onToggleAllowUnverified(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Proceed with unlisted model</span>
          </label>
          <span className="text-[10px] text-amber-600 dark:text-amber-400">
            AI generic rules applied
          </span>
        </div>
      </div>
    );
  }

  // 4. Custom Device
  if (validation.status === 'CUSTOM_DEVICE') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-charcoal-850 border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-mono">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Custom Unlisted Appliance</span>
      </div>
    );
  }

  return null;
}
