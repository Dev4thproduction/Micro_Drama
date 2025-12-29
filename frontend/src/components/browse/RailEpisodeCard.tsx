'use client';

import { Play } from 'lucide-react';
import Link from 'next/link';

interface EpisodeCardProps {
    episode: any;
    series: any;
    progress: number;
}

export default function RailEpisodeCard({ episode, series, progress }: EpisodeCardProps) {
    const percentage = Math.min(100, Math.round((progress / episode.duration) * 100));

    return (
        <Link
            href={`/series/${series._id}?ep=${episode._id}`}
            className="group relative min-w-[280px] w-[280px] bg-[#161b22] rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1 snap-start"
        >
            {/* Thumbnail */}
            <div className="aspect-video relative bg-black/40">
                {episode.thumbnailUrl ? (
                    <img src={episode.thumbnailUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={episode.title} />
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
                {/* Resume Badge */}
                <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                    Resume Ep {episode.order}
                </div>
            </div>

            <div className="p-3">
                <h3 className="font-bold text-white truncate text-sm mb-1">{series.title}</h3>
                <p className="text-xs text-gray-500 truncate">{episode.title}</p>
            </div>
        </Link>
    );
}
