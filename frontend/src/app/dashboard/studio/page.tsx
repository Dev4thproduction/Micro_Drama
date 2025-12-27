'use client';

import { StudioHero } from './ui/StudioHero';
import { UploadPanel } from './ui/UploadPanel';
import { SeriesPanel } from './ui/SeriesPanel';
import { EpisodesPanel } from './ui/EpisodesPanel';
import { WorkflowPanel } from './ui/WorkflowPanel';
import { TipsPanel } from './ui/TipsPanel';
import { Toasts } from './ui/Toasts';
import { useStudioData } from './hooks/useStudioData';

export default function CreatorStudioPage() {
  const {
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
    uploadState,
    seriesState,
    episodeState,
    actions
  } = useStudioData();

  const videosCount = videos.length;
  const seriesCount = series.length;

  if (isLoading) {
    return <div className="min-h-screen bg-[#06070b] text-white p-10">Loading creator workspace…</div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-[#06070b] text-white p-10">Redirecting to login…</div>;
  }

  if (!canUseStudio) {
    return (
      <div className="min-h-screen bg-[#06070b] text-white p-10">
        Access restricted. Creator or admin role required.
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-6 lg:p-10 bg-[#06070b]" style={{ scrollBehavior: 'smooth' }}>
      <StudioHero user={user} videosCount={videosCount} seriesCount={seriesCount} />
      <Toasts toasts={toasts} />
      {error && (
        <div className="mb-6 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          <UploadPanel
            videos={videos}
            videoMeta={videoMeta}
            isLoading={isLoadingVideos}
            uploadState={uploadState}
            actions={actions}
          />
          <SeriesPanel
            series={series}
            seriesMeta={seriesMeta}
            isLoading={isLoadingSeries}
            seriesState={seriesState}
            episodeState={episodeState}
            actions={actions}
          />
          <EpisodesPanel
            episodes={episodes}
            episodeMeta={episodeMeta}
            isLoading={isLoadingEpisodes}
            series={series}
            videos={videos}
            episodeState={episodeState}
            actions={actions}
          />
        </div>
        <div className="space-y-4">
          <WorkflowPanel />
          <TipsPanel />
        </div>
      </div>
    </div>
  );
}
