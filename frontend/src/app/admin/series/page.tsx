'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
  ArrowDownUp,
  BadgeInfo,
  ChevronDown,
  ChevronRight,
  Clock,
  Film,
  FolderTree,
  GripVertical,
  Layers3,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import api from '@/lib/api';

type Series = {
  _id: string;
  title: string;
  description?: string;
  status?: string;
  posterUrl?: string;
  createdAt?: string;
};

type Episode = {
  _id: string;
  title: string;
  synopsis?: string;
  order: number;
  status?: string;
  releaseDate?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  duration?: number;
};

type SeasonGroup = {
  season: number;
  episodes: Episode[];
};

const EPISODES_PER_SEASON = 8;

function groupEpisodesIntoSeasons(episodes: Episode[]): SeasonGroup[] {
  const sorted = [...episodes].sort((a, b) => (a.order || 0) - (b.order || 0));
  const seasons: Record<number, Episode[]> = {};
  sorted.forEach((ep) => {
    const seasonIndex = Math.max(1, Math.ceil((ep.order || 1) / EPISODES_PER_SEASON));
    if (!seasons[seasonIndex]) seasons[seasonIndex] = [];
    seasons[seasonIndex].push(ep);
  });
  return Object.entries(seasons)
    .map(([season, items]) => ({ season: Number(season), episodes: items }))
    .sort((a, b) => a.season - b.season);
}

