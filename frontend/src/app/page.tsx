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
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const res = await api.get('/browse/home');
      setData(res.data?.data || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <Loader2 className="text-primary animate-spin" size={32} />
      </div>
    );
  }

  if (!data) return null;

  // Filter Logic
  // In a real app, this might trigger a fetch. Here we just filter client side for 'New' vs 'Trending' view if requested,
  // but typically "For You" is a mix.
  // Let's use the chips to scroll to section or highlight?
  // The requirement says: "Genre pills should clearly filter: New Episodes, Trending Series"
  // Let's implement simple view toggle.

  return (
    <WebAppLayout user={user} logout={logout}>
      <div className="w-full pb-20">
        {/* Hero Section */}
        {data.featured && (
          <SeriesHero
            series={data.featured}
            progress={data.featuredProgress}
          />
        )}

        <div className="max-w-[1600px] mx-auto space-y-2">

          {/* Category/Filter Pills (Sticky) */}
          <div className="sticky top-0 z-30 bg-[#0f1117]/90 backdrop-blur-md px-4 md:px-8 py-4 border-b border-white/5 flex gap-2 overflow-x-auto scrollbar-hide">
            {['All', 'Trending', 'New', 'Action', 'Romance', 'Drama'].map((tag) => (
              <button
                key={tag}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border transition-all whitespace-nowrap ${activeFilter === tag.toLowerCase() || (tag === 'All' && activeFilter === 'all') ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-white/20 hover:border-white/50 hover:text-white'}`}
                onClick={() => setActiveFilter(tag.toLowerCase())}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="pt-2">
            {/* 1. Continue Watching (Top Priority) */}
            {data.continueWatching && data.continueWatching.length > 0 && (
              <SectionRail
                title="Continue Watching"
                icon={Clock}
              >
                {data.continueWatching.map((item: any) => (
                  <RailEpisodeCard
                    key={item._id}
                    episode={item.episode}
                    series={item.series}
                    progress={item.progress}
                  />
                ))}
              </SectionRail>
            )}

            {/* 2. Because You Watched */}
            {data.becauseYouWatched && data.becauseYouWatched.items.length > 0 && (
              <SectionRail
                title={`Because you watched ${data.becauseYouWatched.sourceSeriesTitle}`}
                icon={Sparkles}
                subtitle="More series like this"
              >
                {data.becauseYouWatched.items.map((series: any) => (
                  <RailSeriesCard key={series._id} series={series} />
                ))}
              </SectionRail>
            )}

            {/* 3. Trending Series */}
            {(!activeFilter || activeFilter === 'all' || activeFilter === 'trending') && (
              <SectionRail
                title="Trending Now"
                icon={TrendingUp}
              >
                {data.trending.map((series: any) => (
                  <RailSeriesCard key={series._id} series={series} />
                ))}
              </SectionRail>
            )}

            {/* 4. New Episodes (Series) */}
            {/* Note: The newEpisodes from backend return EPISODES. 
                            Ideally standard rail shows SERIES posters. 
                            Let's map episodes to their series for the card, OR create a specific NewEpisodeCard.
                            The backend returns 'series' populated. We can use RailSeriesCard but it might look repetitive if same series has multiple new eps.
                            Let's show the Series card but maybe with a "New Ep" badge?
                            For now, strict OTT rules say "Prioritize New Episodes". 
                            I will display the SERIES associated with the new episodes.
                         */}
            {(!activeFilter || activeFilter === 'all' || activeFilter === 'new') && (
              <SectionRail
                title="New Episodes"
                icon={Zap}
              >
                {data.newEpisodes.map((ep: any) => (
                  <RailSeriesCard key={ep._id} series={ep.series} />
                ))}
              </SectionRail>
            )}

            {/* 5. Genres Rows (Dynamic) */}
            {/* If we had genre rows in data, we'd map them here. For now we rely on static sections for MVP */}

          </div>
        </div>
      </div>
    </WebAppLayout>
  );
}