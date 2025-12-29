'use client';

import { useEffect, useState } from 'react';
import WebAppLayout from '@/components/layout/WebAppLayout';
import SeriesHero from '@/components/series/SeriesHero';
import SectionRail from '@/components/browse/SectionRail';
import RailEpisodeCard from '@/components/browse/RailEpisodeCard';
import RailSeriesCard from '@/components/browse/RailSeriesCard';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Loader2, Clock, Zap, TrendingUp, Sparkles, Compass } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [initialData, setInitialData] = useState<any>(null); // To keep Banner & Categories constant
  const [sectionData, setSectionData] = useState<any>(null); // For Rails (Trending, New, etc)
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchHomeData('all');
  }, []);

  const fetchHomeData = async (filter: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/browse/home?category=${filter === 'all' || filter === 'trending' ? 'all' : filter}`);
      const newData = res.data?.data || res.data;

      if (filter === 'all') {
        setInitialData(newData);
      }
      setSectionData(newData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (tag: string) => {
    const slug = tag.toLowerCase();
    setActiveFilter(slug);
    fetchHomeData(slug);
  };

  if (!initialData && loading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <Loader2 className="text-primary animate-spin" size={32} />
      </div>
    );
  }

  if (!initialData) return null;

  // Use initialData for Banner & Categories to keep them stable
  // Use sectionData for Rails
  const displayData = sectionData || initialData;

  return (
    <WebAppLayout user={user} logout={logout}>
      <div className="w-full pb-20">
        {/* Hero Section (Always Visible, Dynamic but stable across filters if desired, 
                    but here we follow backend returning it. We use initialData to prevent it flickering/changing if backend changes it on filter) 
                */}
        {initialData.featured && (
          <SeriesHero
            series={initialData.featured}
            progress={initialData.featuredProgress}
            isMyList={false} // Todo: fetch status
            onToggleMyList={() => { }}
          />
        )}

        <div className="max-w-[1600px] mx-auto space-y-2">

          {/* Category/Filter Pills (Sticky) */}
          <div className="sticky top-0 z-30 bg-[#0f1117]/90 backdrop-blur-md px-4 md:px-8 py-4 border-b border-white/5 flex gap-2 overflow-x-auto scrollbar-hide">
            {['All', 'Trending', ...initialData.categories.map((c: any) => c.name)].map((tag: string) => (
              <button
                key={tag}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border transition-all whitespace-nowrap 
                                    ${(tag === 'All' && activeFilter === 'all') || (tag.toLowerCase() === activeFilter)
                    ? 'bg-white text-black border-white scale-105'
                    : 'bg-transparent text-gray-400 border-white/20 hover:border-white/50 hover:text-white'}`}
                onClick={() => handleFilterChange(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="pt-2 min-h-[400px]">
            {loading && (
              <div className="flex justify-center py-10">
                <Loader2 className="text-primary animate-spin" size={24} />
              </div>
            )}

            {!loading && (
              <>
                {/* Filter Status Text */}
                {activeFilter !== 'all' && (
                  <div className="px-4 md:px-8 py-2">
                    <p className="text-sm text-gray-400">
                      Showing {activeFilter === 'trending' ? 'top trending' : activeFilter} series
                    </p>
                  </div>
                )}

                {/* 1. Continue Watching (Filtered if Genre active) */}
                {displayData.continueWatching && displayData.continueWatching.length > 0 && (
                  <SectionRail
                    title="Continue Watching"
                    icon={Clock}
                  >
                    {displayData.continueWatching.map((item: any) => (
                      <RailEpisodeCard
                        key={item._id}
                        episode={item.episode}
                        series={item.series}
                        progress={item.progress}
                      />
                    ))}
                  </SectionRail>
                )}

                {/* 2. Because You Watched (Only on 'All') */}
                {activeFilter === 'all' && displayData.becauseYouWatched && displayData.becauseYouWatched.items.length > 0 && (
                  <SectionRail
                    title={`Because you watched ${displayData.becauseYouWatched.sourceSeriesTitle}`}
                    icon={Sparkles}
                    subtitle="More series like this"
                  >
                    {displayData.becauseYouWatched.items.map((series: any) => (
                      <RailSeriesCard key={series._id} series={series} />
                    ))}
                  </SectionRail>
                )}

                {/* 3. Trending Series */}
                {/* If 'Trending' filter is active, this is the main view. */}
                {displayData.trending.length > 0 && (
                  <SectionRail
                    title={activeFilter === 'trending' ? "Top Trending Now" : "Trending Now"}
                    icon={TrendingUp}
                    className={activeFilter === 'trending' ? 'bg-white/5 py-10' : ''}
                  >
                    {displayData.trending.map((series: any) => (
                      <RailSeriesCard key={series._id} series={series} />
                    ))}
                  </SectionRail>
                )}

                {/* 4. New Episodes */}
                {displayData.newEpisodes.length > 0 && activeFilter !== 'trending' && (
                  <SectionRail
                    title="New Episodes"
                    icon={Zap}
                  >
                    {displayData.newEpisodes.map((ep: any) => (
                      <RailSeriesCard key={ep._id} series={ep.series} />
                    ))}
                  </SectionRail>
                )}

                {/* If nothing found */}
                {displayData.trending.length === 0 && displayData.newEpisodes.length === 0 && displayData.continueWatching.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                    <Compass size={48} className="mb-4" />
                    <p>No {activeFilter} content found.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </WebAppLayout>
  );
}