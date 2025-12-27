'use client';

import { ChevronRight, Film, Loader2, Pencil, Trash2 } from 'lucide-react';
import { PaginationControls } from './PaginationControls';
import { StatusBadge } from './StatusBadge';
import { Episode, Series, Video } from '../hooks/useStudioData';

type Meta = { page: number; totalPages: number; total: number };

type EpisodeState = {
  episodeForm: {
    title: string;
    synopsis: string;
    order: number;
    videoId: string;
    releaseDate: string;
    thumbnail: string;
  };
  setEpisodeForm: (val: any) => void;
  episodeMessage: string;
  isSavingEpisode: boolean;
  editingEpisodeId: string;
  setEditingEpisodeId: (id: string) => void;
  hasEpisodeDirty: boolean;
  initialEpisodeForm: React.MutableRefObject<any>;
  selectedSeriesId: string;
  setSelectedSeriesId: (id: string) => void;
};

type Actions = {
  createEpisode: (e: React.FormEvent) => Promise<void>;
  deleteEpisodeAction: (seriesId: string, episodeId: string) => Promise<void>;
  loadEpisodes: (seriesId: string) => Promise<void>;
  setEpisodePage: (updater: (p: number) => number) => void;
};

export function EpisodesPanel({
  episodes,
  episodeMeta,
  isLoading,
  series,
  videos,
  episodeState,
  actions
}: {
  episodes: Episode[];
  episodeMeta: Meta;
  isLoading: boolean;
  series: Series[];
  videos: Video[];
  episodeState: EpisodeState;
  actions: Actions;
}) {
  return (
    <section className="rounded-2xl border border-white/5 bg-[#0f131c] p-5 shadow-2xl studio-card" id="episodes">
      <div className="flex items-center gap-2 mb-4">
        <Film size={18} className="text-primary" />
        <h2 className="text-lg font-semibold">3) Create episodes (submit for approval)</h2>
      </div>
      <form onSubmit={actions.createEpisode} className="space-y-3">
        <div className="grid gap-3 md:grid-cols-3">
          <select
            className="rounded-xl bg-[#0b0d11] border border-white/10 px-3 py-3 text-sm"
            value={episodeState.selectedSeriesId}
            onChange={(e) => {
              episodeState.setSelectedSeriesId(e.target.value);
              actions.setEpisodePage(() => 1);
              void actions.loadEpisodes(e.target.value);
            }}
          >
            <option value="">Select series</option>
            {series.map((s) => (
              <option key={s._id} value={s._id}>
                {s.title}
              </option>
            ))}
          </select>
          <input
            required
            placeholder="Episode title"
            className="rounded-xl bg-[#0b0d11] border border-white/10 px-3 py-3 text-sm"
            value={episodeState.episodeForm.title}
            onChange={(e) => episodeState.setEpisodeForm({ ...episodeState.episodeForm, title: e.target.value })}
          />
          <input
            type="number"
            min={1}
            className="rounded-xl bg-[#0b0d11] border border-white/10 px-3 py-3 text-sm"
            value={episodeState.episodeForm.order}
            onChange={(e) => episodeState.setEpisodeForm({ ...episodeState.episodeForm, order: Number(e.target.value) })}
            placeholder="Order"
          />
        </div>
        <textarea
          rows={3}
          className="w-full rounded-xl bg-[#0b0d11] border border-white/10 px-3 py-3 text-sm"
          placeholder="Synopsis"
          value={episodeState.episodeForm.synopsis}
          onChange={(e) => episodeState.setEpisodeForm({ ...episodeState.episodeForm, synopsis: e.target.value })}
        />
        <input
          className="w-full rounded-xl bg-[#0b0d11] border border-white/10 px-3 py-3 text-sm"
          placeholder="Thumbnail URL (optional)"
          value={episodeState.episodeForm.thumbnail}
          onChange={(e) => episodeState.setEpisodeForm({ ...episodeState.episodeForm, thumbnail: e.target.value })}
        />
        <div className="grid gap-3 md:grid-cols-3">
          <select
            className="rounded-xl bg-[#0b0d11] border border-white/10 px-3 py-3 text-sm"
            value={episodeState.episodeForm.videoId}
            onChange={(e) => episodeState.setEpisodeForm({ ...episodeState.episodeForm, videoId: e.target.value })}
          >
            <option value="">Attach uploaded video</option>
            {videos.map((v) => (
              <option key={v._id} value={v._id}>
                {v.s3Key} ({v.status})
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            className="rounded-xl bg-[#0b0d11] border border-white/10 px-3 py-3 text-sm"
            value={episodeState.episodeForm.releaseDate}
            onChange={(e) => episodeState.setEpisodeForm({ ...episodeState.episodeForm, releaseDate: e.target.value })}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={episodeState.isSavingEpisode}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50"
            >
              {episodeState.isSavingEpisode && <Loader2 size={14} className="animate-spin" />}
              {episodeState.editingEpisodeId ? 'Save episode' : 'Create episode'}
            </button>
            {episodeState.editingEpisodeId && (
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold"
                onClick={() => {
                  episodeState.setEditingEpisodeId('');
                  episodeState.setEpisodeForm({
                    title: '',
                    synopsis: '',
                    order: 1,
                    videoId: '',
                    releaseDate: '',
                    thumbnail: ''
                  });
                  episodeState.initialEpisodeForm.current = {
                    title: '',
                    synopsis: '',
                    order: 1,
                    videoId: '',
                    releaseDate: '',
                    thumbnail: ''
                  };
                }}
              >
                Cancel edit
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="mt-4 overflow-auto rounded-xl border border-white/5">
        <table className="min-w-full text-sm divide-y divide-white/10">
          <thead className="bg-white/5 text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Order</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Release</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={`e-skel-${i}`} className="animate-pulse">
                    <td className="px-3 py-3">
                      <div className="h-3 w-44 bg-white/10 rounded" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-3 w-8 bg-white/10 rounded" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-3 w-14 bg-white/10 rounded" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-3 w-24 bg-white/10 rounded" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-3 w-24 bg-white/10 rounded" />
                    </td>
                  </tr>
                ))
              : episodes.map((ep) => (
                  <tr key={ep._id} className="hover:bg-white/5">
                    <td className="px-3 py-2 flex items-center gap-2">
                      <ChevronRight size={14} className="text-primary" />
                      <div>
                        <div className="font-semibold text-gray-100">{ep.title}</div>
                        <div className="text-xs text-gray-500">Video: {ep.video || 'n/a'}</div>
                        {ep.thumbnail && (
                          <div className="text-[11px] text-gray-500 truncate max-w-xs">Thumb: {ep.thumbnail}</div>
                        )}
                        <div className="text-[11px] text-gray-500">
                          {ep.approvedAt ? `Approved ${new Date(ep.approvedAt).toLocaleString()}` : 'Awaiting approval'}
                        </div>
                        {ep.approvalNote && (
                          <div className="text-[11px] text-gray-400">Note: {ep.approvalNote}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">{ep.order}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={ep.status} />
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-400">
                      {ep.releaseDate ? new Date(ep.releaseDate).toLocaleString() : '--'}
                    </td>
                    <td className="px-3 py-2 space-x-2">
                      <button
                        type="button"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300"
                        onClick={() => {
                          episodeState.setEditingEpisodeId(ep._id);
                          episodeState.setEpisodeForm({
                            title: ep.title,
                            synopsis: ep.synopsis || '',
                            order: ep.order,
                            videoId: ep.video || '',
                            releaseDate: ep.releaseDate ? ep.releaseDate.slice(0, 16) : '',
                            thumbnail: ep.thumbnail || ''
                          });
                          episodeState.initialEpisodeForm.current = {
                            title: ep.title,
                            synopsis: ep.synopsis || '',
                            order: ep.order,
                            videoId: ep.video || '',
                            releaseDate: ep.releaseDate ? ep.releaseDate.slice(0, 16) : '',
                            thumbnail: ep.thumbnail || ''
                          };
                        }}
                        title="Edit episode"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-200"
                        onClick={() => void actions.deleteEpisodeAction(episodeState.selectedSeriesId, ep._id)}
                        title="Delete episode"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
            {!isLoading && !episodes.length && (
              <tr>
                <td className="px-3 py-3 text-center text-gray-500" colSpan={5}>
                  No episodes for this series yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <PaginationControls
          page={episodeMeta.page}
          totalPages={episodeMeta.totalPages}
          total={episodeMeta.total}
          loading={isLoading}
          onPrev={() => actions.setEpisodePage((p) => Math.max(1, p - 1))}
          onNext={() => actions.setEpisodePage((p) => p + 1)}
        />
      </div>
    </section>
  );
}


