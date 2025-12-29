'use client';

import { useEffect, useState } from 'react';
import WebAppLayout from '@/components/layout/WebAppLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Play, Plus, Flame, Clock, Sparkles, History, Zap, Check } from 'lucide-react';
import SeriesCard from '@/components/browse/SeriesCard';
import EpisodeCard from '@/components/browse/EpisodeCard';
import Link from 'next/link';

export default function HomePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMyList, setIsMyList] = useState(false); // Helper to toggle icon state locally if needed
  const [myList, setMyList] = useState<any[]>([]);

  // Redirect logic removed to allow admins to view user home page
  // useEffect(() => {
  //   if (!isLoading && user && (user.role === 'admin' || user.role === 'creator')) {
  //     router.replace('/admin');
  //   }
  // }, [user, isLoading, router]);


  // 1. Fetch Main Home Data
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
  }, [user]);

  // 2. Fetch My List (Client Side -> Backend Bulk Fetch)
  useEffect(() => {
    const fetchMyList = async () => {
      if (typeof window === 'undefined') return;
      const listJson = localStorage.getItem('myList');
      if (!listJson) return;

      try {
        const ids = JSON.parse(listJson);
        if (Array.isArray(ids) && ids.length > 0) {
          // Fetch details for these IDs
          const res = await api.get(`/browse/discover?ids=${ids.join(',')}`);
          setMyList(res.data?.data ?? res.data);
        }
      } catch (e) {
        console.error("Failed to fetch my list", e);
      }
    };

    fetchMyList();
  }, []); // Run once on mount

  const addToMyList = (seriesId: string) => {
    if (typeof window === 'undefined') return;
    const listJson = localStorage.getItem('myList');
    let list = listJson ? JSON.parse(listJson) : [];

    if (!list.includes(seriesId)) {
      list.push(seriesId);
      localStorage.setItem('myList', JSON.stringify(list));
      setIsMyList(true);
    } else {
      list = list.filter((id: string) => id !== seriesId);
      localStorage.setItem('myList', JSON.stringify(list));
      setIsMyList(false);
    }
  };

  const isInfMyList = (seriesId: string) => {
    if (typeof window === 'undefined') return false;
    const listJson = localStorage.getItem('myList');
    const list = listJson ? JSON.parse(listJson) : [];
    return list.includes(seriesId);
  }


  if (loading) return (
    <WebAppLayout user={user} logout={logout}>
      <div className="flex items-center justify-center min-h-[50vh] text-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
          <p className="text-sm font-medium text-gray-400">Loading your lineup...</p>
        </div>
      </div>
    </WebAppLayout>
  );

  const { featured, featuredProgress, trending, newEpisodes, categories, continueWatching } = data || {};

  // Smart CTA Logic for Hero
  let heroCtaText = "Start Episode 1";
  let heroLink = featured ? `/watch/${featured._id}` : '#';

  if (featured && featuredProgress) {
    if (featuredProgress.completed) {
      heroCtaText = "Rewatch Series";
      heroLink = `/watch/${featured._id}`; // Default to Ep 1 or series page
    } else if (featuredProgress.progressSeconds > 0) {
      heroCtaText = `Continue Ep ${featuredProgress.episodeOrder}`;
      heroLink = `/watch/${featured._id}?ep=${featuredProgress.episodeId}`;
    }
  }

  return (
    <WebAppLayout user={user} logout={logout}>
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-12 pb-24">

        {/* HERO SECTION */}
        {featured && (
          <div className="relative w-full h-[450px] md:h-[550px] rounded-3xl overflow-hidden shadow-2xl group border border-white/5 mx-auto">
            <img
              src={featured.posterUrl}
              alt={featured.title}
              className="w-full h-full object-cover transform transition-transform duration-[10s] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117] via-[#0f1117]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f1117]/90 via-[#0f1117]/30 to-transparent" />

            <div className="absolute bottom-0 left-0 p-6 md:p-12 max-w-2xl space-y-5 animate-in slide-in-from-bottom-5 duration-700 fade-in">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary text-white border border-primary/20 text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles size={10} /> Brand New
                  </span>
                  <span className="text-gray-300 text-xs font-semibold px-2 py-0.5 bg-white/10 rounded-md backdrop-blur-md">
                    {featured.seasonCount || 1} Seasons
                  </span>
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-white leading-[0.9] drop-shadow-2xl tracking-tight mb-2">
                  {featured.title}
                </h1>
                {featured.category && (
                  <p className="text-primary font-medium text-sm md:text-base">{featured.category.name}</p>
                )}
              </div>

              <p className="text-gray-300 text-sm md:text-lg line-clamp-3 font-light max-w-lg leading-relaxed">
                {featured.description || "Immerse yourself in this gripping drama that everyone is talking about. Start watching now."}
              </p>

              <div className="flex gap-3 pt-2">
                <Link href={heroLink} className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm md:text-base font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-[0_0_20px_rgba(19,91,236,0.3)] hover:shadow-[0_0_30px_rgba(19,91,236,0.5)]">
                  <Play fill="currentColor" size={18} /> {heroCtaText}
                </Link>
                <button
                  onClick={() => addToMyList(featured._id)}
                  className="h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm md:text-base font-bold flex items-center gap-2 backdrop-blur-sm transition-all border border-white/10 hover:border-white/30"
                >
                  {isInfMyList(featured._id) ? <Check size={18} /> : <Plus size={18} />}
                  {isInfMyList(featured._id) ? "Added" : "My List"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 1. CONTINUE WATCHING (Priority) */}
        {continueWatching?.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white/90">
                <History size={24} className="text-primary" /> Continue Watching
              </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-6 pt-2 scrollbar-hide px-1">
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
                  progress={item.duration ? (item.progress / item.duration) * 100 : 0}
                />
              ))}
            </div>
          </section>
        )}

        {/* 2. MY LIST (Condition: Not Empty) */}
        {myList.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white/90">
                <Check size={24} className="text-green-500" /> My List
              </h2>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
              {myList.map((series: any) => (
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
        )}


        {/* 3. NEW EPISODES (Horizontal Rail) */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white/90">
              <Zap size={24} className="text-yellow-400" /> New Episodes
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1">
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

        {/* GENRES (Pills) */}
        <section>
          <div className="flex gap-3 flex-wrap">
            <button className="px-5 py-2.5 rounded-full bg-white text-black font-bold text-sm shadow-lg hover:scale-105 transition-transform">All</button>
            {categories?.map((cat: any) => (
              <button key={cat._id} className="px-5 py-2.5 rounded-full bg-[#1e2330] border border-white/5 hover:bg-white/10 hover:border-white/30 transition-all font-medium text-sm text-gray-300 hover:text-white">
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* 4. TRENDING SERIES (Vertical Posters) */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white/90">
              <Flame size={24} className="text-orange-500" /> Trending Series
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8">
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