function Collapsible({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState('0px');

  useEffect(() => {
    if (open && ref.current) {
      const next = `${ref.current.scrollHeight}px`;
      setHeight(next);
    } else {
      setHeight('0px');
    }
  }, [open, children]);

  return (
    <div
      className={clsx(
        'overflow-hidden transition-[max-height] duration-500 ease-in-out',
        open ? 'opacity-100' : 'opacity-80'
      )}
      style={{ maxHeight: open ? height : '0px' }}
    >
      <div ref={ref}>{children}</div>
    </div>
  );
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function EpisodeRow({
  episode,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  episode: Episode;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: (id: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(episode._id)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(episode._id);
      }}
      onDrop={() => onDrop(episode._id)}
      className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-white transition-all hover:border-white/10"
    >
      {/* Thumbnail */}
      <div className="relative h-12 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-purple-500/20">
        {episode.thumbnailUrl ? (
          <img src={episode.thumbnailUrl} alt={episode.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Film size={16} className="text-gray-500" />
          </div>
        )}
        {episode.duration && episode.duration > 0 && (
          <div className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 py-0.5 text-[10px] text-white">
            {formatDuration(episode.duration)}
          </div>
        )}
      </div>

      <span className="flex size-7 items-center justify-center rounded-lg bg-white/5 text-xs font-bold text-primary flex-shrink-0">
        {episode.order ?? '?'}
      </span>
      <div className="flex-1 min-w-0">
        <p className="truncate font-semibold">{episode.title}</p>
        <p className="text-xs text-gray-400 truncate">
          {episode.status || 'pending'} ·{' '}
          {episode.releaseDate
            ? new Date(episode.releaseDate).toLocaleDateString()
            : 'no date'}
        </p>
      </div>
      <div className="flex items-center gap-2 text-gray-400">
        <GripVertical className="size-4 group-active:rotate-3 transition-transform" />
      </div>
    </div>
  );
}

export default function SeriesEpisodesPage() {
  const router = useRouter();
  const [series, setSeries] = useState<Series[]>([]);
  const [episodesBySeries, setEpisodesBySeries] = useState<Record<string, Episode[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const [epError, setEpError] = useState<Record<string, string>>({});
  const dragState = useRef<{ seriesId: string; draggedId: string | null; overId: string | null }>({
    seriesId: '',
    draggedId: null,
    overId: null,
  });

  const fetchSeries = useCallback(async () => {
    setLoadingSeries(true);
    setError('');
    try {
      const res = await api.get('/admin/series');
      const payload = res.data?.data ?? res.data ?? [];
      const items: Series[] = Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload)
          ? payload
          : [];
      setSeries(items);
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Unable to load series';
      setError(message);
    } finally {
      setLoadingSeries(false);
    }
  }, []);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  const fetchEpisodes = useCallback(
    async (seriesId: string) => {
      setEpError((prev) => ({ ...prev, [seriesId]: '' }));
      setLoadingEpisodes((prev) => ({ ...prev, [seriesId]: true }));
      try {
        const res = await api.get(`/admin/series/${seriesId}/episodes`);
        const payload = res.data?.data ?? res.data ?? [];
        const items: Episode[] = Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload)
            ? payload
            : [];
        setEpisodesBySeries((prev) => ({ ...prev, [seriesId]: items }));
      } catch (err: any) {
        const message =
          err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          'Unable to load episodes';
        setEpError((prev) => ({ ...prev, [seriesId]: message }));
        setEpisodesBySeries((prev) => ({ ...prev, [seriesId]: [] }));
      } finally {
        setLoadingEpisodes((prev) => ({ ...prev, [seriesId]: false }));
      }
    },
    []
  );

  const toggleSeries = (seriesId: string) => {
    setExpanded((prev) => {
      const next = !prev[seriesId];
      const updated = { ...prev, [seriesId]: next };
      return updated;
    });
    if (!episodesBySeries[seriesId]) {
      fetchEpisodes(seriesId);
    }
  };

  const handleDragStart = (seriesId: string, episodeId: string) => {
    dragState.current = { seriesId, draggedId: episodeId, overId: null };
  };

  const handleDragOver = (seriesId: string, overId: string) => {
    if (dragState.current.seriesId !== seriesId) return;
    dragState.current.overId = overId;
  };

  const handleDrop = (seriesId: string, dropId: string) => {
    const { draggedId } = dragState.current;
    if (!draggedId || dragState.current.seriesId !== seriesId) return;
    const list = episodesBySeries[seriesId] || [];
    const draggedIndex = list.findIndex((e) => e._id === draggedId);
    const dropIndex = list.findIndex((e) => e._id === dropId);
    if (draggedIndex === -1 || dropIndex === -1) return;
    const updated = [...list];
    const [removed] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, removed);
    setEpisodesBySeries((prev) => ({ ...prev, [seriesId]: updated }));
  };

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold uppercase tracking-[0.18em]">
        <FolderTree size={14} className="text-primary" />
        Series CMS
      </div>
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
        <ArrowDownUp size={14} className="text-primary" />
        Drag to reorder locally (visual only)
      </div>
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
        <Clock size={14} className="text-primary" />
        Scroll stays put on expand
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          {headerActions}
          <h1 className="text-3xl font-bold text-white">Series & Episodes</h1>
          <p className="text-sm text-gray-400">
            Browse series, open seasons, and quickly inspect episode orders without layout jumps.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/series/create')}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-[0_0_18px_rgba(19,91,236,0.35)] transition-all hover:bg-primary/90"
          >
            New series
          </button>
          <button
            onClick={fetchSeries}
            disabled={loadingSeries}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200 hover:border-white/20 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={clsx(loadingSeries && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <BadgeInfo size={16} />
          {error}
        </div>
      )}

      <div className="space-y-3">
        {loadingSeries &&
          Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/5 bg-[#161b22] p-5 shadow-lg animate-pulse"
            >
              <div className="h-4 w-40 rounded-full bg-white/10" />
              <div className="mt-3 h-3 w-24 rounded-full bg-white/10" />
              <div className="mt-5 h-24 rounded-xl bg-white/5" />
            </div>
          ))}

        {!loadingSeries &&
          series.map((item, idx) => {
            const isOpen = expanded[item._id];
            const episodes = episodesBySeries[item._id];
            const seasonGroups = episodes ? groupEpisodesIntoSeasons(episodes) : [];
            const seriesDelay = idx * 40;

            return (
              <div
                key={item._id}
                className="rounded-2xl border border-white/5 bg-[#161b22] p-4 shadow-xl transition-all duration-500 hover:border-white/10"
                style={{ transitionDelay: `${seriesDelay}ms` }}
              >
                <button
                  onClick={() => toggleSeries(item._id)}
                  className="flex w-full items-start gap-3 text-left"
                >
                  {/* Series Poster Thumbnail */}
                  <div className="relative h-16 w-24 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-purple-500/20">
                    {item.posterUrl ? (
                      <img src={item.posterUrl} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Layers3 size={20} className="text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-white truncate">{item.title}</h2>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                        {item.status || 'pending'}
                      </span>
                    </div>
                    {item.description && (
                      <p className="mt-1 text-sm text-gray-400 line-clamp-2">{item.description}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Created {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    {loadingEpisodes[item._id] && <Loader2 size={16} className="animate-spin" />}
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </button>

                <Collapsible open={isOpen}>
                  <div className="mt-4 space-y-3">
                    {/* Manage Episodes Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/series/${item._id}/episodes`);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-[0_0_18px_rgba(19,91,236,0.35)] transition-all hover:bg-primary/90"
                    >
                      <Film size={16} />
                      Manage Episodes (Add Videos)
                    </button>

                    {epError[item._id] && (
                      <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                        {epError[item._id]}
                      </div>
                    )}

                    {!episodes && !loadingEpisodes[item._id] && (
                      <div className="text-sm text-gray-400">No episodes loaded yet.</div>
                    )}

                    {episodes && (
                      <div className="space-y-4">
                        {seasonGroups.map((season) => (
                          <div
                            key={season.season}
                            className="rounded-xl border border-white/5 bg-black/10 p-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                <Film size={14} className="text-primary" />
                                Season {season.season}
                              </div>
                              <div className="text-xs text-gray-400 flex items-center gap-2">
                                <ArrowDownUp size={12} />
                                Drag rows to reorder (visual)
                              </div>
                            </div>
                            <div className="mt-2 space-y-2">
                              {season.episodes.map((ep) => (
                                <EpisodeRow
                                  key={ep._id}
                                  episode={ep}
                                  onDragStart={(id) => handleDragStart(item._id, id)}
                                  onDragOver={(id) => handleDragOver(item._id, id)}
                                  onDrop={(id) => handleDrop(item._id, id)}
                                />
                              ))}
                            </div>
                          </div>
                        ))}

                        {seasonGroups.length === 0 && (
                          <div className="rounded-xl border border-dashed border-white/10 bg-white/5 px-3 py-4 text-sm text-gray-400">
                            No episodes found. Click "Manage Episodes" above to add videos!
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Collapsible>
              </div>
            );
          })}

        {!loadingSeries && series.length === 0 && (
          <div className="rounded-2xl border border-white/5 bg-[#161b22] p-6 text-sm text-gray-400">
            No series found.
          </div>
        )}
      </div>
    </div>
  );
}
