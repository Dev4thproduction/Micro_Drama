'use client';

import { Clock } from 'lucide-react';

export function TipsPanel() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0f131c] p-5 space-y-3 studio-card">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
        <Clock size={16} className="text-primary" /> Tips
      </div>
      <ul className="text-sm text-gray-400 space-y-2">
        <li>Use meaningful filenames to spot uploads quickly.</li>
        <li>Order controls episode sequence; release date is optional for scheduling.</li>
        <li>Videos stay pending until admins approve episodes; ensure your video matches the episode.</li>
        <li>Creators see only their own assets; admins can view all.</li>
      </ul>
    </div>
  );
}

