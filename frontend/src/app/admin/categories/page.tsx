'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
    Folder,
    Loader2,
    Plus,
    RefreshCw,
    Tag,
    Trash2,
} from 'lucide-react';
import api from '@/lib/api';

type Category = {
    _id: string;
    name: string;
    slug: string;
    description: string;
    color: string;
    seriesCount: number;
    createdAt: string;
};

const COLOR_OPTIONS = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#EF4444', // Red
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
];

export default function CategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [creating, setCreating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState(COLOR_OPTIONS[0]);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/admin/categories');
            const payload = res.data?.data ?? res.data;
            setCategories(payload?.items ?? []);
        } catch (err: any) {
            const message =
                err?.response?.data?.error?.message ||
                err?.message ||
                'Failed to load categories';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Category name is required');
            return;
        }

        setCreating(true);
        setError('');
        try {
            const res = await api.post('/admin/categories', {
                name: name.trim(),
                description: description.trim(),
                color,
            });
            const newCategory = res.data?.data ?? res.data;
            setCategories((prev) => [...prev, newCategory]);
            setName('');
            setDescription('');
            setColor(COLOR_OPTIONS[0]);
        } catch (err: any) {
            const message =
                err?.response?.data?.error?.message ||
                err?.message ||
                'Failed to create category';
            setError(message);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (categoryId: string) => {
        setDeletingId(categoryId);
        setError('');
        try {
            await api.delete(`/admin/categories/${categoryId}`);
            setCategories((prev) => prev.filter((c) => c._id !== categoryId));
        } catch (err: any) {
            const message =
                err?.response?.data?.error?.message ||
                err?.message ||
                'Failed to delete category';
            setError(message);
        } finally {
            setDeletingId(null);
        }
    };

    const handleCategoryClick = (categoryId: string) => {
        router.push(`/admin/categories/${categoryId}/series`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                        <Tag size={14} className="text-primary" />
                        Categories Studio
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Categories Studio</h1>
                    <p className="text-sm text-gray-400">
                        Organize your content library structure.
                    </p>
                </div>

                <button
                    onClick={fetchCategories}
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

            {/* Main content grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Create Category Form */}
                <div className="lg:col-span-1 rounded-2xl border border-white/5 bg-[#161b22] p-6 shadow-xl">
                    <div className="flex items-center gap-2 mb-6">
                        <Tag size={18} className="text-primary" />
                        <h2 className="text-lg font-bold text-white">Create Category</h2>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Cyberpunk"
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What is this genre about?"
                                rows={3}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                                Color Tag
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {COLOR_OPTIONS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        className={clsx(
                                            'size-8 rounded-full transition-all',
                                            color === c
                                                ? 'ring-2 ring-white ring-offset-2 ring-offset-[#161b22]'
                                                : 'hover:scale-110'
                                        )}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={creating || !name.trim()}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-[0_0_18px_rgba(19,91,236,0.35)] transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {creating ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Plus size={16} />
                            )}
                            Add Category
                        </button>
                    </form>
                </div>

                {/* Categories List */}
                <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#161b22] shadow-xl overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 border-b border-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                        <div className="col-span-5 sm:col-span-4">Category Name</div>
                        <div className="col-span-3 sm:col-span-3">Slug</div>
                        <div className="col-span-2 sm:col-span-3">Assets</div>
                        <div className="col-span-2 sm:col-span-2 text-right">Actions</div>
                    </div>

                    <div className="divide-y divide-white/5">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-4 px-4 py-4 animate-pulse">
                                    <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
                                        <div className="size-3 rounded-full bg-white/10" />
                                        <div className="h-4 w-24 rounded-full bg-white/10" />
                                    </div>
                                    <div className="col-span-3 sm:col-span-3">
                                        <div className="h-6 w-16 rounded-lg bg-white/10" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-3">
                                        <div className="h-4 w-12 rounded-full bg-white/10" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-2" />
                                </div>
                            ))
                        ) : categories.length === 0 ? (
                            <div className="px-4 py-10 text-center text-gray-400">
                                No categories yet. Create your first one!
                            </div>
                        ) : (
                            categories.map((category) => (
                                <div
                                    key={category._id}
                                    className="grid grid-cols-12 gap-4 px-4 py-4 transition-colors hover:bg-white/5 cursor-pointer"
                                    onClick={() => handleCategoryClick(category._id)}
                                >
                                    <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
                                        <div
                                            className="size-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: category.color }}
                                        />
                                        <div>
                                            <p className="text-sm font-semibold text-white">{category.name}</p>
                                            <p className="text-xs text-gray-500 line-clamp-1">
                                                {category.description || 'No description'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="col-span-3 sm:col-span-3 flex items-center">
                                        <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-mono text-gray-300">
                                            # {category.slug}
                                        </span>
                                    </div>

                                    <div className="col-span-2 sm:col-span-3 flex items-center">
                                        <span className="text-sm text-gray-400">
                                            {category.seriesCount} {category.seriesCount === 1 ? 'title' : 'titles'}
                                        </span>
                                    </div>

                                    <div className="col-span-2 sm:col-span-2 flex items-center justify-end">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(category._id);
                                            }}
                                            disabled={deletingId === category._id}
                                            className="p-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                        >
                                            {deletingId === category._id ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={14} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
