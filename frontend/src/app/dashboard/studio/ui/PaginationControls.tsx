'use client';

type Props = {
  page: number;
  totalPages: number;
  total: number;
  loading: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function PaginationControls({ page, totalPages, total, loading, onPrev, onNext }: Props) {
  return (
    <div className="flex items-center justify-between text-xs text-gray-400 px-2 py-2">
      <span>
        Page {page} of {Math.max(totalPages, 1)} · {total} items
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={loading || page <= 1}
          onClick={onPrev}
          className="px-3 py-1 rounded-lg border border-white/10 bg-white/5 hover:border-white/20 disabled:opacity-40"
        >
          Prev
        </button>
        <button
          type="button"
          disabled={loading || page >= totalPages}
          onClick={onNext}
          className="px-3 py-1 rounded-lg border border-white/10 bg-white/5 hover:border-white/20 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

