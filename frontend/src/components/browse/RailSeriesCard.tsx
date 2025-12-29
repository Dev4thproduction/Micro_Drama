'use client';

import { Star, Play } from 'lucide-react';
import Link from 'next/link';

interface RailSeriesCardProps {
    series: any;
}

export default function RailSeriesCard({ series }: RailSeriesCardProps) {
    return (
        <Link
            href={`/series/${series._id}`}
            className="group relative min-w-[160px] w-[160px] md:min-w-[200px] md:w-[200px] snap-start"
        >
            <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[#161b22] border border-white/5 relative mb-3 transition-transform group-hover:scale-105 group-hover:shadow-xl group-hover:border-white/20">
                {series.posterUrl ? (
                    <img src={series.posterUrl} alt={series.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
                        <Play size={32} className="opacity-20 mb-2" />
                        <span className="text-xs uppercase font-bold opacity-40">No Poster</span>
                    </div>
                )}

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                <div className="absolute top-2 right-2">
                    {series.rating > 0 && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10">
                            <Star size={10} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-[10px] font-bold text-white">{series.rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                {series.category && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 backdrop-blur-md text-white border border-white/10 uppercase tracking-wide">
                        {series.category.name}
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{series.title}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span>{series.views ? series.views.toLocaleString() : 0} views</span>
                    <span>•</span>
                    <span>{series.seasonCount || 1} Seasons</span>
                </div>
            </div>
        </Link>
    );
}
