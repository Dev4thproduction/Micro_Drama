'use client';

import { Loader2, Trash2 } from 'lucide-react';
import { PaginationControls } from './PaginationControls';
import { StatusBadge } from './StatusBadge';
import { Video } from '../hooks/useStudioData';
import { clsx } from 'clsx';
import { useRef } from 'react';

type UploadState = {
  videoFile: File | null;
  setVideoFile: (f: File | null) => void;
  videoDuration: string;
  setVideoDuration: (v: string) => void;
  isUploading: boolean;
  uploadProgress: number;
  uploadVideo: (e: React.FormEvent) => Promise<void>;
};

type Actions = {
  formatBytes: (b?: number) => string;
  updateVideoStatusAction: (id: string, status: string) => Promise<void>;
  deleteVideoAction: (id: string) => Promise<void>;
  setVideoPage: (updater: (p: number) => number) => void;
};

type Meta = { page: number; totalPages: number; total: number };

const videoStatusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'ready', label: 'Ready' },
  { value: 'failed', label: 'Failed' }
];

export function UploadPanel({
  videos,
  videoMeta,
  isLoading,
  uploadState,
  actions
}: {
  videos: Video[];
  videoMeta: Meta;
  isLoading: boolean;
  uploadState: UploadState;
  actions: Actions;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <section id="upload" className="rounded-2xl border border-white/5 bg-[#0f131c] p-5 shadow-2xl studio-card">
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <h2 className="text-lg font-semibold">1) Upload video</h2>
        {uploadState.uploadProgress > 0 && uploadState.isUploading && (
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <div className="w-32 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${uploadState.uploadProgress}%` }} />
            </div>
            <span>{uploadState.uploadProgress}%</span>
          </div>
        )}
      </div>
      <form onSubmit={uploadState.uploadVideo} className="space-y-3">
        <div
          className={clsx(
            'rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-6 transition-all',
            'hover:border-primary/60 hover:bg-white/10',
            uploadState.videoFile ? 'border-primary/60 bg-primary/5' : ''
          )}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            uploadState.setVideoFile(file || null);
          }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => uploadState.setVideoFile(e.target.files?.[0] || null)}
              className="w-full md:w-auto rounded-xl border border-white/10 bg-[#0b0d11] px-4 py-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-white"
            />
            {uploadState.videoFile ? (
              <div className="text-sm text-gray-200 flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400" />
                {uploadState.videoFile.name} - {(uploadState.videoFile.size / (1024 * 1024)).toFixed(1)} MB
              </div>
            ) : (
              <div className="text-sm text-gray-400">Drag & drop a video or choose a file</div>
            )}
            {uploadState.isUploading && (
              <button
                type="button"
                className="text-xs px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/40 text-rose-200"
                onClick={() => uploadState.setVideoFile(null)}
              >
                Cancel upload
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Uses `/uploads/presign` for S3 PUT, then registers via `/creator/videos`. Max 1GB, videos only.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={uploadState.isUploading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50"
          >
            {uploadState.isUploading && <Loader2 className="animate-spin" size={16} />}
            Upload & register
          </button>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <input
              type="number"
              min={0}
              placeholder="Duration (seconds, optional)"
              value={uploadState.videoDuration}
              onChange={(e) => uploadState.setVideoDuration(e.target.value)}
              className="w-full md:w-64 rounded-xl bg-[#0b0d11] border border-white/10 px-4 py-3 text-sm"
            />
          </div>
        </div>
      </form>

      <div className="mt-4 overflow-auto rounded-xl border border-white/5">
        <table className="min-w-full text-sm divide-y divide-white/10">
          <thead className="bg-white/5 text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-3 py-2 text-left">Key</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Size</th>
              <th className="px-3 py-2 text-left">Format</th>
              <th className="px-3 py-2 text-left">Duration</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={`v-skel-${i}`} className="animate-pulse">
                    <td className="px-3 py-3">
                      <div className="h-3 w-40 rounded bg-white/10" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-3 w-16 rounded bg-white/10" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-3 w-12 rounded bg-white/10" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-3 w-14 rounded bg-white/10" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-3 w-14 rounded bg-white/10" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-3 w-14 rounded bg-white/10" />
                    </td>
                  </tr>
                ))
              : videos.map((v) => (
                  <tr key={v._id} className="hover:bg-white/5">
                    <td className="px-3 py-2 truncate max-w-xs">{v.s3Key}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={v.status} />
                      {v.processingNote && (
                        <div className="text-[11px] text-gray-500 mt-1 max-w-xs truncate">{v.processingNote}</div>
                      )}
                    </td>
                    <td className="px-3 py-2">{actions.formatBytes(v.sizeBytes)}</td>
                    <td className="px-3 py-2 text-gray-300">{v.format || '--'}</td>
                    <td className="px-3 py-2 text-gray-300">
                      {v.durationSeconds !== undefined ? `${v.durationSeconds}s` : '--'}
                    </td>
                    <td className="px-3 py-2">
                      <select
                        className="rounded-lg bg-[#0b0d11] border border-white/10 px-2 py-1 text-xs text-gray-200 mr-2"
                        value={v.status}
                        onChange={(e) => void actions.updateVideoStatusAction(v._id, e.target.value)}
                      >
                        {videoStatusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-200"
                        onClick={() => void actions.deleteVideoAction(v._id)}
                        title="Delete video"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
            {!isLoading && !videos.length && (
              <tr>
                <td className="px-3 py-3 text-gray-500 text-center" colSpan={6}>
                  No uploads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <PaginationControls
          page={videoMeta.page}
          totalPages={videoMeta.totalPages}
          total={videoMeta.total}
          loading={isLoading}
          onPrev={() => actions.setVideoPage((p) => Math.max(1, p - 1))}
          onNext={() => actions.setVideoPage((p) => p + 1)}
        />
      </div>
    </section>
  );
}

