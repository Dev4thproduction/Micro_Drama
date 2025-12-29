'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { Image, Loader2, RefreshCw, Upload, Video } from 'lucide-react';
import api from '@/lib/api';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

type MediaUploaderProps = {
  endpoint: string;
  method?: 'post' | 'put' | 'patch';
  accept?: string;
  label?: string;
  helperText?: string;
  initialPreviewUrl?: string;
  metadata?: Record<string, any>;
  chunkSizeBytes?: number;
  maxRetries?: number;
  onUploaded?: (payload: { url?: string; response: any }) => void;
  onError?: (error: any) => void;
};

const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_MAX_RETRIES = 2;

function useDebouncedProgress(delay = 80) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = useCallback(
    (next: number) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        const cb = () => setValue(next);
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(cb);
        } else {
          rafRef.current = requestAnimationFrame(cb);
        }
      }, delay);
    },
    [delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return [value, update] as const;
}

export default function MediaUploader({
  endpoint,
  method = 'post',
  accept = 'image/*,video/*',
  label = 'Upload media',
  helperText = 'Uploads are sent securely to the backend. Progress is tracked in real time.',
  initialPreviewUrl,
  metadata,
  chunkSizeBytes = DEFAULT_CHUNK_SIZE,
  maxRetries = DEFAULT_MAX_RETRIES,
  onUploaded,
  onError,
}: MediaUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl || null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgressDebounced] = useDebouncedProgress();
  const abortRef = useRef<AbortController | null>(null);

  const isVideo = useMemo(
    () => (file?.type || previewUrl || '').toLowerCase().includes('video'),
    [file?.type, previewUrl]
  );

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
      abortRef.current?.abort();
    };
  }, [previewUrl]);

  const resetState = useCallback(() => {
    setStatus('idle');
    setError(null);
    setProgressDebounced(0);
  }, [setProgressDebounced]);

  const handleFileChange = (fileList: FileList | null) => {
    const selected = fileList?.[0];
    if (!selected) return;
    resetState();
    setFile(selected);
    const nextUrl = URL.createObjectURL(selected);
    setPreviewUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return nextUrl;
    });
  };

  const uploadChunk = async (
    chunk: Blob,
    index: number,
    totalChunks: number,
    baseForm: FormData
  ) => {
    const form = new FormData();
    baseForm.forEach((value, key) => form.append(key, value));
    form.append('file', chunk, file?.name || `chunk-${index}`);
    form.append('chunkIndex', String(index));
    form.append('totalChunks', String(totalChunks));
    form.append('originalName', file?.name || '');

    abortRef.current = new AbortController();
    return api.request({
      url: endpoint,
      method,
      data: form,
      signal: abortRef.current.signal,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  const uploadWhole = async (baseForm: FormData) => {
    abortRef.current = new AbortController();
    return api.request({
      url: endpoint,
      method,
      data: baseForm,
      signal: abortRef.current.signal,
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (!event.total) return;
        const pct = Math.round((event.loaded / event.total) * 100);
        setProgressDebounced(pct);
      },
    });
  };

  const uploadWithChunks = async (baseForm: FormData) => {
    if (!file) throw new Error('No file selected');
    const chunkSize = Math.max(256 * 1024, chunkSizeBytes);
    const totalChunks = Math.ceil(file.size / chunkSize);
    let uploaded = 0;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      let attempt = 0;
      while (attempt <= maxRetries) {
        try {
          await uploadChunk(chunk, i, totalChunks, baseForm);
          uploaded += chunk.size;
          const pct = Math.round((uploaded / file.size) * 100);
          setProgressDebounced(pct);
          break;
        } catch (err) {
          attempt += 1;
          if (attempt > maxRetries) throw err;
        }
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    setError(null);
    setProgressDebounced(0);

    const baseForm = new FormData();
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        baseForm.append(key, String(value));
      });
    }

    // use idle time to append heavy payloads to avoid blocking
    const appendFile = () => baseForm.append('file', file, file.name);
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(appendFile);
    } else {
      appendFile();
    }

    try {
      if (file.size > chunkSizeBytes * 1.2) {
        await uploadWithChunks(baseForm);
      } else {
        await uploadWhole(baseForm);
      }
      setStatus('success');
      setProgressDebounced(100);
      onUploaded?.({ response: { ok: true }, url: undefined });
    } catch (err: any) {
      const statusCode = err?.response?.status;
      const backendMessage =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message;
      const message =
        statusCode === 404
          ? 'Upload endpoint not found (404). Please verify the backend route.'
          : backendMessage || 'Upload failed. Please try again.';
      setError(message);
      setStatus('error');
      onError?.(err);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-[#161b22] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="text-xs text-gray-400">{helperText}</p>
        </div>
        {status === 'uploading' && (
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-gray-200">
            <Loader2 size={14} className="animate-spin" />
            Uploading
          </div>
        )}
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-gray-300 hover:border-primary/40 hover:text-white transition-colors">
        {isVideo ? <Video size={22} className="text-primary" /> : <Image size={22} className="text-primary" />}
        <span className="text-sm font-medium">
          {file ? file.name : 'Choose a file to upload'}
        </span>
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files)}
        />
      </label>

      {previewUrl && (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
          {isVideo ? (
            <video src={previewUrl} controls className="w-full" preload="metadata" />
          ) : (
            <img src={previewUrl} alt="preview" className="w-full object-cover" />
          )}
        </div>
      )}

      {status === 'uploading' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || status === 'uploading'}
          className={clsx(
            'inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all',
            !file || status === 'uploading'
              ? 'bg-white/10 cursor-not-allowed opacity-60'
              : 'bg-primary hover:bg-primary/90 shadow-[0_0_18px_rgba(19,91,236,0.35)]'
          )}
        >
          {status === 'uploading' ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {status === 'uploading' ? 'Uploading...' : 'Upload'}
        </button>

        <button
          type="button"
          onClick={() => {
            setFile(null);
            setPreviewUrl(initialPreviewUrl || null);
            resetState();
          }}
          disabled={status === 'uploading'}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-gray-200 hover:border-white/20 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Reset
        </button>
      </div>
    </div>
  );
}
