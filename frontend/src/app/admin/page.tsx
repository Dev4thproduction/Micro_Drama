'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { clsx } from 'clsx';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import api from '@/lib/api';

type MetricConfig = {
  key: 'pendingEpisodes' | 'totalUsers' | 'revenue' | 'activeCreators';
  title: string;
  helper: string;
  icon: LucideIcon;
  accent: string;
  iconColor: string;
  format?: (val: number) => string;
};

const METRIC_CONFIG: MetricConfig[] = [
  {
    key: 'pendingEpisodes',
    title: 'Pending content',
    helper: 'Awaiting moderation',
    icon: FileText,
    accent: 'from-amber-500/20 to-amber-500/5',
    iconColor: 'text-amber-400',
  },
  {
    key: 'totalUsers',
    title: 'Total users',
    helper: 'Registered accounts',
    icon: Users,
    accent: 'from-blue-500/20 to-blue-500/5',
    iconColor: 'text-blue-400',
    format: (val) => val.toLocaleString(),
  },
  {
    key: 'revenue',
    title: 'Revenue',
    helper: 'Estimated MRR',
    icon: CreditCard,
    accent: 'from-purple-500/20 to-purple-500/5',
    iconColor: 'text-purple-300',
    format: (val) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  },
  {
    key: 'activeCreators',
    title: 'Active creators',
    helper: 'Content producers',
    icon: CheckCircle2,
    accent: 'from-emerald-500/20 to-emerald-500/5',
    iconColor: 'text-emerald-400',
  },
];

type UrgentItem = {
  _id: string;
  title: string;
  createdAt: string;
  series: { _id: string; title: string } | null;
  status: string;
};

type Stats = {
  totalUsers: number;
  activeCreators: number;
  pendingEpisodes: number;
  revenue: number;
};

const toneStyles: Record<
  string,
  { border: string; icon: string; text: string; background: string }
> = {
  success: {
    border: 'border-emerald-500/30',
    icon: 'text-emerald-400',
    text: 'text-emerald-200',
    background: 'bg-emerald-500/10',
  },
  warning: {
    border: 'border-amber-500/30',
    icon: 'text-amber-400',
    text: 'text-amber-200',
    background: 'bg-amber-500/10',
  },
  info: {
    border: 'border-blue-500/30',
    icon: 'text-blue-300',
    text: 'text-blue-100',
    background: 'bg-blue-500/10',
  },
  neutral: {
    border: 'border-white/10',
    icon: 'text-gray-200',
    text: 'text-gray-200',
    background: 'bg-white/5',
  },
};

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function AdminHomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [urgentItems, setUrgentItems] = useState<UrgentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/stats');
      const payload = res.data?.data ?? res.data;
      setStats(payload.stats || null);
      setUrgentItems(payload.urgentItems || []);
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Failed to load dashboard data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-gray-400 w-fit">
          <Sparkles size={14} className="text-primary" />
          Admin overview
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            {user?.displayName ? `Welcome, ${user.displayName}` : 'Admin workspace'}
          </h1>
          <p className="text-sm text-gray-400">
            Real-time metrics from your OTT platform.
          </p>
        </div>
      </div>

      {/* Refresh and Error */}
      <div className="flex items-center gap-3">
        <button
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-gray-200 hover:border-white/20 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={clsx(loading && 'animate-spin')} />
          Refresh
        </button>
        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {error}
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {METRIC_CONFIG.map((metric) => {
          const Icon = metric.icon;
          const rawValue = stats?.[metric.key] ?? 0;
          const displayValue = loading
            ? '—'
            : metric.format
            ? metric.format(rawValue)
            : rawValue.toString();

          return (
            <div
              key={metric.key}
              className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#161b22] p-5 shadow-lg"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${metric.accent} opacity-80`}
              />
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                    {metric.title}
                  </p>
                  <h3 className="mt-3 text-3xl font-bold text-white">
                    {loading ? (
                      <Loader2 size={24} className="animate-spin text-gray-400" />
                    ) : (
                      displayValue
                    )}
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">{metric.helper}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/10 p-3">
                  <Icon size={20} className={metric.iconColor} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Urgent Review Queue */}
        <div className="xl:col-span-2 space-y-4 rounded-2xl border border-white/5 bg-[#161b22] p-6 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                Pending episodes
              </p>
              <h2 className="text-lg font-bold text-white">Content awaiting approval</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
              <Clock size={14} />
              {urgentItems.length} pending
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={24} className="animate-spin text-gray-400" />
              </div>
            ) : urgentItems.length === 0 ? (
              <div className="py-10 text-center text-gray-400">
                No pending episodes. All caught up!
              </div>
            ) : (
              urgentItems.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:border-white/10"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2">
                        <ShieldCheck size={18} className="text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="text-xs text-gray-400">
                          {item.series?.title || 'Unknown series'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
                        {item.status}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-gray-300">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4 rounded-2xl border border-white/5 bg-[#161b22] p-6 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                Platform health
              </p>
              <h2 className="text-lg font-bold text-white">System status</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-gray-300">
              <BarChart3 size={14} className="inline-block mr-1" />
              Live
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                title: 'API Status',
                meta: loading ? 'Checking...' : error ? 'Connection issue' : 'All systems operational',
                tone: loading ? 'neutral' : error ? 'warning' : 'success',
              },
              {
                title: 'Database',
                meta: 'MongoDB connected',
                tone: 'success',
              },
              {
                title: 'Content pipeline',
                meta: `${stats?.pendingEpisodes || 0} items in queue`,
                tone: (stats?.pendingEpisodes || 0) > 10 ? 'warning' : 'info',
              },
              {
                title: 'Creator activity',
                meta: `${stats?.activeCreators || 0} active creators`,
                tone: 'neutral',
              },
            ].map((item) => {
              const tone = toneStyles[item.tone] || toneStyles.neutral;
              return (
                <div
                  key={item.title}
                  className={clsx(
                    'flex items-start gap-3 rounded-xl border p-4',
                    tone.border,
                    tone.background
                  )}
                >
                  <div
                    className={clsx(
                      'mt-1 flex size-9 items-center justify-center rounded-full border',
                      tone.border,
                      tone.background
                    )}
                  >
                    <Activity size={16} className={tone.icon} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className={clsx('text-xs', tone.text)}>{item.meta}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
