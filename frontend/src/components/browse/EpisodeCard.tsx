'use client';

import Link from 'next/link';
import { Play, Clock } from 'lucide-react';

interface EpisodeCardProps {
    seriesId: string;
    seriesTitle: string;
    episodeId: string;
    episodeNumber: number;
    thumbnailUrl: string;
    duration?: number;
    title?: string;
    progress?: number; // percent 0-100
}

export default function EpisodeCard({ seriesId, seriesTitle, episodeId, episodeNumber, thumbnailUrl, duration, title, progress }: EpisodeCardProps) {
    // Format duration (seconds to MM:SS)
    const formatTime = (seconds?: number) => {
        if (!seconds) return '00:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <Link href={`/watch/${seriesId}?ep=${episodeId}`} className="group relative block min-w-[200px] w-[200px] rounded-lg overflow-hidden bg-gray-900 shadow-md hover:shadow-primary/20 transition-all hover:-translate-y-1">
            {/* Thumbnail */}
            <div className="relative aspect-video w-full overflow-hidden bg-gray-800">
                <img
                    src={thumbnailUrl || '/placeholder-thumb.jpg'}
                    alt={`Ep ${episodeNumber}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                />

                {/* Progress Bar (Bottom) */}
                {progress !== undefined && progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                        <div
                            className="h-full bg-primary"
                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                        />
                    </div>
                )}

                {/* Play Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
                        <Play size={16} fill="white" className="text-white" />
                    </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono font-medium text-gray-300">
                    {formatTime(duration)}
                </div>
            </div>

            {/* Info */}
            <div className="p-3">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-0.5 line-clamp-1">
                    {seriesTitle}
                </h4>
                <p className="text-sm font-semibold text-white leading-tight mb-1">
                    Episode {episodeNumber}
                </p>
                {title && <p className="text-xs text-gray-500 line-clamp-1">{title}</p>}
            </div>
        </Link>
    );
}
