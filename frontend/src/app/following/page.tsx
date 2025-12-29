'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import WebAppLayout from '@/components/layout/WebAppLayout';
import api from '@/lib/api';
import { Film, Loader2, Play, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function FollowingPage() {
    const { user, logout } = useAuth();
    const [updates, setUpdates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedList = localStorage.getItem('myList');
        const ids = storedList ? JSON.parse(storedList) : [];

        if (ids.length > 0) {
            fetchUpdates(ids);
        } else {
            setLoading(false);
        }
    }, [user]); // Re-fetch if user status changes (e.g. login) to check watch history

    const fetchUpdates = async (ids: string[]) => {
        try {
            const res = await api.post('/browse/following', { seriesIds: ids });
            setUpdates(res.data?.data || res.data);
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
                        <p className="text-sm text-gray-400">New episodes from series you follow</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="text-primary animate-spin" size={32} />
                    </div>
                ) : updates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center text-gray-400 bg-[#161b22] rounded-3xl border border-white/5">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 text-green-500">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">You're all caught up!</h3>
                        <p className="max-w-xs mx-auto text-sm text-gray-500">No new episodes from your followed series. We'll show them here when they drop.</p>

                        <Link href="/discover" className="mt-8 px-8 py-3 bg-primary hover:bg-primary/90 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-primary/20">
                            Find New Series
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {updates.map((item) => (
                            <Link
                                key={item.series._id}
                                href={`/series/${item.series._id}?ep=${item.latestEpisode._id}`}
                                className="group flex bg-[#161b22] border border-white/5 hover:border-primary/50 rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl"
                            >
                                {/* Poster */}
                                <div className="w-32 md:w-40 shrink-0 relative bg-black/40">
                                    <img
                                        src={item.series.posterUrl}
                                        alt={item.series.title}
                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                    />
                                    <div className="absolute top-2 left-2">
                                        <div className="px-2 py-1 rounded bg-primary text-white text-[10px] font-bold uppercase tracking-wider shadow-lg animate-pulse">
                                            New
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex flex-col justify-center flex-1">
                                    <h3 className="font-bold text-lg text-white mb-1 leading-tight group-hover:text-primary transition-colors">
                                        {item.series.title}
                                    </h3>

                                    <div className="mt-auto pt-4">
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                                            Latest Update
                                        </p>
                                        <p className="text-sm text-white font-medium truncate mb-4">
                                            Episode {item.latestEpisode.order}: {item.latestEpisode.title}
                                        </p>

                                        <button className="w-full py-2.5 rounded-lg bg-white/5 group-hover:bg-primary/20 text-white group-hover:text-primary text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all">
                                            <Play size={14} fill="currentColor" /> Watch Now
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </WebAppLayout>
    );
}
