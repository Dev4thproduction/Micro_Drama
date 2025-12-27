'use client';

import { Layers, ListVideo, Loader2, Pencil, Trash2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { PaginationControls } from './PaginationControls';
import { Series } from '../hooks/useStudioData';
import { clsx } from 'clsx';

type Meta = { page: number; totalPages: number; total: number };

type SeriesState = {
  seriesForm: { title: string; description: string; tags: string; thumbnail: string };
  setSeriesForm: (val: any) => void;
  seriesMessage: string;
  isSavingSeries: boolean;
  editingSeriesId: string;
  setEditingSeriesId: (id: string) => void;
  hasSeriesDirty: boolean;
  initialSeriesForm: React.MutableRefObject<any>;
};

type EpisodeState = {
  hasEpisodeDirty: boolean;
  selectedSeriesId: string;
  setSelectedSeriesId: (id: string) => void;
  setEpisodePage: (updater: (p: number) => number) => void;
};

type Actions = {
  createSeries: (e: React.FormEvent) => Promise<void>;
  deleteSeriesAction: (id: string) => Promise<void>;
  loadEpisodes: (seriesId: string) => Promise<void>;
  setSeriesPage: (updater: (p: number) => number) => void;
};

export function SeriesPanel({
  series,
  seriesMeta,
  isLoading,
  seriesState,
  episodeState,
  actions
}: {
  series: Series[];
  seriesMeta: Meta;
  isLoading: boolean;
  seriesState: SeriesState;
  episodeState: EpisodeState;
  actions: Actions;
}) {
  return (
    <section className="rounded-2xl border border-white/5 bg-[#0f131c] p-5 shadow-2xl studio-card" id="series">
      <div className="flex items-center gap-2 mb-4">
        <Layers size={18} className="text-primary" />
        <h2 className="text-lg font-semibold">2) Create series</h2>
      </div>
      <form onSubmit={actions.createSeries} className="grid gap-3 md:grid-cols-[1fr,1fr,auto]">
        <input
          required
          value={seriesState.seriesForm.title}
          onChange={(e) => seriesState.setSeriesForm({ ...seriesState.seriesForm, title: e.target.value })}
          placeholder="Series title"
          className="rounded-xl bg-[#0b0d11] border border-white/10 px-4 py-3 text-sm"
        />
        <input
          value={seriesState.seriesForm.tags}
          onChange={(e) => seriesState.setSeriesForm({ ...seriesState.seriesForm, tags: e.target.value })}
          placeholder="Tags (comma separated)"
          className="rounded-xl bg-[#0b0d11] border border-white/10 px-4 py-3 text-sm"
        />
        <input
          value={seriesState.seriesForm.thumbnail}
          onChange={(e) => seriesState.setSeriesForm({ ...seriesState.seriesForm, thumbnail: e.target.value })}
          placeholder="Poster/thumbnail URL (optional)"
          className="rounded-xl bg-[#0b0d11] border border-white/10 px-4 py-3 text-sm md:col-span-1"
        />
        <button
          type="submit"
          disabled={seriesState.isSavingSeries}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50"
        >
          {seriesState.isSavingSeries && <Loader2 size={14} className="animate-spin" />}
          {seriesState.editingSeriesId ? 'Save series' : 'Create series'}
        </button>
        {seriesState.editingSeriesId && (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold"
            onClick={() => {
              seriesState.setEditingSeriesId('');
              seriesState.setSeriesForm({ title: '', description: '', tags: '', thumbnail: '' });
              seriesState.initialSeriesForm.current = { title: '', description: '', tags: '', thumbnail: '' };
            }}
          >
            Cancel edit
          </button>
        )}
        <textarea
          value={seriesState.seriesForm.description}
          onChange={(e) => seriesState.setSeriesForm({ ...seriesState.seriesForm, description: e.target.value })}
          placeholder="Short description"
          className="md:col-span-3 rounded-xl bg-[#0b0d11] border border-white/10 px-4 py-3 text-sm"
          rows={2}
        />
      </form>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => (
              <div
                key={`s-skel-${i}`}
                className="rounded-xl border border-white/10 bg-white/5 p-4 animate-pulse space-y-3"
              >
                <div className="h-4 w-40 bg-white/10 rounded" />
                <div className="h-3 w-24 bg-white/10 rounded" />
                <div className="h-3 w-32 bg-white/10 rounded" />
              </div>
            ))
          : series.map((s) => (
              <div
                key={s._id}
                className={clsx(
                  'rounded-xl border p-4 cursor-pointer transition-all',
                  episodeState.selectedSeriesId === s._id
                    ? 'border-primary bg-primary/10 shadow-[0_10px_40px_rgba(19,91,236,0.2)]'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                )}
                onClick={() => {
                  if (episodeState.hasEpisodeDirty || seriesState.hasSeriesDirty) {
                    const ok = window.confirm('You have unsaved changes. Switch series anyway?');
                    if (!ok) return;
                  }
                  episodeState.setEpisodePage(() => 1);
                  episodeState.setSelectedSeriesId(s._id);
                  void actions.loadEpisodes(s._id);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-100 flex items-center gap-2">
                    <ListVideo size={16} className="text-primary" /> {s.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={s.status} />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        seriesState.setEditingSeriesId(s._id);
                        seriesState.setSeriesForm({
                          title: s.title,
                          description: s.description || '',
                          tags: s.tags?.join(', ') || '',
                          thumbnail: s.thumbnail || ''
                        });
                        seriesState.initialSeriesForm.current = {
                          title: s.title,
                          description: s.description || '',
                          tags: s.tags?.join(', ') || '',
                          thumbnail: s.thumbnail || ''
                        };
                      }}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300"
                      title="Edit series"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void actions.deleteSeriesAction(s._id);
                      }}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-200"
                      title="Delete series"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-2 line-clamp-2">{s.description || 'No description'}</p>
                {s.tags?.length && <div className="text-xs text-gray-500 mt-2">Tags: {s.tags.join(', ')}</div>}
                {s.thumbnail && <div className="text-[11px] text-gray-500 mt-1">Poster: {s.thumbnail}</div>}
              </div>
            ))}
        {!isLoading && !series.length && <p className="text-gray-500 text-sm">No series yet.</p>}
      </div>
      <PaginationControls
        page={seriesMeta.page}
        totalPages={seriesMeta.totalPages}
        total={seriesMeta.total}
        loading={isLoading}
        onPrev={() => actions.setSeriesPage((p) => Math.max(1, p - 1))}
        onNext={() => actions.setSeriesPage((p) => p + 1)}
      />
    </section>
  );
}

