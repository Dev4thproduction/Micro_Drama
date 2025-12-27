'use client';

import { clsx } from 'clsx';

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'px-2 py-1 rounded-full text-xs font-semibold border',
        status === 'published' || status === 'ready'
          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
          : status === 'pending' || status === 'draft'
          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
          : 'bg-gray-700/40 text-gray-200 border-gray-600/50'
      )}
    >
      {status}
    </span>
  );
}

