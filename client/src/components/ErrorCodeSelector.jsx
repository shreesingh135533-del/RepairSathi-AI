import React, { useState, useEffect } from 'react';
import { Tag, HelpCircle, Check, Info, AlertTriangle, X } from 'lucide-react';

export default function ErrorCodeSelector({ category, brand, value, onChange, onValidationChange }) {
  const [errorCodes, setErrorCodes] = useState([]);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [isUnrecognized, setIsUnrecognized] = useState(false);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchCodes = async () => {
      if (!category) return;
      try {
        let url = `/api/devices/error-codes?category=${encodeURIComponent(category)}`;
        if (brand) url += `&brand=${encodeURIComponent(brand)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (active && data.errorCodes) {
          setErrorCodes(data.errorCodes);
        }
      } catch (err) {
        console.error('Error code fetch error:', err);
      }
    };
    fetchCodes();
    return () => { active = false; };
  }, [category, brand]);

  // Validate current value whenever it or category/brand changes
  useEffect(() => {
    let active = true;
    const trimmed = (value || '').trim();

    if (!trimmed) {
      setSelectedDetails(null);
      setIsUnrecognized(false);
      onValidationChange?.({ isValid: true, isUnrecognized: false, code: '' });
      return;
    }

    // First check local list
    const localMatch = errorCodes.find(ec => ec.code.toUpperCase() === trimmed.toUpperCase());
    if (localMatch) {
      setSelectedDetails(localMatch);
      setIsUnrecognized(false);
      onValidationChange?.({ isValid: true, isUnrecognized: false, code: trimmed, details: localMatch });
      return;
    }

    // Check with server
    const timeout = setTimeout(async () => {
      setValidating(true);
      try {
        const res = await fetch('/api/devices/validate-error-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: trimmed, category, brand })
        });
        const data = await res.json();
        if (!active) return;

        if (data.status === 'VERIFIED') {
          setSelectedDetails(data.errorCode);
          setIsUnrecognized(false);
          onValidationChange?.({ isValid: true, isUnrecognized: false, code: trimmed, details: data.errorCode });
        } else {
          setSelectedDetails(null);
          setIsUnrecognized(true);
          onValidationChange?.({
            isValid: false,
            isUnrecognized: true,
            code: trimmed,
            message: "Error code not recognized. Please verify the code or remove it if you don't have one."
          });
        }
      } catch (err) {
        console.error('Validation error:', err);
      } finally {
        if (active) setValidating(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [value, category, brand, errorCodes]);

  const handleSelect = (ec) => {
    onChange(ec.code);
    setSelectedDetails(ec);
    setIsUnrecognized(false);
  };

  const handleClearCode = () => {
    onChange('');
    setSelectedDetails(null);
    setIsUnrecognized(false);
    onValidationChange?.({ isValid: true, isUnrecognized: false, code: '' });
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Error Code (Optional)
        </label>
        {selectedDetails && (
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Check className="w-3 h-3" />
            Verified {selectedDetails.title}
          </span>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. E20 / 4C / E1 / dE"
          className={`w-full px-3 py-2 pr-9 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:outline-none uppercase font-mono transition-colors ${
            isUnrecognized
              ? 'border-red-400 dark:border-red-600 bg-red-50/50 dark:bg-red-950/20 text-red-900 dark:text-red-200 focus:ring-red-400'
              : selectedDetails
              ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20 text-slate-900 dark:text-white focus:ring-emerald-400'
              : 'border-slate-200 dark:border-white/[0.08] bg-white dark:bg-charcoal-850 text-slate-900 dark:text-white focus:ring-blue-500'
          }`}
        />
        {value && (
          <button
            type="button"
            onClick={handleClearCode}
            title="Clear error code"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Common Verified Codes Pills */}
      {errorCodes.length > 0 && !selectedDetails && !isUnrecognized && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-slate-400">Common verified codes:</span>
          {errorCodes.slice(0, 5).map((ec) => (
            <button
              key={ec.id}
              type="button"
              onClick={() => handleSelect(ec)}
              className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-300 transition-colors"
            >
              {ec.code}
            </button>
          ))}
        </div>
      )}

      {/* Unrecognized Error Code Warning Banner */}
      {isUnrecognized && !validating && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-900 dark:text-red-200 flex items-start justify-between gap-2 animate-fadeIn">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-300">
                Error code not recognized.
              </p>
              <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5">
                Please verify the code or remove it if you don't have one.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearCode}
            className="px-2.5 py-1 text-[11px] font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/60 hover:bg-red-200 rounded-lg shrink-0 transition-colors"
          >
            Remove Code
          </button>
        </div>
      )}

      {/* Verified Definition Card if code is recognized */}
      {selectedDetails && (
        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2 animate-fadeIn">
          <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">{selectedDetails.title} (Code {selectedDetails.code})</p>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">{selectedDetails.meaning}</p>
          </div>
        </div>
      )}
    </div>
  );
}
