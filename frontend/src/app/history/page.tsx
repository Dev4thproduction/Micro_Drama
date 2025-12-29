'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import WebAppLayout from '@/components/layout/WebAppLayout';
import api from '@/lib/api';
import { Clock, Play, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
    const { user, logout, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login'); // History requires login mostly, or guest ID
        } else {
            fetchHistory();
        }
    }, [authLoading, user, router]);

    const fetchHistory = async () => {
        try {
            // We can reuse the profile stats endpoint as it returns sorted history
            const res = await api.get('/auth/profile/stats'); // Or /browse/home?
            setHistory(res.data?.data?.watchHistory || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
                <Loader2 className="text-primary animate-spin" size={32} />
            </div>
        );
    }

    return (
        <WebAppLayout user={user} logout={logout}>
            <div className="px-4 py-8 md:px-8 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                        <Clock className="text-primary" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Continue Watching</h1>
                </div>

                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                        <Clock size={48} className="mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold text-white mb-2">No History Yet</h3>
                        <p className="max-w-xs mx-auto">Start watching series to see your history here.</p>
                        <Link href="/" className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full font-bold text-white transition-colors">
                            Browse Series
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {history.map((item) => {
                            if (!item.series || !item.episode) return null;
                            const percentage = Math.min(100, Math.round((item.progress / item.episode.duration) * 100));

                            return (
                                <Link
                                    key={item._id}
                                    href={`/series/${item.series._id}?ep=${item.episode._id}`}
                                    className="group relative block bg-[#161b22] rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1 hover:shadow-xl"
                                >
                                    {/* Thumbnail */}
                                    <div className="aspect-video relative bg-black/40">
                                        {item.episode.thumbnailUrl ? (
                                            <img src={item.episode.thumbnailUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={item.episode.title} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Play size={32} className="text-white/20" />
                                            </div>
                                        )}
                                        {/* Progress Bar */}
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                                            <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
                                        </div>
                                        {/* Play Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                                <Play size={20} fill="currentColor" className="ml-0.5" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-4 mb-1">
                                            <h3 className="font-bold text-white truncate flex-1">{item.series.title}</h3>
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary uppercase tracking-wide shrink-0">
                                                EP {item.episode.order}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate mb-3">{item.episode.title}</p>
                                        <p className="text-[10px] text-gray-600">
                                            Watched {new Date(item.lastWatched).toLocaleDateString()}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </WebAppLayout>
    );
}
