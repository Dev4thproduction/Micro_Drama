'use client';

import { useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { Loader2, Tag } from 'lucide-react';
import api from '@/lib/api';

type Category = { _id: string; name: string; color?: string };

type Props = {
  selectedId: string | null;
  onChange: (categoryId: string | null) => void;
};

export default function CategorySelector({ selectedId, onChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/admin/categories');
        const payload = res.data?.data ?? res.data ?? {};
        const items: Category[] = Array.isArray(payload.items) ? payload.items : Array.isArray(payload) ? payload : [];
        setCategories(items);
      } catch (err: any) {
        const msg = err?.response?.data?.error?.message || err?.message || 'Failed to load categories';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((c) => c._id === selectedId),
    [categories, selectedId]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
          <Tag size={16} className="text-primary" />
          Category *
        </div>
        {loading && <Loader2 size={14} className="animate-spin text-gray-400" />}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      )}

      {categories.length === 0 && !loading ? (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-400">
          No categories available. Please create one first.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => onChange(selectedId === cat._id ? null : cat._id)}
              className={clsx(
                'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
                selectedId === cat._id
                  ? 'border-primary/50 bg-primary/20 text-white shadow-[0_0_10px_rgba(19,91,236,0.35)]'
                  : 'border-white/10 bg-white/5 text-gray-200 hover:border-white/20'
              )}
            >
              <div
                className="size-2 rounded-full"
                style={{ backgroundColor: cat.color || '#3B82F6' }}
              />
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {selectedCategory && (
        <div className="text-xs text-gray-400">
          Selected: <span className="text-white font-medium">{selectedCategory.name}</span>
        </div>
      )}
    </div>
  );
}
