'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import WebAppLayout from '@/components/layout/WebAppLayout';
import SectionRail from '@/components/browse/SectionRail';
import RailEpisodeCard from '@/components/browse/RailEpisodeCard'; // Reuse for updates/episodes
import RailSeriesCard from '@/components/browse/RailSeriesCard';
import api from '@/lib/api';
import { Compass, Film, TrendingUp, Sparkles, Loader2, Zap } from 'lucide-react';

export default function ExplorePage() {
    const { user, logout } = useAuth();
    const [updates, setUpdates] = useState<any[]>([]);
    const [trending, setTrending] = useState<any[]>([]);
    const [genres, setGenres] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Trending (using our new trending engine logic via browse/home or trending endpoint)
                // Let's use /browse/home data structure for simplicity or specific endpoints
                const homeRes = await api.get('/browse/home');
                const homeData = homeRes.data?.data || homeRes.data;
                setTrending(homeData.trending || []);
                setGenres(homeData.categories || []);

                // 2. Fetch Following Updates (if User)
                const storedList = localStorage.getItem('myList');
                const ids = storedList ? JSON.parse(storedList) : [];
                if (ids.length > 0) {
                    const updateRes = await api.post('/browse/following', { seriesIds: ids });
                    setUpdates(updateRes.data?.data || updateRes.data);
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
                <Loader2 className="text-primary animate-spin" size={32} />
            </div>
        );
    }

    return (
        <WebAppLayout user={user} logout={logout}>
            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-8 space-y-12">

                {/* Header */}
                <div>
                    <h1 className="text-4xl font-black text-white mb-2">Explore</h1>
                    <p className="text-gray-400">Discover your next obsession.</p>
                </div>

                {/* 1. Updates (Following) */}
                {updates.length > 0 && (
                    <SectionRail title="New For You" icon={Zap} subtitle="Updates from series you follow">
                        {updates.map(item => (
                            // Mapping updates struct (series, latestEpisode) to card props. 
                            // RailEpisodeCard expects { episode, series, progress }. 
                            // Updates result: { series, latestEpisode, isNew }
                            <RailEpisodeCard
                                key={item.series._id}
                                episode={item.latestEpisode}
                                series={item.series}
                                progress={0} // No progress for new update
                            />
                        ))}
                    </SectionRail>
                )}

                {/* 2. Genres Grid */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <Compass className="text-primary" size={24} />
                        <h2 className="text-xl font-bold text-white">Browse by Genre</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {genres.map((genre: any) => (
                            <div
                                key={genre.slug}
                                style={{ backgroundColor: genre.color || '#333' }}
                                className="aspect-[3/2] rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-lg hover:scale-105 transition-transform cursor-pointer relative overflow-hidden group"
                                onClick={() => {/* Navigate to filtered view? Or just visual for MVP */ }}
                            >
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                <span className="relative z-10">{genre.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. Trending */}
                {trending.length > 0 && (
                    <SectionRail title="Trending Now" icon={TrendingUp}>
                        {trending.map(series => (
                            <RailSeriesCard key={series._id} series={series} />
                        ))}
                    </SectionRail>
                )}

            </div>
        </WebAppLayout>
    );
}
