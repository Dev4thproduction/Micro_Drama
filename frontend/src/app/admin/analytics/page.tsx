'use client';

import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import {
    BarChart3,
    CreditCard,
    Film,
    FolderTree,
    Layers3,
    Loader2,
    Play,
    RefreshCw,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react';
import api from '@/lib/api';

type Stats = {
    totalUsers: number;
    activeCreators: number;
    totalViewers: number;
    pendingEpisodes: number;
    revenue: number;
    estimatedAnnualRevenue: number;
    avgRevenuePerUser: number;
    activeSubscriptions: number;
    totalSeries: number;
    publishedSeries: number;
    totalEpisodes: number;
    publishedEpisodes: number;
    totalCategories: number;
    newUsersThisMonth: number;
    userGrowthPercent: number;
    newSubsThisMonth: number;
    subGrowthPercent: number;
    userToCreatorRatio: number;
    episodesPerSeries: number;
};

type UrgentItem = {
    _id: string;
    title: string;
    createdAt: string;
    series?: { _id: string; title: string };
    status: string;
};

type TopContent = {
    _id: string;
    title: string;
    posterUrl?: string;
    createdAt: string;
};

const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function AnalyticsPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [urgentItems, setUrgentItems] = useState<UrgentItem[]>([]);
    const [topContent, setTopContent] = useState<TopContent[]>([]);
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
            setTopContent(payload.topContent || []);
        } catch (err: any) {
            const message = err?.response?.data?.error?.message || err?.message || 'Failed to load analytics';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const renderGrowth = (percent: number) => {
        if (percent === 0) return <span className="text-gray-400">No change</span>;
        const isPositive = percent > 0;
        return (
            <span className={clsx('flex items-center gap-1', isPositive ? 'text-emerald-400' : 'text-red-400')}>
                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {isPositive ? '+' : ''}{percent}%
            </span>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                        <BarChart3 size={14} className="text-primary" />
                        Analytics
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Platform Analytics</h1>
                    <p className="text-sm text-gray-400">
                        Real-time metrics and performance overview in INR (₹)
                    </p>
                </div>
                <button
                    onClick={fetchStats}
                    disabled={loading}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-gray-200 hover:border-white/20 hover:text-white transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={16} className={clsx('inline-block mr-2', loading && 'animate-spin')} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                </div>
            )}

            {/* Main Metrics Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {/* Total Users */}
                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#161b22] p-6 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-500/5 opacity-80" />
                    <div className="relative z-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Total Users</p>
                                <h3 className="mt-3 text-3xl font-bold text-white">
                                    {loading ? <Loader2 size={24} className="animate-spin text-gray-400" /> : (stats?.totalUsers || 0).toLocaleString('en-IN')}
                                </h3>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/10 p-3">
                                <Users size={20} className="text-blue-400" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs">
                            {!loading && renderGrowth(stats?.userGrowthPercent || 0)}
                            <span className="text-gray-500">vs last month</span>
                        </div>
                    </div>
                </div>

                {/* Active Subscriptions */}
                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#161b22] p-6 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-500/5 opacity-80" />
                    <div className="relative z-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Active Subscriptions</p>
                                <h3 className="mt-3 text-3xl font-bold text-white">
                                    {loading ? <Loader2 size={24} className="animate-spin text-gray-400" /> : (stats?.activeSubscriptions || 0).toLocaleString('en-IN')}
                                </h3>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/10 p-3">
                                <CreditCard size={20} className="text-purple-300" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs">
                            {!loading && renderGrowth(stats?.subGrowthPercent || 0)}
                            <span className="text-gray-500">vs last month</span>
                        </div>
                    </div>
                </div>

                {/* Monthly Revenue */}
                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#161b22] p-6 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 opacity-80" />
                    <div className="relative z-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Monthly Revenue</p>
                                <h3 className="mt-3 text-3xl font-bold text-white">
                                    {loading ? <Loader2 size={24} className="animate-spin text-gray-400" /> : formatINR(stats?.revenue || 0)}
                                </h3>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/10 p-3">
                                <TrendingUp size={20} className="text-emerald-400" />
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-gray-400">
                            @ ₹299/subscription/month
                        </div>
                    </div>
                </div>

                {/* Pending Episodes */}
                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#161b22] p-6 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-amber-500/5 opacity-80" />
                    <div className="relative z-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Pending Episodes</p>
                                <h3 className="mt-3 text-3xl font-bold text-white">
                                    {loading ? <Loader2 size={24} className="animate-spin text-gray-400" /> : stats?.pendingEpisodes || 0}
                                </h3>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/10 p-3">
                                <Play size={20} className="text-amber-400" />
                            </div>
                        </div>
                        <div className="mt-4 text-xs">
                            <span className={clsx(stats?.pendingEpisodes && stats.pendingEpisodes > 0 ? 'text-amber-400' : 'text-emerald-400')}>
                                {stats?.pendingEpisodes && stats.pendingEpisodes > 0 ? 'Needs attention' : 'All caught up'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content & Revenue Metrics */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {/* Content Overview */}
                <div className="rounded-2xl border border-white/5 bg-[#161b22] p-6 shadow-xl">
                    <div className="mb-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Content Library</p>
                        <h2 className="text-lg font-bold text-white">Content Overview</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                                <FolderTree size={14} className="text-primary" />
                                Categories
                            </div>
                            <p className="text-2xl font-bold text-white">{loading ? '—' : stats?.totalCategories || 0}</p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                                <Layers3 size={14} className="text-purple-400" />
                                Total Series
                            </div>
                            <p className="text-2xl font-bold text-white">
                                {loading ? '—' : stats?.totalSeries || 0}
                                <span className="text-sm text-gray-400 ml-2">({stats?.publishedSeries || 0} published)</span>
                            </p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                                <Film size={14} className="text-emerald-400" />
                                Total Episodes
                            </div>
                            <p className="text-2xl font-bold text-white">
                                {loading ? '—' : stats?.totalEpisodes || 0}
                                <span className="text-sm text-gray-400 ml-2">({stats?.publishedEpisodes || 0} published)</span>
                            </p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                                <BarChart3 size={14} className="text-amber-400" />
                                Avg Episodes/Series
                            </div>
                            <p className="text-2xl font-bold text-white">{loading ? '—' : stats?.episodesPerSeries || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="rounded-2xl border border-white/5 bg-[#161b22] p-6 shadow-xl">
                    <div className="mb-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Revenue</p>
                        <h2 className="text-lg font-bold text-white">Revenue Breakdown (INR)</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                            <p className="text-xs text-gray-400 mb-2">Monthly Revenue</p>
                            <p className="text-2xl font-bold text-emerald-400">{loading ? '—' : formatINR(stats?.revenue || 0)}</p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                            <p className="text-xs text-gray-400 mb-2">Est. Annual Revenue</p>
                            <p className="text-2xl font-bold text-white">{loading ? '—' : formatINR(stats?.estimatedAnnualRevenue || 0)}</p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                            <p className="text-xs text-gray-400 mb-2">Avg Revenue/User</p>
                            <p className="text-2xl font-bold text-white">{loading ? '—' : formatINR(stats?.avgRevenuePerUser || 0)}</p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                            <p className="text-xs text-gray-400 mb-2">Active Subscribers</p>
                            <p className="text-2xl font-bold text-white">{loading ? '—' : (stats?.activeSubscriptions || 0).toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* User & Creator Metrics */}
            <div className="rounded-2xl border border-white/5 bg-[#161b22] p-6 shadow-xl">
                <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Platform Health</p>
                    <h2 className="text-lg font-bold text-white">Key Performance Indicators</h2>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                        <p className="text-xs text-gray-400">Total Viewers</p>
                        <p className="mt-2 text-xl font-bold text-white">{loading ? '—' : (stats?.totalViewers || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                        <p className="text-xs text-gray-400">Active Creators</p>
                        <p className="mt-2 text-xl font-bold text-white">{loading ? '—' : (stats?.activeCreators || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                        <p className="text-xs text-gray-400">User:Creator Ratio</p>
                        <p className="mt-2 text-xl font-bold text-white">{loading ? '—' : `${stats?.userToCreatorRatio || 0}:1`}</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                        <p className="text-xs text-gray-400">New Users (30d)</p>
                        <p className="mt-2 text-xl font-bold text-white">{loading ? '—' : (stats?.newUsersThisMonth || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                        <p className="text-xs text-gray-400">Platform Status</p>
                        <p className="mt-2 text-xl font-bold text-emerald-400">{loading ? '—' : 'Healthy'}</p>
                    </div>
                </div>
            </div>

            {/* Urgent Items & Top Content */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {/* Pending Review */}
                <div className="rounded-2xl border border-white/5 bg-[#161b22] p-6 shadow-xl">
                    <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Pending Review</p>
                        <h2 className="text-lg font-bold text-white">Recent Pending Episodes</h2>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 size={24} className="animate-spin text-gray-400" />
                        </div>
                    ) : urgentItems.length === 0 ? (
                        <div className="py-8 text-center text-gray-400">
                            <Play size={32} className="mx-auto mb-2 text-emerald-400" />
                            <p>No pending episodes</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {urgentItems.map((item) => (
                                <div key={item._id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
                                    <Play size={16} className="text-amber-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                                        <p className="text-xs text-gray-400">{item.series?.title || 'Unknown series'}</p>
                                    </div>
                                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-200">
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Content */}
                <div className="rounded-2xl border border-white/5 bg-[#161b22] p-6 shadow-xl">
                    <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Top Content</p>
                        <h2 className="text-lg font-bold text-white">Recently Published Series</h2>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 size={24} className="animate-spin text-gray-400" />
                        </div>
                    ) : topContent.length === 0 ? (
                        <div className="py-8 text-center text-gray-400">
                            <Layers3 size={32} className="mx-auto mb-2" />
                            <p>No published series yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {topContent.map((item) => (
                                <div key={item._id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
                                    <div className="h-10 w-16 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-purple-500/20 flex-shrink-0">
                                        {item.posterUrl ? (
                                            <img src={item.posterUrl} alt={item.title} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <Layers3 size={16} className="text-gray-500" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(item.createdAt).toLocaleDateString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
