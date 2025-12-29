'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
    ArrowLeft,
    Check,
    Clock,
    CreditCard,
    Film,
    Loader2,
    Pencil,
    Play,
    Plus,
    RefreshCw,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import api from '@/lib/api';

declare global {
    interface Window {
        cloudinary: any;
    }
}

type Series = {
    _id: string;
    title: string;
    status: string;
    category?: { name: string; color: string };
};

type Episode = {
    _id: string;
    title: string;
    synopsis: string;
    order: number;
    status: string;
    isFree?: boolean;
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
    season?: string;
    createdAt: string;
    updatedAt?: string;
};

type Season = {
    _id: string;
    number: number;
    title: string;
    description?: string;
    status: string;
};

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
    pending: { label: 'Pending', class: 'border-amber-500/30 bg-amber-500/10 text-amber-200' },
    draft: { label: 'Draft', class: 'border-gray-500/30 bg-gray-500/10 text-gray-200' },
    scheduled: { label: 'Scheduled', class: 'border-blue-500/30 bg-blue-500/10 text-blue-200' },
    published: { label: 'Published', class: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' },
    archived: { label: 'Archived', class: 'border-red-500/30 bg-red-500/10 text-red-200' },
};

export default function SeriesEpisodesPage() {
    const params = useParams();
    const router = useRouter();
    const seriesId = params.id as string;

    const [series, setSeries] = useState<Series | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [activeSeason, setActiveSeason] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSeasonModal, setShowSeasonModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);

    // New episode form
    const [formTitle, setFormTitle] = useState('');
    const [formSynopsis, setFormSynopsis] = useState('');
    const [formOrder, setFormOrder] = useState(1);
    const [formSeasonId, setFormSeasonId] = useState<string | null>(null);
    const [formIsFree, setFormIsFree] = useState(false);
    const [formVideoUrl, setFormVideoUrl] = useState('');
    const [formVideoPublicId, setFormVideoPublicId] = useState('');
    const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
    const [formDuration, setFormDuration] = useState(0);
    const [uploading, setUploading] = useState(false);

    // New season form
    const [seasonTitle, setSeasonTitle] = useState('');

    const fetchData = useCallback(async () => {
        if (!seriesId) return;
        setLoading(true);
        setError('');
        try {
            // Fetch episodes, seasons, and series info in parallel
            const [episodesRes, seasonsRes, seriesRes] = await Promise.all([
                api.get(`/admin/series/${seriesId}/episodes`),
                api.get(`/admin/series/${seriesId}/seasons`),
                api.get('/admin/series')
            ]);

            const episodesPayload = episodesRes.data?.data ?? episodesRes.data;
            const items = Array.isArray(episodesPayload) ? episodesPayload : (episodesPayload?.items ?? []);
            setEpisodes(items);

            const seasonsPayload = seasonsRes.data?.data ?? [];
            setSeasons(Array.isArray(seasonsPayload) ? seasonsPayload : []);

            const seriesData = seriesRes.data?.data ?? seriesRes.data;
            const seriesList = Array.isArray(seriesData) ? seriesData : (seriesData?.items ?? []);
            const found = seriesList.find?.((s: any) => s._id === seriesId);
            if (found) setSeries(found);
        } catch (err: any) {
            const message = err?.response?.data?.error?.message || err?.message || 'Failed to load data';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [seriesId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Load Cloudinary Upload Widget script
    useEffect(() => {
        if (typeof window !== 'undefined' && !window.cloudinary) {
            const script = document.createElement('script');
            script.src = 'https://upload-widget.cloudinary.com/global/all.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const openCloudinaryWidget = async () => {
        if (!window.cloudinary) {
            setError('Cloudinary widget is loading, please try again');
            return;
        }

        setUploading(true);
        try {
            // Get cloud name from backend
            const signRes = await api.post('/uploads/cloudinary/sign', {
                folder: `episodes/${seriesId}`
            });
            const signData = signRes.data?.data ?? signRes.data;
            const cloudName = signData.cloudName;
            const apiKey = signData.apiKey;

            if (!cloudName || !apiKey) {
                setError('Cloudinary is not configured. Please check backend .env');
                setUploading(false);
                return;
            }

            const widget = window.cloudinary.createUploadWidget(
                {
                    cloudName: cloudName,
                    apiKey: apiKey,
                    uploadPreset: 'ml_default', // Use unsigned upload preset (create in Cloudinary dashboard)
                    folder: `episodes/${seriesId}`,
                    resourceType: 'video',
                    sources: ['local', 'url', 'camera'],
                    multiple: false,
                    maxFileSize: 500000000, // 500MB
                    clientAllowedFormats: ['mp4', 'mov', 'webm', 'mkv', 'avi'],
                    showAdvancedOptions: false,
                    cropping: false,
                    styles: {
                        palette: {
                            window: "#0d1117",
                            windowBorder: "#374151",
                            tabIcon: "#3B82F6",
                            menuIcons: "#9CA3AF",
                            textDark: "#000000",
                            textLight: "#FFFFFF",
                            link: "#3B82F6",
                            action: "#3B82F6",
                            inactiveTabIcon: "#6B7280",
                            error: "#EF4444",
                            inProgress: "#3B82F6",
                            complete: "#10B981",
                            sourceBg: "#161b22"
                        }
                    }
                },
                (error: any, result: any) => {
                    if (error) {
                        setError('Upload failed: ' + (error.message || JSON.stringify(error)));
                        setUploading(false);
                        return;
                    }
                    if (result.event === 'close') {
                        setUploading(false);
                    }
                    if (result.event === 'success') {
                        const info = result.info;
                        setFormVideoUrl(info.secure_url);
                        setFormVideoPublicId(info.public_id);
                        setFormDuration(Math.round(info.duration || 0));
                        // Generate thumbnail from video
                        const thumbUrl = info.secure_url
                            .replace(/\.[^.]+$/, '.jpg')
                            .replace('/upload/', '/upload/c_thumb,w_300,h_200/');
                        setFormThumbnailUrl(thumbUrl);
                        setUploading(false);
                    }
                }
            );
            widget.open();
        } catch (err: any) {
            setError('Failed to initialize upload: ' + (err?.response?.data?.error?.message || err.message));
            setUploading(false);
        }
    };

    const handleSaveEpisode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle.trim()) {
            setError('Episode title is required');
            return;
        }
        if (!formVideoUrl) {
            setError('Please upload a video first');
            return;
        }

        setSaving(true);
        setError('');
        try {
            const payload = {
                title: formTitle.trim(),
                synopsis: formSynopsis.trim(),
                order: formOrder,
                seasonId: formSeasonId,
                isFree: formIsFree,
                status: editingEpisode ? editingEpisode.status : 'draft',
                videoUrl: formVideoUrl,
                videoPublicId: formVideoPublicId,
                thumbnailUrl: formThumbnailUrl,
                duration: formDuration
            };

            if (editingEpisode) {
                // Update existing episode
                const res = await api.patch(`/admin/episodes/${editingEpisode._id}`, payload);
                const updatedEp = res.data?.data ?? res.data;
                setEpisodes((prev) =>
                    prev.map((ep) => (ep._id === updatedEp._id ? updatedEp : ep)).sort((a, b) => a.order - b.order)
                );
            } else {
                // Create new episode
                const res = await api.post(`/admin/series/${seriesId}/episodes`, payload);
                const newEp = res.data?.data ?? res.data;
                setEpisodes((prev) => [...prev, newEp].sort((a, b) => a.order - b.order));
            }

            resetForm();
            setShowAddModal(false);
        } catch (err: any) {
            const message = err?.response?.data?.error?.message || err?.message || 'Failed to save episode';
            setError(message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (episodeId: string) => {
        setDeletingId(episodeId);
        try {
            await api.delete(`/admin/episodes/${episodeId}`);
            setEpisodes((prev) => prev.filter((ep) => ep._id !== episodeId));
        } catch (err: any) {
            setError(err?.response?.data?.error?.message || 'Failed to delete episode');
        } finally {
            setDeletingId(null);
        }
    };

    const handlePublish = async (episodeId: string) => {
        try {
            await api.patch(`/admin/episodes/${episodeId}`, { status: 'published' });
            setEpisodes((prev) =>
                prev.map((ep) => (ep._id === episodeId ? { ...ep, status: 'published' } : ep))
            );
        } catch (err: any) {
            setError(err?.response?.data?.error?.message || 'Failed to publish episode');
        }
    };

    const resetForm = () => {
        setEditingEpisode(null);
        setFormTitle('');
        setFormSynopsis('');
        setFormOrder(episodes.length + 1);
        setFormSeasonId(null);
        setFormIsFree(false);
        setFormVideoUrl('');
        setFormVideoPublicId('');
        setFormThumbnailUrl('');
        setFormDuration(0);
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEdit = (episode: Episode) => {
        setEditingEpisode(episode);
        setFormTitle(episode.title);
        setFormSynopsis(episode.synopsis || '');
        setFormOrder(episode.order);
        setFormSeasonId(episode.season || null);
        setFormIsFree(episode.isFree || false);
        setFormVideoUrl(episode.videoUrl);
        setFormVideoPublicId(''); // Don't allow changing public ID easily or just keep it
        setFormThumbnailUrl(episode.thumbnailUrl);
        setFormDuration(episode.duration);
        setShowAddModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-2"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                        {series?.title || 'Loading...'} - Episodes
                    </h1>
                    <p className="text-sm text-gray-400">
                        {episodes.length} {episodes.length === 1 ? 'episode' : 'episodes'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-gray-200 hover:border-white/20 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={clsx('inline-block mr-2', loading && 'animate-spin')} />
                        Refresh
                    </button>
                    <button
                        onClick={() => {
                            resetForm();
                            setFormOrder(episodes.length + 1);
                            setShowAddModal(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-[0_0_18px_rgba(19,91,236,0.35)] transition-all hover:bg-primary/90"
                    >
                        <Plus size={16} />
                        Add Episode
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                    <button onClick={() => setError('')} className="float-right">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Season Tabs */}
            <div className="flex flex-wrap items-center gap-2">
                <button
                    onClick={() => setActiveSeason(null)}
                    className={clsx(
                        'rounded-lg px-3 py-1.5 text-sm font-semibold transition-all',
                        activeSeason === null
                            ? 'bg-primary text-white shadow-[0_0_10px_rgba(19,91,236,0.35)]'
                            : 'border border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                    )}
                >
                    All Episodes
                </button>
                {seasons.map((season) => (
                    <button
                        key={season._id}
                        onClick={() => setActiveSeason(season._id)}
                        className={clsx(
                            'rounded-lg px-3 py-1.5 text-sm font-semibold transition-all',
                            activeSeason === season._id
                                ? 'bg-primary text-white shadow-[0_0_10px_rgba(19,91,236,0.35)]'
                                : 'border border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                        )}
                    >
                        {season.title || `Season ${season.number}`}
                    </button>
                ))}
                <button
                    onClick={() => setShowSeasonModal(true)}
                    className="rounded-lg border border-dashed border-white/20 px-3 py-1.5 text-sm text-gray-400 hover:border-primary hover:text-primary transition-all"
                >
                    <Plus size={14} className="inline-block mr-1" />
                    Add Season
                </button>
            </div>

            {/* Episodes List */}
            <div className="space-y-4">
                {loading ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="rounded-2xl border border-white/5 bg-[#161b22] p-4 animate-pulse">
                            <div className="flex gap-4">
                                <div className="h-20 w-32 rounded-xl bg-white/10" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-48 rounded-full bg-white/10" />
                                    <div className="h-3 w-32 rounded-full bg-white/10" />
                                </div>
                            </div>
                        </div>
                    ))
                ) : episodes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-white/5 bg-[#161b22]">
                        <Film size={48} className="text-gray-600 mb-4" />
                        <p className="text-gray-400 mb-2">No episodes yet</p>
                        <p className="text-sm text-gray-500">Click "Add Episode" to upload your first video</p>
                    </div>
                ) : (
                    episodes.map((episode) => {
                        const statusConfig = STATUS_CONFIG[episode.status] || STATUS_CONFIG.draft;
                        return (
                            <div
                                key={episode._id}
                                className="rounded-2xl border border-white/5 bg-[#161b22] p-4 shadow-lg transition-all hover:border-white/10"
                            >
                                <div className="flex gap-4">
                                    {/* Thumbnail */}
                                    <div className="relative h-20 w-32 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-purple-500/20">
                                        {episode.thumbnailUrl ? (
                                            <img src={episode.thumbnailUrl} alt={episode.title} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <Play size={24} className="text-gray-500" />
                                            </div>
                                        )}
                                        <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                                            {formatDuration(episode.duration)}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">EP {episode.order}</span>
                                                    <h3 className="text-sm font-semibold text-white">{episode.title}</h3>
                                                    {episode.updatedAt && episode.createdAt && new Date(episode.updatedAt).getTime() > new Date(episode.createdAt).getTime() + 1000 && (
                                                        <span className="text-[10px] text-gray-500 italic">
                                                            (Edited {new Date(episode.updatedAt).toLocaleDateString()})
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                                                    {episode.synopsis || 'No synopsis'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {/* Free/Paid Badge */}
                                                <span className={clsx(
                                                    'rounded-full border px-2 py-0.5 text-xs font-semibold',
                                                    episode.isFree
                                                        ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                                                        : 'border-amber-500/50 bg-amber-500/20 text-amber-300'
                                                )}>
                                                    {episode.isFree ? 'FREE' : 'PAID'}
                                                </span>
                                                <span className={clsx('rounded-full border px-2 py-0.5 text-xs font-semibold', statusConfig.class)}>
                                                    {statusConfig.label}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 mt-3">
                                            {episode.status !== 'published' && (
                                                <button
                                                    onClick={() => handlePublish(episode._id)}
                                                    className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                                                >
                                                    <Check size={14} />
                                                    Publish
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEdit(episode)}
                                                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                                            >
                                                <Pencil size={14} />
                                                Edit
                                            </button>
                                            {episode.videoUrl && (
                                                <a
                                                    href={episode.videoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                                                >
                                                    <Play size={14} />
                                                    Preview
                                                </a>
                                            )}
                                            <button
                                                onClick={() => handleDelete(episode._id)}
                                                disabled={deletingId === episode._id}
                                                className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                                            >
                                                {deletingId === episode._id ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={14} />
                                                )}
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Episode Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d1117] p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">{editingEpisode ? 'Edit Episode' : 'Add New Episode'}</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEpisode} className="space-y-4">
                            {/* Video Upload */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                                    Video *
                                </label>
                                {formVideoUrl ? (
                                    <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                                        <Check size={18} className="text-emerald-400" />
                                        <span className="text-sm text-emerald-200 truncate flex-1">Video uploaded successfully</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormVideoUrl('');
                                                setFormVideoPublicId('');
                                                setFormThumbnailUrl('');
                                                setFormDuration(0);
                                            }}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={openCloudinaryWidget}
                                        disabled={uploading}
                                        className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/20 bg-white/5 px-4 py-8 text-sm text-gray-300 hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={20} />
                                                Click to upload video (MP4, MOV, WebM)
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={formTitle}
                                        onChange={(e) => setFormTitle(e.target.value)}
                                        placeholder="Episode title"
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                                        Episode Order *
                                    </label>
                                    <input
                                        type="number"
                                        value={formOrder}
                                        onChange={(e) => setFormOrder(parseInt(e.target.value) || 1)}
                                        min={1}
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-primary focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                                        Duration
                                    </label>
                                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-400">
                                        <Clock size={16} />
                                        {formDuration > 0 ? formatDuration(formDuration) : 'Auto-detected'}
                                    </div>
                                </div>

                                {/* Free/Paid Toggle */}
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                                        Access Type
                                    </label>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormIsFree(false)}
                                            className={clsx(
                                                'flex-1 flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all',
                                                !formIsFree
                                                    ? 'border-primary bg-primary/20 text-white shadow-[0_0_10px_rgba(19,91,236,0.35)]'
                                                    : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                                            )}
                                        >
                                            <CreditCard size={16} />
                                            Paid (Subscribers Only)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormIsFree(true)}
                                            className={clsx(
                                                'flex-1 flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all',
                                                formIsFree
                                                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.35)]'
                                                    : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                                            )}
                                        >
                                            <Play size={16} />
                                            Free (Everyone)
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                                    Synopsis
                                </label>
                                <textarea
                                    value={formSynopsis}
                                    onChange={(e) => setFormSynopsis(e.target.value)}
                                    placeholder="Episode description"
                                    rows={3}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none resize-none"
                                />
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
                                    disabled={saving || !formVideoUrl || !formTitle.trim()}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-[0_0_18px_rgba(19,91,236,0.35)] transition-all hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : editingEpisode ? (
                                        <RefreshCw size={16} />
                                    ) : (
                                        <Plus size={16} />
                                    )}
                                    {editingEpisode ? 'Save Changes' : 'Add Episode'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Season Modal */}
            {showSeasonModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1117] p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">Add New Season</h2>
                            <button onClick={() => setShowSeasonModal(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setSaving(true);
                                setError('');
                                try {
                                    const res = await api.post(`/admin/series/${seriesId}/seasons`, {
                                        title: seasonTitle.trim() || undefined
                                    });
                                    const newSeason = res.data?.data ?? res.data;
                                    setSeasons((prev) => [...prev, newSeason].sort((a, b) => a.number - b.number));
                                    setSeasonTitle('');
                                    setShowSeasonModal(false);
                                } catch (err: any) {
                                    setError(err?.response?.data?.error?.message || 'Failed to create season');
                                } finally {
                                    setSaving(false);
                                }
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                                    Season Title (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={seasonTitle}
                                    onChange={(e) => setSeasonTitle(e.target.value)}
                                    placeholder="e.g., Season 1 or The Beginning"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none"
                                />
                                <p className="mt-2 text-xs text-gray-500">
                                    Leave empty to auto-name as "Season {seasons.length + 1}"
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowSeasonModal(false)}
                                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-gray-200 hover:border-white/20 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-[0_0_18px_rgba(19,91,236,0.35)] transition-all hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                    Create Season
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
