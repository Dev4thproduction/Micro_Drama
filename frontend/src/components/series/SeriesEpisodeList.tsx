'use client';

import { Play, Lock, Clock } from 'lucide-react';
import Link from 'next/link';

interface Episode {
    _id: string;
    order: number;
    title: string;
    duration?: number;
    thumbnailUrl: string;
    progress?: number;
    completed?: boolean;
    isFree?: boolean;
}

interface SeriesEpisodeListProps {
    seriesId: string;
    episodes: Episode[];
}

export default function SeriesEpisodeList({ seriesId, episodes }: SeriesEpisodeListProps) {

    const formatTime = (seconds: number = 0) => {
        const m = Math.floor(seconds / 60);
        return `${m}m`;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                Episodes
                <span className="text-sm font-normal text-gray-500 bg-white/5 px-2 py-0.5 rounded-md">
                    {episodes.length}
                </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {episodes.map((ep) => {
                    const isStarted = (ep.progress || 0) > 0;
                    const progressPercent = ep.duration ? Math.min(100, ((ep.progress || 0) / ep.duration) * 100) : 0;

                    return (
                        <Link
                            key={ep._id}
                            href={`/watch/${seriesId}?ep=${ep._id}`}
                            className="group flex flex-col gap-3 p-3 rounded-2xl bg-[#161b22] border border-white/5 hover:bg-[#1c222b] hover:border-white/10 transition-all hover:-translate-y-1"
                        >
                            {/* Thumbnail Container */}
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                                <img
                                    src={ep.thumbnailUrl || '/placeholder.jpg'}
                                    alt={`Episode ${ep.order}`}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />

                                {/* Progress Bar */}
                                {isStarted && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                                        <div
                                            className={`h-full ${ep.completed ? 'bg-green-500' : 'bg-primary'}`}
                                            style={{ width: `${ep.completed ? 100 : progressPercent}%` }}
                                        />
                                    </div>
                                )}

                                {/* Play Icon Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[1px]">
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                        <Play size={16} fill="currentColor" />
                                    </div>
                                </div>

                                {/* Duration Badge */}
                                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-medium text-gray-300">
                                    {formatTime(ep.duration)}
                                </div>
                            </div>

                            {/* Info */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${ep.completed ? 'text-green-500' : 'text-primary'}`}>
                                        {ep.completed ? 'Watched' : `Episode ${ep.order}`}
                                    </span>
                                    {/* {ep.isFree === false && <Lock size={12} className="text-gray-500" />} */}
                                </div>
                                <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                    {ep.title}
                                </h3>
                                <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                    {/* Mock synopsis if missing from list projection */}
                                    {/* ep.synopsis ||  */"Dramatic turn of events as the story unfolds..."}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
