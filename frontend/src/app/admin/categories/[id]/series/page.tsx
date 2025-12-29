'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
    ArrowLeft,
    Film,
    Loader2,
    Plus,
    RefreshCw,
    X,
} from 'lucide-react';
import api from '@/lib/api';

type Category = {
    _id: string;
    name: string;
    slug: string;
    color: string;
};

type Series = {
    _id: string;
    title: string;
    description: string;
    status: string;
    posterUrl?: string;
    creator?: { email: string; displayName?: string };
    createdAt: string;
};

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
    pending: { label: 'Pending', class: 'border-amber-500/30 bg-amber-500/10 text-amber-200' },
    draft: { label: 'Draft', class: 'border-gray-500/30 bg-gray-500/10 text-gray-200' },
    published: { label: 'Published', class: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' },
    archived: { label: 'Archived', class: 'border-red-500/30 bg-red-500/10 text-red-200' },
};

export default function CategorySeriesPage() {
    const params = useParams();
    const router = useRouter();
    const categoryId = params.id as string;

    const [category, setCategory] = useState<Category | null>(null);
    const [series, setSeries] = useState<Series[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');

    const fetchSeriesByCategory = useCallback(async () => {
        if (!categoryId) return;
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/admin/categories/${categoryId}/series`);
            const payload = res.data?.data ?? res.data;
            setCategory(payload?.category ?? null);
            setSeries(payload?.items ?? []);
        } catch (err: any) {
            const message =
                err?.response?.data?.error?.message ||
                err?.message ||
                'Failed to load series';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [categoryId]);

    useEffect(() => {
        fetchSeriesByCategory();
    }, [fetchSeriesByCategory]);

    const handleSeriesClick = (seriesId: string) => {
        router.push(`/admin/series/${seriesId}/episodes`);
    };

    const handleCreateSeries = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle.trim()) {
            setError('Series title is required');
            return;
        }

        setSaving(true);
        setError('');
        try {
            const res = await api.post('/admin/series', {
                title: formTitle.trim(),
                description: formDescription.trim(),
                categoryId,
                status: 'draft'
            });
            const newSeries = res.data?.data ?? res.data;
            setSeries((prev) => [...prev, newSeries]);
            setFormTitle('');
            setFormDescription('');
            setShowAddModal(false);
        } catch (err: any) {
            const message = err?.response?.data?.error?.message || err?.message || 'Failed to create series';
            setError(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                    <button
                        onClick={() => router.push('/admin/categories')}
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-2"
                    >
                        <ArrowLeft size={16} />
                        Back to Categories
                    </button>
                    <div className="flex items-center gap-3">
                        {category && (
                            <div
                                className="size-4 rounded-full"
                                style={{ backgroundColor: category.color }}
                            />
                        )}
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">
                            {category?.name || 'Loading...'} Series
                        </h1>
                    </div>
                    <p className="text-sm text-gray-400">
                        {series.length} {series.length === 1 ? 'series' : 'series'} in this category
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchSeriesByCategory}
                        disabled={loading}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-gray-200 hover:border-white/20 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={clsx('inline-block mr-2', loading && 'animate-spin')} />
                        Refresh
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-[0_0_18px_rgba(19,91,236,0.35)] transition-all hover:bg-primary/90"
                    >
                        <Plus size={16} />
                        New Series
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                    <button onClick={() => setError('')} className="float-right">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Series Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {loading ? (
                    Array.from({ length: 6 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="rounded-2xl border border-white/5 bg-[#161b22] p-5 animate-pulse"
                        >
                            <div className="h-32 w-full rounded-xl bg-white/10 mb-4" />
                            <div className="h-4 w-3/4 rounded-full bg-white/10 mb-2" />
                            <div className="h-3 w-1/2 rounded-full bg-white/10" />
                        </div>
                    ))
                ) : series.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                        <Film size={48} className="text-gray-600 mb-4" />
                        <p className="text-gray-400 mb-2">No series in this category yet</p>
                        <p className="text-sm text-gray-500">Click "New Series" to create your first one</p>
                    </div>
                ) : (
                    series.map((s) => {
                        const statusConfig = STATUS_CONFIG[s.status] || STATUS_CONFIG.draft;
                        return (
                            <div
                                key={s._id}
                                onClick={() => handleSeriesClick(s._id)}
                                className="rounded-2xl border border-white/5 bg-[#161b22] p-5 shadow-lg transition-all hover:border-white/10 hover:shadow-xl cursor-pointer"
                            >
                                {s.posterUrl ? (
                                    <div className="h-32 w-full rounded-xl overflow-hidden mb-4">
                                        <img
                                            src={s.posterUrl}
                                            alt={s.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-32 w-full rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-4">
                                        <Film size={32} className="text-gray-500" />
                                    </div>
                                )}

                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="text-sm font-semibold text-white line-clamp-1">
                                        {s.title}
                                    </h3>
                                    <span
                                        className={clsx(
                                            'rounded-full border px-2 py-0.5 text-xs font-semibold flex-shrink-0',
                                            statusConfig.class
                                        )}
                                    >
                                        {statusConfig.label}
                                    </span>
                                </div>

                                <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                                    {s.description || 'No description'}
                                </p>

                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>
                                        {s.creator?.displayName || s.creator?.email || 'Unknown creator'}
                                    </span>
                                    <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Create Series Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1117] p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">Create New Series</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSeries} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="Enter series title"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    placeholder="Brief description of the series"
                                    rows={3}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-2 p-3 rounded-xl border border-white/10 bg-white/5">
                                <div
                                    className="size-3 rounded-full"
                                    style={{ backgroundColor: category?.color || '#3B82F6' }}
                                />
                                <span className="text-sm text-gray-300">
                                    Category: <strong>{category?.name || 'Unknown'}</strong>
                                </span>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-gray-200 hover:border-white/20 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || !formTitle.trim()}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-[0_0_18px_rgba(19,91,236,0.35)] transition-all hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                    Create Series
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
