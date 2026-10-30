import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Check, Loader2, AlertCircle } from 'lucide-react';

export default function AutocompleteInput({
  label,
  value,
  onChange,
  onSelect,
  placeholder,
  fetchSuggestions,
  disabled = false,
  required = false,
  helperText = '',
  allowCustom = true,
  customBadge = null
}) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setHighlightedIndex(-1);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (!val || val.trim().length === 0) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setIsOpen(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await fetchSuggestions(val.trim());
        setSuggestions(results || []);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 200);
  };

  const handleFocus = async () => {
    if (disabled) return;
    setIsOpen(true);
    if (suggestions.length === 0) {
      setLoading(true);
      try {
        const results = await fetchSuggestions(query.trim());
        setSuggestions(results || []);
      } catch (err) {
        console.error('Focus suggestions error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelect = (item) => {
    const text = typeof item === 'string' ? item : item.name || item.model_name || '';
    setQuery(text);
    onChange(text);
    if (onSelect) onSelect(item);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    if (onSelect) onSelect(null);
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelect(suggestions[highlightedIndex]);
      } else if (allowCustom && query.trim()) {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Highlight matching part of text
  const highlightMatch = (text, match) => {
    if (!match || !match.trim()) return text;
    const parts = text.split(new RegExp(`(${match.trim()})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === match.toLowerCase() ? (
            <span key={i} className="font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-0.5 rounded">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {customBadge}
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          disabled={disabled}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-3.5 pr-16 py-2.5 rounded-xl border text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            disabled
              ? 'bg-slate-100 dark:bg-charcoal-800/50 border-slate-200 dark:border-white/[0.06] text-slate-400 cursor-not-allowed'
              : 'bg-white dark:bg-charcoal-850 border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white font-sans'
          }`}
        />

        {/* Right side controls (loading spinner, clear button) */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
          {query && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {helperText && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>
      )}

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.08] shadow-2xl divide-y divide-slate-100 dark:divide-white/[0.04] animate-fade-in font-sans">
          {suggestions.length > 0 ? (
            suggestions.map((item, idx) => {
              const text = typeof item === 'string' ? item : item.name || item.model_name || '';
              const subtext = item.model_number || item.category_slug || '';
              const isSelected = highlightedIndex === idx;

              return (
                <div
                  key={idx}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(item);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-3.5 py-2.5 cursor-pointer text-xs sm:text-sm flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex-1 truncate pr-2">
                    <p className="truncate">{highlightMatch(text, query)}</p>
                    {subtext && <p className="text-[10px] text-slate-400 truncate mt-0.5">{subtext}</p>}
                  </div>
                  {query.toLowerCase() === text.toLowerCase() && (
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                  )}
                </div>
              );
            })
          ) : query.trim() ? (
            <div className="p-3 text-center text-xs text-slate-500 dark:text-slate-400">
              <p className="font-medium text-slate-700 dark:text-slate-300">No catalogue matches for "{query}"</p>
              {allowCustom && (
                <p className="mt-1 text-[11px] text-blue-600 dark:text-blue-400">
                  Press enter or continue to use as unlisted custom model.
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 text-center text-xs text-slate-400">
              Type to see verified suggestions...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
