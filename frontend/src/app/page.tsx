'use client';

import { useEffect, useState } from 'react';
import WebAppLayout from '@/components/layout/WebAppLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Play, Plus, Flame, Clock, Sparkles, History, Zap } from 'lucide-react';
import SeriesCard from '@/components/browse/SeriesCard';
import EpisodeCard from '@/components/browse/EpisodeCard';
import Link from 'next/link';

export default function HomePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Redirect admin/creators to dashboard
  useEffect(() => {
    if (!isLoading && user && (user.role === 'admin' || user.role === 'creator')) {
      router.replace('/admin');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/browse/home');
        setData(res.data?.data ?? res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]); // Re-fetch on login status change

  if (loading) return null;

  const { featured, trending, newEpisodes, categories, continueWatching } = data || {};

  return (
    <WebAppLayout user={user} logout={logout}>
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-12 pb-24">

        {/* HERO SECTION */}
        {featured && (
          <div className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl group border border-white/5">
            <img
              src={featured.posterUrl}
              alt={featured.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117] via-[#0f1117]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f1117]/90 via-[#0f1117]/40 to-transparent" />

            <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-2xl space-y-4">
              <div>
                <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md bg-primary/20 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Sparkles size={10} /> Brand New
                </span>
                <h1 className="text-3xl md:text-5xl font-black text-white leading-none drop-shadow-2xl">
                  {featured.title}
                </h1>
              </div>

              <p className="text-gray-300 text-sm md:text-base line-clamp-2 md:line-clamp-3 font-light max-w-lg">
                {featured.description || "The most anticipate series of the month."}
              </p>

              <div className="flex gap-3 pt-2">
                <Link href={`/watch/${featured._id}`} className="h-10 px-6 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-[0_0_20px_rgba(19,91,236,0.2)]">
                  <Play fill="currentColor" size={16} /> Play Now
                </Link>
                <button className="h-10 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-bold flex items-center gap-2 backdrop-blur-sm transition-all border border-white/10">
                  <Plus size={16} /> List
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 1. CONTINUE WATCHING (Only if logged in & has history) */}
        {continueWatching?.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <History size={20} className="text-purple-400" /> Continue Watching
              </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {continueWatching.map((item: any) => (
                <EpisodeCard
                  key={item._id}
                  seriesId={item.series._id}
                  seriesTitle={item.series.title}
                  episodeId={item.episode._id}
                  episodeNumber={item.episode.order}
                  thumbnailUrl={item.episode.thumbnailUrl}
                  duration={item.episode.duration}
                  title={item.episode.title}
                />
              ))}
            </div>
          </section>
        )}

        {/* 2. GENRES (Pills) */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4">Browse by Genre</h2>
          <div className="flex gap-3 flex-wrap">
            <button className="px-4 py-2 rounded-lg bg-white text-black font-bold text-sm">All</button>
            {categories?.map((cat: any) => (
              <button key={cat._id} className="px-4 py-2 rounded-lg bg-[#161b22] border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all font-medium text-sm text-gray-300 hover:text-white">
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* 3. NEW EPISODES (Horizontal Rail) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <Zap size={20} className="text-yellow-400" /> New Episodes
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {newEpisodes?.map((ep: any) => (
              <EpisodeCard
                key={ep._id}
                seriesId={ep.series._id}
                seriesTitle={ep.series.title}
                episodeId={ep._id}
                episodeNumber={ep.order}
                thumbnailUrl={ep.thumbnailUrl}
                duration={ep.duration}
                title={ep.title}
              />
            ))}
          </div>
        </section>

        {/* 4. TRENDING SERIES (Vertical Posters) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <Flame size={20} className="text-orange-500" /> Trending Series
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trending?.map((series: any) => (
              <SeriesCard
                key={series._id}
                id={series._id}
                title={series.title}
                posterUrl={series.posterUrl}
                category={series.category?.name}
              />
            ))}
          </div>
        </section>

      </div>
    </WebAppLayout>
  );
}