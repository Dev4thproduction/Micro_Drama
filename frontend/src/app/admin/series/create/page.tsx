'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { ArrowLeft, Loader2, Upload, Image, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { uploadToCloudinary } from '@/lib/cloudinary';
import CategorySelector from '@/components/admin/CategorySelector';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'published', label: 'Published' },
];

export default function CreateSeriesPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [status, setStatus] = useState('draft');
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    router.prefetch('/admin/series');
    return () => {
      if (posterPreview?.startsWith('blob:')) URL.revokeObjectURL(posterPreview);
    };
  }, [posterPreview, router]);

  const canSubmit = useMemo(
    () => title.trim().length > 0 && categoryId !== null && !submitting,
    [title, categoryId, submitting]
  );

  const handlePosterChange = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setPosterFile(file);
    const url = URL.createObjectURL(file);
    setPosterPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return url;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    setUploadProgress(null);

    try {
      let posterUrl = '';
      if (posterFile) {
        const uploadRes = await uploadToCloudinary(posterFile, {
          folder: 'series-posters',
          onProgress: setUploadProgress,
        });
        posterUrl = uploadRes.secureUrl || '';
      }

      const payload = {
        title: title.trim(),
        description,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        categoryId,
        status,
        posterUrl,
      };

      await api.post('/admin/series', payload);
      setSuccess('Series created successfully');
      router.push('/admin/series');
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create series';
      setError(message);
    } finally {
      setSubmitting(false);
      setTimeout(() => setUploadProgress(null), 600);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
            <Upload size={14} className="text-primary" />
            Create Series
          </div>
          <h1 className="text-3xl font-bold text-white">New Series</h1>
          <p className="text-sm text-gray-400">
            Add series metadata and optionally upload a poster via Cloudinary.
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/series')}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-gray-200 hover:border-white/20 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200">Title *</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Series title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="What is this series about?"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200">Tags</label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Comma separated (e.g. drama, sci-fi)"
              />
            </div>

            <CategorySelector selectedId={categoryId} onChange={setCategoryId} />
          </div>

          <div className="space-y-6 rounded-2xl border border-white/10 bg-[#161b22] p-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200">Poster (Cloudinary)</label>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-gray-300 hover:border-primary/40 hover:text-white transition-colors">
                <Image size={20} className="text-primary" />
                <span className="text-xs font-medium">
                  {posterFile ? posterFile.name : 'Upload poster (JPG/PNG)'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePosterChange(e.target.files)}
                />
              </label>
              {posterPreview && (
                <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
                  <img src={posterPreview} alt="Poster preview" className="w-full object-cover" />
                </div>
              )}

              {uploadProgress !== null && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <span>Upload</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {success}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={!canSubmit}
                className={clsx(
                  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all',
                  canSubmit
                    ? 'bg-primary hover:bg-primary/90 shadow-[0_0_18px_rgba(19,91,236,0.35)]'
                    : 'bg-white/10 cursor-not-allowed opacity-60'
                )}
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {submitting ? 'Creating...' : 'Create series'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setTitle('');
                  setDescription('');
                  setTags('');
                  setCategoryId(null);
                  setPosterFile(null);
                  setPosterPreview(null);
                  setStatus('draft');
                  setError('');
                  setSuccess('');
                  setUploadProgress(null);
                }}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-gray-200 hover:border-white/20 hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} />
                Reset
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
