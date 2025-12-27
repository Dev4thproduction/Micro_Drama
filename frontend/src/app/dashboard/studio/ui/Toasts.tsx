'use client';

import { clsx } from 'clsx';
import { Toast } from '../hooks/useStudioData';

type Props = { toasts: Toast[] };

export function Toasts({ toasts }: Props) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={clsx(
            'rounded-xl px-4 py-3 shadow-lg text-sm',
            t.tone === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-100'
              : t.tone === 'error'
              ? 'bg-rose-500/15 border border-rose-500/30 text-rose-100'
              : 'bg-white/10 border border-white/20 text-white'
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

