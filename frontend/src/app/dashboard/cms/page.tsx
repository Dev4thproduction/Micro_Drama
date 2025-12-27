'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { clsx } from 'clsx';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Activity,
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Plus,
  Save,
  ShieldCheck,
  UploadCloud
} from 'lucide-react';

type CmsEntry = {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  body?: string;
  type: string;
  visibility: string;
  status: string;
  tags?: string[];
  publishAt?: string;
  updatedAt?: string;
  version?: number;
};

type AuditLog = {
  _id: string;
  action: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

const defaultForm = {
  title: '',
  slug: '',
  summary: '',
  body: '',
  type: 'page',
  visibility: 'public',
  status: 'draft',
  tags: '',
  publishAt: ''
};

const statusClass = (status: string) =>
  ({
    draft: 'bg-gray-700/60 text-gray-100 border border-gray-600/80',
    review: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    scheduled: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
    published: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    archived: 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
  }[status] || 'bg-gray-800 text-gray-100');

export default function CmsDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [entries, setEntries] = useState<CmsEntry[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState({ status: '', type: '', q: '' });
  const [form, setForm] = useState(defaultForm);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingEntries, setLoadingEntries] = useState(false);

  const canManage = useMemo(() => user && (user.role === 'admin' || user.role === 'creator'), [user]);
  const canPublish = useMemo(() => user && user.role === 'admin', [user]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!canManage) {
      router.push('/');
      return;
    }
    loadEntries();
  }, [user, isLoading, canManage]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadEntries = async () => {
    try {
      setLoadingEntries(true);
      const { data } = await api.get('/cms/entries', {
        params: {
          ...filters,
          limit: 20,
          sort: 'updatedAt:desc'
        }
      });
      setEntries(data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load CMS entries');
    } finally {
      setLoadingEntries(false);
    }
  };

  const resetForm = () => {
    setForm(defaultForm);
    setSelectedId(null);
    setAuditTrail([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    const payload = {
      ...form,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      publishAt: form.publishAt || undefined
    };

    try {
      if (selectedId) {
        await api.put(`/cms/entries/${selectedId}`, payload);
        setSuccess('Entry updated and version bumped.');
      } else {
        await api.post('/cms/entries', payload);
        setSuccess('Entry created.');
      }
      await loadEntries();
      if (!selectedId) {
        resetForm();
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishNow = async (entryId: string) => {
    setIsPublishing(entryId);
    setError('');
    setSuccess('');
    try {
      await api.post(`/cms/entries/${entryId}/publish`);
      setSuccess('Published successfully.');
      await loadEntries();
      if (entryId === selectedId) {
        setSelectedId(null);
        resetForm();
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Publish failed');
    } finally {
      setIsPublishing(null);
    }
  };

  const handleSelect = async (entryId: string) => {
    try {
      setSelectedId(entryId);
      const { data } = await api.get(`/cms/entries/${entryId}`, {
        params: { includeLogs: true }
      });
      const entry = data.data.entry as CmsEntry;
      setForm({
        title: entry.title || '',
        slug: entry.slug || '',
        summary: entry.summary || '',
        body: entry.body || '',
        type: entry.type || 'page',
        visibility: entry.visibility || 'public',
        status: entry.status || 'draft',
        tags: entry.tags?.join(', ') || '',
        publishAt: entry.publishAt ? entry.publishAt.slice(0, 16) : ''
      });
      setAuditTrail(data.data.auditTrail || []);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load entry');
    }
  };

  const statusOptions = ['draft', 'review', 'scheduled'];
  const typeOptions = ['page', 'collection', 'announcement', 'banner'];
  const visibilityOptions = ['public', 'authenticated', 'subscribers', 'internal'];

  return (
    <div className="min-h-screen bg-[#0b0d11] text-white p-6 lg:p-10">
      <div className="flex flex-col gap-4 mb-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase text-primary font-semibold tracking-[0.2em]">CMS Control Center</p>
          <h1 className="text-3xl lg:text-4xl font-black mt-2">Editorial & Experience CMS</h1>
          <p className="text-gray-400 max-w-2xl">
            Govern narratives, hero slots, announcements, and landing copy with workflow states, scheduled publishing,
            and audit history.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard">
            <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-gray-200 hover:border-primary hover:text-primary transition-all">
              Back to Admin
            </div>
          </Link>
          <div className="rounded-xl bg-primary text-white px-4 py-2 text-sm font-semibold shadow-[0_10px_40px_rgba(19,91,236,0.35)]">
            Enterprise Ready
          </div>
        </div>
      </div>

      {(error || success) && (
        <div className="mb-6 grid gap-3 lg:grid-cols-2">
          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              <CheckCircle2 size={16} /> {success}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck size={18} className="text-primary" /> Governance Queue
            </h2>
            <div className="flex gap-2">
              <select
                className="bg-[#111520] border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All statuses</option>
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
              <select
                className="bg-[#111520] border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">All types</option>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <button
                className="px-3 py-2 rounded-lg bg-primary text-sm font-semibold hover:bg-primary/90"
                onClick={loadEntries}
                disabled={loadingEntries}
              >
                {loadingEntries ? 'Refreshing…' : 'Apply'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0f131c] shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/5">
                <thead className="bg-white/5 text-xs uppercase text-gray-400 tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Updated</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {entries.map((entry) => (
                    <tr key={entry._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-100 flex items-center gap-2">
                          <FileText size={14} className="text-primary" />
                          {entry.title}
                        </div>
                        <p className="text-xs text-gray-500">{entry.slug}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx('px-2 py-1 rounded-full text-xs font-semibold', statusClass(entry.status))}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300 capitalize">{entry.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {entry.updatedAt ? new Date(entry.updatedAt).toLocaleString() : '—'}
                        {entry.version && (
                          <span className="ml-2 text-xs text-gray-500">v{entry.version}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-200 space-x-2">
                        <button
                          className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold"
                          onClick={() => handleSelect(entry._id)}
                        >
                          Edit
                        </button>
                        {canPublish && (
                          <button
                            className="px-3 py-1 rounded-lg bg-primary text-xs font-semibold hover:bg-primary/90 disabled:opacity-50"
                            onClick={() => handlePublishNow(entry._id)}
                            disabled={isPublishing === entry._id}
                          >
                            {isPublishing === entry._id ? 'Publishing...' : 'Publish'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!entries.length && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                        {loadingEntries ? 'Loading entries...' : 'No entries yet. Create your first asset on the right.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {auditTrail.length > 0 && (
            <div className="rounded-2xl border border-white/5 bg-[#0f131c] p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
                <Activity size={16} className="text-primary" /> Recent Audit Trail
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {auditTrail.map((log) => (
                  <div key={log._id} className="flex items-start gap-3 rounded-xl bg-white/5 p-3 text-sm">
                    <div className="rounded-full bg-primary/20 text-primary p-1.5">
                      <Clock size={14} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-100 uppercase text-[11px] tracking-wide">{log.action}</div>
                      <div className="text-gray-400 text-xs">
                        {new Date(log.createdAt).toLocaleString()}
                        {log.metadata?.publishAt && (
                          <span className="ml-2 text-primary">
                            Scheduled {new Date(log.metadata.publishAt as string).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-[#141927] via-[#0f131c] to-[#0b0d11] shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase text-primary font-semibold tracking-[0.2em]">Entry Editor</p>
                <h3 className="text-xl font-bold">{selectedId ? 'Update content' : 'Create content'}</h3>
              </div>
              <div className="rounded-full bg-white/10 p-2 text-gray-300">
                {selectedId ? <Save size={16} /> : <Plus size={16} />}
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Title</label>
                <input
                  className="w-full rounded-xl bg-[#0b0d11] border border-white/10 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                  value={form.title}
                  required
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Episode hero, landing copy, announcement..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Slug</label>
                  <input
                    className="w-full rounded-xl bg-[#0b0d11] border border-white/10 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="auto-generated if empty"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Type</label>
                  <select
                    className="w-full rounded-xl bg-[#0b0d11] border border-white/10 px-4 py-3 text-sm"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    {typeOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Visibility</label>
                  <select
                    className="w-full rounded-xl bg-[#0b0d11] border border-white/10 px-4 py-3 text-sm"
                    value={form.visibility}
                    onChange={(e) => setForm({ ...form, visibility: e.target.value })}
                  >
                    {visibilityOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300 flex items-center gap-2">Workflow state</label>
                  <select
                    className="w-full rounded-xl bg-[#0b0d11] border border-white/10 px-4 py-3 text-sm"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Summary</label>
                <textarea
                  className="w-full rounded-xl bg-[#0b0d11] border border-white/10 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                  rows={2}
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="One-liner for cards and feeds."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300 flex items-center gap-2">
                  Body <UploadCloud size={14} className="text-primary" />
                </label>
                <textarea
                  className="w-full rounded-xl bg-[#0b0d11] border border-white/10 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                  rows={5}
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder="Long-form copy for landing sections, announcements, or curated notes."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Tags</label>
                  <input
                    className="w-full rounded-xl bg-[#0b0d11] border border-white/10 px-4 py-3 text-sm"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="comma separated"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300 flex items-center gap-2">
                    Publish at <CalendarClock size={14} className="text-primary" />
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-xl bg-[#0b0d11] border border-white/10 px-4 py-3 text-sm"
                    value={form.publishAt}
                    onChange={(e) => setForm({ ...form, publishAt: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">Leave empty to keep draft/review. Admins publish in one click.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="animate-spin" size={16} />}
                  {selectedId ? 'Save version' : 'Create entry'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold hover:border-white/30"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0f131c] p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <ShieldCheck size={16} className="text-primary" /> Enterprise guardrails
            </div>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>Workflow states (draft/review/scheduled/published/archived) with admin-only publishing.</li>
              <li>Version bump on every change and audit logs for traceability.</li>
              <li>Visibility controls (public, authenticated, subscribers, internal) for downstream gating.</li>
              <li>Scheduled launches with future `publishAt` times; immediate publish supported for admins.</li>
              <li>Public endpoints `/cms/public` and `/cms/public/:slug` to hydrate landing pages.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

