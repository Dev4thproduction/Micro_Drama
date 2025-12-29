'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import {
    CheckCircle,
    Clock,
    CreditCard,
    Crown,
    Loader2,
    RefreshCw,
    Star,
    XCircle,
} from 'lucide-react';
import api from '@/lib/api';

type SubscriptionType = {
    _id: string;
    user: {
        _id: string;
        email: string;
        displayName?: string;
    } | null;
    plan: 'free' | 'basic' | 'premium';
    status: 'trial' | 'active' | 'past_due' | 'canceled' | 'expired';
    startDate: string | null;
    endDate: string | null;
    renewsAt: string | null;
    createdAt: string;
};

const PAGE_SIZE = 10;

const PLAN_CONFIG = {
    free: { label: 'Free', icon: Star, class: 'border-gray-500/30 bg-gray-500/10 text-gray-200' },
    basic: { label: 'Basic', icon: CreditCard, class: 'border-blue-500/30 bg-blue-500/10 text-blue-200' },
    premium: { label: 'Premium', icon: Crown, class: 'border-purple-500/30 bg-purple-500/10 text-purple-200' },
};

const STATUS_CONFIG = {
    trial: { label: 'Trial', icon: Clock, class: 'border-blue-500/30 bg-blue-500/10 text-blue-200' },
    active: { label: 'Active', icon: CheckCircle, class: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' },
    past_due: { label: 'Past Due', icon: Clock, class: 'border-amber-500/30 bg-amber-500/10 text-amber-200' },
    canceled: { label: 'Canceled', icon: XCircle, class: 'border-red-500/30 bg-red-500/10 text-red-200' },
    expired: { label: 'Expired', icon: XCircle, class: 'border-gray-500/30 bg-gray-500/10 text-gray-400' },
};

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<SubscriptionType[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionId, setActionId] = useState<string | null>(null);
    const [planFilter, setPlanFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
        [total]
    );

    const fetchSubscriptions = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params: Record<string, string | number> = { page, limit: PAGE_SIZE };
            if (planFilter) params.plan = planFilter;
            if (statusFilter) params.status = statusFilter;

            const res = await api.get('/admin/subscriptions', { params });
            const payload = res.data?.data ?? res.data;
            const items = payload?.items ?? [];
            const totalCount = payload?.total ?? items.length;
            setSubscriptions(items);
            setTotal(totalCount);
        } catch (err: any) {
            const message =
                err?.response?.data?.error?.message ||
                err?.message ||
                'Unable to load subscriptions';
            setError(message);
            setSubscriptions([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [page, planFilter, statusFilter]);

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    const handleStatusChange = async (subId: string, newStatus: string) => {
        setActionId(subId);
        const snapshot = [...subscriptions];
        setSubscriptions((prev) =>
            prev.map((s) => (s._id === subId ? { ...s, status: newStatus as SubscriptionType['status'] } : s))
        );

        try {
            await api.patch(`/admin/subscriptions/${subId}`, { status: newStatus });
        } catch (err: any) {
            const message =
                err?.response?.data?.error?.message ||
                err?.message ||
                'Failed to update status';
            setError(message);
            setSubscriptions(snapshot);
        } finally {
            setActionId(null);
        }
    };

    const handlePlanChange = async (subId: string, newPlan: string) => {
        setActionId(subId);
        const snapshot = [...subscriptions];
        setSubscriptions((prev) =>
            prev.map((s) => (s._id === subId ? { ...s, plan: newPlan as SubscriptionType['plan'] } : s))
        );

        try {
            await api.patch(`/admin/subscriptions/${subId}`, { plan: newPlan });
        } catch (err: any) {
            const message =
                err?.response?.data?.error?.message ||
                err?.message ||
                'Failed to update plan';
            setError(message);
            setSubscriptions(snapshot);
        } finally {
            setActionId(null);
        }
    };

    const isBusy = (id: string) => actionId === id;

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                        <CreditCard size={14} className="text-primary" />
                        Subscriptions
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Manage Subscriptions</h1>
                    <p className="text-sm text-gray-400">
                        View and manage user subscription plans and statuses.
                    </p>
                </div>

                <button
                    onClick={fetchSubscriptions}
                    disabled={loading}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-gray-200 hover:border-white/20 hover:text-white transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={16} className={clsx('inline-block mr-2', loading && 'animate-spin')} />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <select
                    value={planFilter}
                    onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                >
                    <option value="">All Plans</option>
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                >
                    <option value="">All Statuses</option>
                    <option value="trial">Trial</option>
                    <option value="active">Active</option>
                    <option value="past_due">Past Due</option>
                    <option value="canceled">Canceled</option>
                    <option value="expired">Expired</option>
                </select>
            </div>

            {error && (
                <div
                    role="status"
                    aria-live="polite"
                    className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                >
                    {error}
                </div>
            )}

            {/* Subscriptions Table */}
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#161b22] shadow-xl">
                <div className="grid grid-cols-12 gap-4 border-b border-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                    <div className="col-span-4 sm:col-span-3">User</div>
                    <div className="col-span-3 sm:col-span-2">Plan</div>
                    <div className="col-span-3 sm:col-span-2">Status</div>
                    <div className="hidden sm:block col-span-2">Start Date</div>
                    <div className="hidden sm:block col-span-2">Renews At</div>
                    <div className="col-span-2 sm:col-span-1 text-right">Updated</div>
                </div>

                <div className="divide-y divide-white/5">
                    {loading
                        ? Array.from({ length: 5 }).map((_, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-4 px-4 py-4 animate-pulse">
                                <div className="col-span-4 sm:col-span-3">
                                    <div className="h-4 w-32 rounded-full bg-white/10" />
                                </div>
                                <div className="col-span-3 sm:col-span-2">
                                    <div className="h-6 w-16 rounded-full bg-white/10" />
                                </div>
                                <div className="col-span-3 sm:col-span-2">
                                    <div className="h-6 w-20 rounded-full bg-white/10" />
                                </div>
                                <div className="hidden sm:block col-span-2">
                                    <div className="h-4 w-20 rounded-full bg-white/10" />
                                </div>
                                <div className="hidden sm:block col-span-2">
                                    <div className="h-4 w-20 rounded-full bg-white/10" />
                                </div>
                                <div className="col-span-2 sm:col-span-1 flex justify-end">
                                    <div className="h-4 w-16 rounded-full bg-white/10" />
                                </div>
                            </div>
                        ))
                        : subscriptions.map((sub) => {
                            const planConfig = PLAN_CONFIG[sub.plan] || PLAN_CONFIG.free;
                            const statusConfig = STATUS_CONFIG[sub.status] || STATUS_CONFIG.trial;

                            return (
                                <div
                                    key={sub._id}
                                    className="grid grid-cols-12 gap-4 px-4 py-4 transition-colors hover:bg-white/5"
                                >
                                    <div className="col-span-4 sm:col-span-3 flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center text-sm font-bold ring-2 ring-[#161b22]">
                                            {sub.user?.displayName?.[0] || sub.user?.email?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-white truncate">
                                                {sub.user?.displayName || 'No name'}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">{sub.user?.email || 'Unknown'}</p>
                                        </div>
                                    </div>

                                    <div className="col-span-3 sm:col-span-2 flex items-center">
                                        <select
                                            value={sub.plan}
                                            onChange={(e) => handlePlanChange(sub._id, e.target.value)}
                                            disabled={isBusy(sub._id)}
                                            className={clsx(
                                                'rounded-full border px-2 py-1 text-xs font-semibold bg-transparent focus:outline-none',
                                                planConfig.class,
                                                isBusy(sub._id) && 'opacity-50'
                                            )}
                                        >
                                            <option value="free">Free</option>
                                            <option value="basic">Basic</option>
                                            <option value="premium">Premium</option>
                                        </select>
                                    </div>

                                    <div className="col-span-3 sm:col-span-2 flex items-center">
                                        <select
                                            value={sub.status}
                                            onChange={(e) => handleStatusChange(sub._id, e.target.value)}
                                            disabled={isBusy(sub._id)}
                                            className={clsx(
                                                'rounded-full border px-2 py-1 text-xs font-semibold bg-transparent focus:outline-none',
                                                statusConfig.class,
                                                isBusy(sub._id) && 'opacity-50'
                                            )}
                                        >
                                            <option value="trial">Trial</option>
                                            <option value="active">Active</option>
                                            <option value="past_due">Past Due</option>
                                            <option value="canceled">Canceled</option>
                                            <option value="expired">Expired</option>
                                        </select>
                                    </div>

                                    <div className="hidden sm:flex col-span-2 items-center">
                                        <span className="text-sm text-gray-400">{formatDate(sub.startDate)}</span>
                                    </div>

                                    <div className="hidden sm:flex col-span-2 items-center">
                                        <span className="text-sm text-gray-400">{formatDate(sub.renewsAt)}</span>
                                    </div>

                                    <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-2">
                                        {isBusy(sub._id) && (
                                            <Loader2 size={16} className="animate-spin text-gray-400" />
                                        )}
                                        <span className="text-xs text-gray-500">
                                            {formatDate(sub.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                    {!loading && subscriptions.length === 0 && (
                        <div className="px-4 py-10 text-center text-gray-400">
                            No subscriptions found matching your criteria.
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-gray-400">
                    Page {page} of {totalPages} · {total} total subscriptions
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-gray-200 hover:border-white/20 hover:text-white transition-colors disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages || loading}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-gray-200 hover:border-white/20 hover:text-white transition-colors disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
