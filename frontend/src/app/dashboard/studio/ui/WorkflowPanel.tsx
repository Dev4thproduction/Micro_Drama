'use client';

import { PlusCircle } from 'lucide-react';

export function WorkflowPanel() {
  return (
    <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-[#141927] via-[#0f131c] to-[#0b0d11] shadow-2xl p-5 studio-card">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
        <PlusCircle size={16} className="text-primary" /> Workflow guide
      </div>
      <ul className="text-sm text-gray-400 space-y-2 mt-3">
        <li>1) Upload video → `/uploads/presign` + S3 PUT → `/creator/videos`.</li>
        <li>2) Create series → `/creator/series`.</li>
        <li>3) Create episodes → `/creator/series/:id/episodes` (attach video, set order/release).</li>
        <li>4) Admin reviews pending episodes and approves via `/admin/episodes/:episodeId/approve`.</li>
        <li>5) Playback uses `/video/play/:episodeId` (requires subscription).</li>
      </ul>
    </div>
  );
}

