'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  icon: ReactNode;
  title: string;
  summary: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function CollapsibleSection({
  icon,
  title,
  summary,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/40 rounded-2xl p-4 text-left transition-colors"
      >
        <div className="w-10 h-10 rounded-xl grid place-items-center bg-primary/15 text-primary-light flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold text-white truncate">
            {title}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{summary}</div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-500 flex-shrink-0 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}
