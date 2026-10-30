import React, { useState, useEffect } from 'react';
import { Sparkles, Plus } from 'lucide-react';

export default function SymptomAutocomplete({ category, currentText, onSelectSymptom }) {
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchSymptoms = async () => {
      if (!category) return;
      setLoading(true);
      try {
        const query = currentText ? currentText.trim().split(' ').pop() : '';
        const res = await fetch(`/api/devices/symptoms?category=${encodeURIComponent(category)}&query=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (active && data.symptoms) {
          setSymptoms(data.symptoms.slice(0, 6));
        }
      } catch (err) {
        console.error('Symptom suggestions error:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    const timer = setTimeout(fetchSymptoms, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [category, currentText]);

  if (symptoms.length === 0) return null;

  return (
    <div className="pt-2 animate-fade-in font-sans">
      <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
        <Sparkles className="w-3 h-3 text-acid" />
        <span>Common {category.replace('-', ' ')} symptoms (1-click add):</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {symptoms.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelectSymptom(s.symptom_text)}
            className="px-2.5 py-1 rounded-xl text-xs font-mono font-medium bg-slate-100/80 hover:bg-blue-50 dark:bg-charcoal-850 dark:hover:bg-charcoal-800 text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-white border border-slate-200/80 dark:border-white/[0.08] transition-colors text-left flex items-center gap-1 group"
          >
            <Plus className="w-3 h-3 text-slate-400 group-hover:text-blue-500 shrink-0" />
            <span className="line-clamp-1">{s.symptom_text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
