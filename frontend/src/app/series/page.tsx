'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import WebAppLayout from '@/components/layout/WebAppLayout';
import SeriesCard from '@/components/browse/SeriesCard'; // Using the standard grid card
import api from '@/lib/api';
import { Film, Loader2 } from 'lucide-react';

export default function SeriesPage() {
    const { user, logout } = useAuth();
    const [series, setSeries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSeries = async () => {
            try {
                const res = await api.get('/browse/discover?sort=new');
                setSeries(res.data?.data || res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSeries();
    }, []);

    return (
        <WebAppLayout user={user} logout={logout}>
            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                        <Film className="text-primary" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">All Series</h1>
                        <p className="text-sm text-gray-400">Browse our full catalog.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="text-primary animate-spin" size={32} />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {series.map(item => (
                            <SeriesCard key={item._id} series={item} />
                        ))}
                    </div>
                )}
            </div>
        </WebAppLayout>
    );
}
