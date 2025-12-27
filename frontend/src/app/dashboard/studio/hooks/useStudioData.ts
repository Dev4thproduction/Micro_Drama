'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const MAX_SIZE_BYTES = 1024 * 1024 * 1024;
const ALLOWED_VIDEO_PREFIX = 'video/';
const allowedRoles = new Set(['creator', 'admin']);

export type Video = {
  _id: string;
  s3Key: string;
  status: string;
  format?: string;
  sizeBytes?: number;
  durationSeconds?: number;
  processingNote?: string;
  createdAt?: string;
};

export type Series = {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  status: string;
  tags?: string[];
  createdAt?: string;
};

export type Episode = {
  _id: string;
  title: string;
  thumbnail?: string;
  order: number;
  status: string;
  releaseDate?: string;
  video?: string;
  approvedAt?: string;
  approvalNote?: string;
  synopsis?: string;
  createdAt?: string;
};

export type Toast = { id: number; message: string; tone: 'success' | 'error' | 'info' };

export const useStudioData = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const canUseStudio = useMemo(() => Boolean(user && allowedRoles.has(user.role)), [user]);

  // Pagination state
  const [videoPage, setVideoPage] = useState(1);
  const [seriesPage, setSeriesPage] = useState(1);
  const [episodePage, setEpisodePage] = useState(1);

  // Data
  const [videos, setVideos] = useState<Video[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('');
  const [videoMeta, setVideoMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [seriesMeta, setSeriesMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [episodeMeta, setEpisodeMeta] = useState({ page: 1, totalPages: 1, total: 0 });

  // UI state
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [isLoadingSeries, setIsLoadingSeries] = useState(false);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingSeries, setIsSavingSeries] = useState(false);
  const [isSavingEpisode, setIsSavingEpisode] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const [videoMessage, setVideoMessage] = useState('');
  const [seriesMessage, setSeriesMessage] = useState('');
  const [episodeMessage, setEpisodeMessage] = useState('');
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<string>('');
  const uploadAbortRef = useRef<AbortController | null>(null);

  const [editingSeriesId, setEditingSeriesId] = useState<string>('');
  const [editingEpisodeId, setEditingEpisodeId] = useState<string>('');
  const [seriesForm, setSeriesForm] = useState({ title: '', description: '', tags: '', thumbnail: '' });
  const [episodeForm, setEpisodeForm] = useState({
    title: '',
    synopsis: '',
    order: 1,
    videoId: '',
    releaseDate: '',
    thumbnail: ''
  });
  const initialSeriesForm = useRef(seriesForm);
  const initialEpisodeForm = useRef(episodeForm);

  const showToast = useCallback((message: string, tone: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  const validateFile = (file: File | null) => {
    if (!file) return 'Select a video file first';
    if (!file.type.startsWith(ALLOWED_VIDEO_PREFIX)) return 'Only video files are allowed';
    if (file.size <= 0) return 'File is empty';
    if (file.size > MAX_SIZE_BYTES) return 'File too large (max 1GB)';
    return null;
  };

  const hasSeriesDirty =
    seriesForm.title !== initialSeriesForm.current.title ||
    seriesForm.description !== initialSeriesForm.current.description ||
    seriesForm.tags !== initialSeriesForm.current.tags ||
    seriesForm.thumbnail !== initialSeriesForm.current.thumbnail;

  const hasEpisodeDirty =
    episodeForm.title !== initialEpisodeForm.current.title ||
    episodeForm.synopsis !== initialEpisodeForm.current.synopsis ||
    episodeForm.order !== initialEpisodeForm.current.order ||
    episodeForm.videoId !== initialEpisodeForm.current.videoId ||
    episodeForm.releaseDate !== initialEpisodeForm.current.releaseDate ||
    episodeForm.thumbnail !== initialEpisodeForm.current.thumbnail;

  // navigation guards
  useEffect(() => {
    if (!canUseStudio) return;
    const handler = (e: BeforeUnloadEvent) => {
      if (hasSeriesDirty || hasEpisodeDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [canUseStudio, hasSeriesDirty, hasEpisodeDirty]);

  // auth guard + initial load
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!canUseStudio) {
      router.push('/');
      return;
    }
    void loadVideos();
    void loadSeries();
  }, [user, isLoading, canUseStudio]); // eslint-disable-line react-hooks/exhaustive-deps

  // pagination effects
  useEffect(() => {
    if (!user || !canUseStudio) return;
    void loadVideos();
  }, [videoPage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user || !canUseStudio) return;
    void loadSeries();
  }, [seriesPage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user || !canUseStudio || !selectedSeriesId) return;
    void loadEpisodes(selectedSeriesId);
  }, [episodePage, selectedSeriesId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadVideos = async () => {
    try {
      setIsLoadingVideos(true);
      const { data } = await api.get('/creator/videos', {
        params: { page: videoPage, limit: 5, sort: 'createdAt:desc' }
      });
      setVideos(data.data || []);
      const meta = data.meta || {};
      setVideoMeta({
        page: meta.page || videoPage,
        totalPages: meta.totalPages || 1,
        total: meta.total || (data.data?.length || 0)
      });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load videos');
      showToast(err.response?.data?.error?.message || 'Failed to load videos', 'error');
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const loadSeries = async () => {
    try {
      setIsLoadingSeries(true);
      const { data } = await api.get('/creator/series', {
        params: { page: seriesPage, limit: 5, sort: 'createdAt:desc' }
      });
      const items = data.data || [];
      setSeries(items);
      const meta = data.meta || {};
      setSeriesMeta({
        page: meta.page || seriesPage,
        totalPages: meta.totalPages || 1,
        total: meta.total || items.length
      });
      if (items.length) {
        const nextSeriesId = selectedSeriesId || items[0]._id;
        if (nextSeriesId !== selectedSeriesId) setEpisodePage(1);
        setSelectedSeriesId(nextSeriesId);
        void loadEpisodes(nextSeriesId);
      } else {
        setSelectedSeriesId('');
        setEpisodes([]);
        setEpisodeMeta({ page: 1, totalPages: 1, total: 0 });
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load series');
      showToast(err.response?.data?.error?.message || 'Failed to load series', 'error');
    } finally {
      setIsLoadingSeries(false);
    }
  };

  const loadEpisodes = async (seriesId: string) => {
    if (!seriesId) {
      setEpisodes([]);
      return;
    }
    try {
      setIsLoadingEpisodes(true);
      const { data } = await api.get(`/creator/series/${seriesId}/episodes`, {
        params: { page: episodePage, limit: 5, sort: 'order:asc' }
      });
      setEpisodes(data.data || []);
      const meta = data.meta || {};
      setEpisodeMeta({
        page: meta.page || episodePage,
        totalPages: meta.totalPages || 1,
        total: meta.total || (data.data?.length || 0)
      });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load episodes');
      showToast(err.response?.data?.error?.message || 'Failed to load episodes', 'error');
    } finally {
      setIsLoadingEpisodes(false);
    }
  };

  const uploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateFile(videoFile);
    if (validationError) {
      setError(validationError);
      showToast(validationError, 'error');
      return;
    }
    setError('');
    setVideoMessage('');
    setIsUploading(true);
    setUploadProgress(0);
    uploadAbortRef.current = new AbortController();

    try {
      const contentType = videoFile!.type || 'application/octet-stream';
      const { data } = await api.post('/uploads/presign', {
        contentType,
        fileName: videoFile!.name,
        sizeBytes: videoFile!.size
      });
      const { s3Key, uploadUrl } = data.data;

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl, true);
        xhr.setRequestHeader('Content-Type', contentType);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(true);
          else reject(new Error(`Upload failed with status ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.onabort = () => reject(new Error('Upload canceled'));
        xhr.send(videoFile);
        uploadAbortRef.current?.signal.addEventListener('abort', () => xhr.abort());
      });

      await api.post('/creator/videos', {
        s3Key,
        storageUrl: s3Key,
        format: contentType,
        sizeBytes: videoFile!.size,
        durationSeconds: videoDuration ? Number(videoDuration) : undefined
      });

      setVideoMessage('Upload complete and video registered.');
      showToast('Upload complete and video registered.', 'success');
      setVideoFile(null);
      setVideoDuration('');
      await loadVideos();
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Upload failed';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      uploadAbortRef.current = null;
    }
  };

  const createSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSeriesMessage('');
    setIsSavingSeries(true);
    try {
      const tags = seriesForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      if (editingSeriesId) {
        await api.put(`/creator/series/${editingSeriesId}`, {
          title: seriesForm.title,
          description: seriesForm.description,
          tags,
          thumbnail: seriesForm.thumbnail
        });
        setSeriesMessage('Series updated.');
        showToast('Series updated.', 'success');
      } else {
        await api.post('/creator/series', {
          title: seriesForm.title,
          description: seriesForm.description,
          tags,
          thumbnail: seriesForm.thumbnail
        });
        setSeriesMessage('Series created.');
        showToast('Series created.', 'success');
      }
      setSeriesForm({ title: '', description: '', tags: '', thumbnail: '' });
      initialSeriesForm.current = { title: '', description: '', tags: '', thumbnail: '' };
      setEditingSeriesId('');
      await loadSeries();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Series creation failed');
      showToast(err.response?.data?.error?.message || 'Series creation failed', 'error');
    } finally {
      setIsSavingSeries(false);
    }
  };

  const deleteSeriesAction = async (seriesId: string) => {
    const confirmDelete = window.confirm('Delete this series? Episodes must be removed first.');
    if (!confirmDelete) return;
    try {
      await api.delete(`/creator/series/${seriesId}`);
      showToast('Series deleted.', 'success');
      if (selectedSeriesId === seriesId) {
        setSelectedSeriesId('');
        setEpisodes([]);
      }
      await loadSeries();
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Series deletion failed';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  const createEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeriesId) {
      setError('Select a series first');
      return;
    }
    if (!episodeForm.videoId) {
      setError('Select a video to attach');
      return;
    }
    setError('');
    setEpisodeMessage('');
    setIsSavingEpisode(true);
    try {
      if (editingEpisodeId) {
        await api.put(`/creator/series/${selectedSeriesId}/episodes/${editingEpisodeId}`, {
          title: episodeForm.title,
          synopsis: episodeForm.synopsis,
          order: Number(episodeForm.order),
          releaseDate: episodeForm.releaseDate || undefined,
          video: episodeForm.videoId,
          thumbnail: episodeForm.thumbnail
        });
        setEpisodeMessage('Episode updated.');
        showToast('Episode updated.', 'success');
      } else {
        await api.post(`/creator/series/${selectedSeriesId}/episodes`, {
          title: episodeForm.title,
          synopsis: episodeForm.synopsis,
          order: Number(episodeForm.order),
          releaseDate: episodeForm.releaseDate || undefined,
          video: episodeForm.videoId,
          thumbnail: episodeForm.thumbnail
        });
        setEpisodeMessage('Episode created and sent for approval.');
        showToast('Episode created and sent for approval.', 'success');
      }
      setEpisodeForm({ title: '', synopsis: '', order: 1, videoId: '', releaseDate: '', thumbnail: '' });
      initialEpisodeForm.current = { title: '', synopsis: '', order: 1, videoId: '', releaseDate: '', thumbnail: '' };
      setEditingEpisodeId('');
      await loadEpisodes(selectedSeriesId);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Episode creation failed';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSavingEpisode(false);
    }
  };

  const deleteEpisodeAction = async (seriesId: string, episodeId: string) => {
    const confirmDelete = window.confirm('Delete this episode?');
    if (!confirmDelete) return;
    try {
      await api.delete(`/creator/series/${seriesId}/episodes/${episodeId}`);
      showToast('Episode deleted.', 'success');
      await loadEpisodes(seriesId);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Episode deletion failed';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  const deleteVideoAction = async (videoId: string) => {
    const confirmDelete = window.confirm('Delete this video? It must not be attached to any episode.');
    if (!confirmDelete) return;
    try {
      await api.delete(`/creator/videos/${videoId}`);
      showToast('Video deleted.', 'success');
      await loadVideos();
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Video deletion failed';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  const updateVideoStatusAction = async (videoId: string, status: string) => {
    try {
      await api.put(`/creator/videos/${videoId}/status`, { status });
      showToast(`Video marked ${status}.`, 'success');
      await loadVideos();
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Video status update failed';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  const formatBytes = (bytes?: number) => {
    if (bytes === undefined || bytes === null) return '--';
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };
  
  return {
    user,
    isLoading,
    canUseStudio,
    videos,
    series,
    episodes,
    videoMeta,
    seriesMeta,
    episodeMeta,
    isLoadingVideos,
    isLoadingSeries,
    isLoadingEpisodes,
    error,
    toasts,
    uploadState: {
      videoFile,
      setVideoFile,
      videoDuration,
      setVideoDuration,
      isUploading,
      uploadProgress,
      uploadVideo
    },
    seriesState: {
      seriesForm,
      setSeriesForm,
      seriesMessage,
      isSavingSeries,
      editingSeriesId,
      setEditingSeriesId,
      hasSeriesDirty,
      initialSeriesForm
    },
    episodeState: {
      episodeForm,
      setEpisodeForm,
      episodeMessage,
      isSavingEpisode,
      editingEpisodeId,
      setEditingEpisodeId,
      hasEpisodeDirty,
      initialEpisodeForm,
      selectedSeriesId,
      setSelectedSeriesId
    },
    actions: {
      loadVideos,
      loadSeries,
      loadEpisodes,
      createSeries,
      createEpisode,
      deleteSeriesAction,
      deleteEpisodeAction,
      deleteVideoAction,
      updateVideoStatusAction,
      showToast,
      setVideoPage,
      setSeriesPage,
      setEpisodePage,
      formatBytes
    }
  };
};

