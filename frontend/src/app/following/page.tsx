'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import WebAppLayout from '@/components/layout/WebAppLayout';
import SeriesCard from '@/components/browse/SeriesCard';
import api from '@/lib/api';
import { Film, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function FollowingPage() {
    const { user, logout } = useAuth();
    const [series, setSeries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // "Following" maps to "My List" conceptually for this app
        const storedList = localStorage.getItem('myList');
        const ids = storedList ? JSON.parse(storedList) : [];

        if (ids.length > 0) {
            fetchFollowedSeries(ids);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchFollowedSeries = async (ids: string[]) => {
        try {
            // Fetch series, ideally we'd want to sort by 'lastUpdated' to show new content
            // We'll trust the backend returns them in order or client-side sort if needed
            const res = await api.get(`/browse/discover?ids=${ids.join(',')}`); // &sort=updated (if supported)
            setSeries(res.data?.data || res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <WebAppLayout user={user} logout={logout}>
            <div className="px-4 py-8 md:px-8 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                        <Film className="text-primary" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Following</h1>
                        <p className="text-sm text-gray-400">Updates from series you follow</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="text-primary animate-spin" size={32} />
                    </div>
                ) : series.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                        <Sparkles size={48} className="mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold text-white mb-2">No Updates Yet</h3>
                        <p className="max-w-xs mx-auto">Follow series (add to My List) to see their latest updates here.</p>
                        <Link href="/discover" className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full font-bold text-white transition-colors">
                            Discover Content
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {series.map((item) => (
                            <SeriesCard key={item._id} series={item} />
                        ))}
                    </div>
                )}
            </div>
        </WebAppLayout>
    );
}
