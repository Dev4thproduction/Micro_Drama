'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import WebAppLayout from '@/components/layout/WebAppLayout';
import SeriesCard from '@/components/browse/SeriesCard';
import api from '@/lib/api';
import { Bookmark, Loader2, Plus, Film } from 'lucide-react';
import Link from 'next/link';

export default function MyListPage() {
    const { user, logout } = useAuth();
    const [series, setSeries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Read LocalStorage
        const storedList = localStorage.getItem('myList');
        const ids = storedList ? JSON.parse(storedList) : [];

        if (ids.length > 0) {
            fetchMyListSeries(ids);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchMyListSeries = async (ids: string[]) => {
        try {
            // Use discovery endpoint to fetch specific IDs
            const res = await api.get(`/browse/discover?ids=${ids.join(',')}`);
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
                        <Bookmark className="text-primary" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">My List</h1>
                    <span className="ml-auto text-sm text-gray-500 font-medium">
                        {series.length} Saved
                    </span>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="text-primary animate-spin" size={32} />
                    </div>
                ) : series.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                        <Bookmark size={48} className="mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold text-white mb-2"> Your List is Empty</h3>
                        <p className="max-w-xs mx-auto">Save shows you love to keep track of them here.</p>
                        <Link href="/discover" className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full font-bold text-white transition-colors">
                            Discover Series
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
