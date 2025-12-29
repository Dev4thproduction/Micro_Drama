'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import {
  AlertCircle,
  ArrowUpRight,
  DollarSign,
  Film,
  RefreshCw,
  Users,
} from 'lucide-react';
import api from '@/lib/api';

type Stats = {
  totalUsers: number;
  revenue: number;
  pendingEpisodes: number;
};

const CARD_CONFIG = [
  {
    key: 'users',
    label: 'Users',
    helper: 'Registered accounts',
    icon: Users,
    tone: 'from-blue-500/20 to-blue-500/5',
    text: 'text-blue-100',
    format: (value: number) => value.toLocaleString(),
    extract: (stats: Stats) => stats.totalUsers ?? 0,
  },
  {
    key: 'revenue',
    label: 'Revenue',
    helper: 'Monthly run rate',
    icon: DollarSign,
    tone: 'from-emerald-500/20 to-emerald-500/5',
    text: 'text-emerald-100',
    format: (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    extract: (stats: Stats) => stats.revenue ?? 0,
  },
  {
    key: 'content',
    label: 'Content',
    helper: 'Items needing review',
    icon: Film,
    tone: 'from-purple-500/20 to-purple-500/5',
    text: 'text-purple-100',
    format: (value: number) => value.toLocaleString(),
    extract: (stats: Stats) => stats.pendingEpisodes ?? 0,
  },
] as const;

type CardConfig = (typeof CARD_CONFIG)[number];

function usePrefersReducedMotion() {
  const [prefers, setPrefers] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefers(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return prefers;
}

function useAnimatedNumber(
  value: number | null,
  duration = 900,
  prefersReducedMotion = false
) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValueRef = useRef(0);

  useEffect(() => {
    if (value === null || value === undefined) return;
    if (prefersReducedMotion) {
      setDisplayValue(value);
      previousValueRef.current = value;
      return;
    }

    let frame: number;
    const start = performance.now();
    const startValue = previousValueRef.current ?? 0;
    const targetValue = value;
    const delta = targetValue - startValue;

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startValue + delta * eased);

      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        previousValueRef.current = targetValue;
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, prefersReducedMotion]);

  return displayValue;
}

function MetricCard({
  card,
  value,
  index,
  mounted,
  prefersReducedMotion,
}: {
  card: CardConfig;
  value: number;
  index: number;
  mounted: boolean;
  prefersReducedMotion: boolean;
}) {
  const animatedValue = useAnimatedNumber(value, 900, prefersReducedMotion);
  const Icon = card.icon;
  const delay = prefersReducedMotion ? 0 : index * 60;

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-2xl border border-white/5 bg-[#161b22] p-5 shadow-lg transition-all duration-500',
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${card.tone} opacity-80`} />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
            {card.label}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-3xl font-bold text-white">
              {card.format(Math.round(animatedValue))}
            </span>
            <ArrowUpRight size={16} className="text-primary" />
          </div>
          <p className={clsx('mt-1 text-xs', card.text)}>{card.helper}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/10 p-3">
          <Icon size={20} className={card.text} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const prefersReducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      setMounted(true);
      return;
    }
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, [prefersReducedMotion]);

  const fetchStats = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.get('/admin/stats');
      const payload = res.data?.data;
      const serverStats: Stats | undefined = payload?.stats || payload;
      if (!serverStats) {
        throw new Error('No stats returned');
      }
      setStats({
        totalUsers: serverStats.totalUsers ?? 0,
        revenue: serverStats.revenue ?? 0,
        pendingEpisodes: serverStats.pendingEpisodes ?? 0,
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Failed to load dashboard metrics';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const skeletonPulse = prefersReducedMotion ? '' : 'animate-pulse';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
          <RefreshCw size={14} className="text-primary" />
          Live metrics
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin dashboard</h1>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">
          <AlertCircle size={20} />
          <div className="flex-1">
            <p className="text-sm font-semibold">Couldn&apos;t load metrics</p>
            <p className="text-xs text-red-200/80">{error}</p>
          </div>
          <button
            onClick={() => {
              setStats(null);
              fetchStats();
            }}
            className="rounded-lg border border-white/20 px-3 py-1 text-xs font-bold text-white hover:border-white/40"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? CARD_CONFIG.map((card) => (
              <div
                key={card.key}
                className={clsx(
                  'rounded-2xl border border-white/5 bg-[#161b22] p-5 shadow-lg',
                  skeletonPulse,
                  mounted ? 'opacity-100' : 'opacity-0'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="h-5 w-24 rounded-full bg-white/10" />
                  <div className="size-10 rounded-xl bg-white/10" />
                </div>
                <div className="mt-6 h-10 w-32 rounded-full bg-white/10" />
                <div className="mt-3 h-4 w-24 rounded-full bg-white/5" />
              </div>
            ))
          : CARD_CONFIG.map((card, idx) => (
              <MetricCard
                key={card.key}
                card={card}
                value={stats ? card.extract(stats) : 0}
                index={idx}
                mounted={mounted}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
      </div>
    </div>
  );
}
