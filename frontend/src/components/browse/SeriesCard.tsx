'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';

interface SeriesCardProps {
    id: string;
    title: string;
    posterUrl: string;
    category?: string;
}

export default function SeriesCard({ id, title, posterUrl, category }: SeriesCardProps) {
    return (
        <Link href={`/series/${id}`} className="group relative block w-full aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1">
            {/* Poster Image */}
            <img
                src={posterUrl || '/placeholder-poster.jpg'}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

            {/* Play Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center text-white shadow-lg backdrop-blur-md">
                    <Play size={20} fill="currentColor" className="ml-1" />
                </div>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
                {category && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 backdrop-blur-md mb-1 inline-block">
                        {category}
                    </span>
                )}
                <h3 className="text-sm font-bold text-white leading-tight drop-shadow-md line-clamp-2 mt-1">
                    {title}
                </h3>
            </div>
        </Link>
    );
}
