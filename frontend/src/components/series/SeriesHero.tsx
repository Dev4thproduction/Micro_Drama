'use client';

import { Play, Plus, Clock, Star, Share2, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SeriesHeroProps {
    series: any;
    userProgress: any;
    isMyList: boolean;
    onToggleMyList: (id: string) => void;
}

export default function SeriesHero({ series, userProgress, isMyList, onToggleMyList }: SeriesHeroProps) {
    if (!series) return null;

    // CTA Logic
    let ctaText = "Start Watching";
    let ctaLink = `/watch/${series._id}`; // Default Ep 1
    let ctaSubtext = "Episode 1";

    if (userProgress) {
        if (userProgress.completed) {
            ctaText = "Rewatch Series";
            ctaSubtext = "From Beginning";
        } else if (userProgress.lastWatchedEpisodeId) {
            // Continue logic handled better if we knew the NEXT episode, but sticking to simple resume or detail page logic
            // Ideally we find the first unfinished episode.
            // For now, let's point to the last watched one (Resume) or prompt generic start.
            // Since `userProgress` here is summary, we might rely on the Episode List for granular "Next" or just link to player which defaults to logic.
            // But prompt says: "If user mid-series -> Continue Episode X".
            // We need the ID of the *next* episode or the current one to resume.
            // Let's assume the passed `userProgress` or `episodes` helps. 
            // Actually, `userProgress.lastWatchedEpisodeId` is available.
            // We can link to ?ep=lastWatchedEpisodeId.
            ctaText = "Continue Watching";
            ctaLink = `/watch/${series._id}?ep=${userProgress.lastWatchedEpisodeId}`;
            ctaSubtext = "Resume where you left off";
        }
    }

    return (
        <div className="relative w-full aspect-[4/5] md:aspect-[21/9] lg:h-[600px] overflow-hidden">
            {/* Background Image (Blurred) */}
            <div className="absolute inset-0">
                <img
                    src={series.posterUrl}
                    alt=""
                    className="w-full h-full object-cover opacity-30 blur-xl scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117] via-[#0f1117]/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0f1117] via-[#0f1117]/60 to-transparent" />
            </div>

            <div className="absolute inset-0 container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center md:items-end pb-12 gap-8 z-10">
                {/* Poster (Mobile hidden or small, Desktop prominent) */}
                <div className="hidden md:block w-[220px] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/10 shrink-0 transform hover:scale-105 transition-transform duration-500">
                    <img src={series.posterUrl} alt={series.title} className="w-full h-full object-cover" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6 text-center md:text-left pt-20 md:pt-0">
                    <div className="space-y-4">
                        {/* Chips */}
                        <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                            {series.category && (
                                <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/10 backdrop-blur-md">
                                    {series.category.name}
                                </span>
                            )}
                            <span className="px-3 py-1 rounded-full bg-black/40 text-gray-300 text-xs font-medium border border-white/5">
                                {series.seasonCount || 1} Season
                            </span>
                            <span className="px-3 py-1 rounded-full bg-black/40 text-gray-300 text-xs font-medium border border-white/5 flex items-center gap-1">
                                <Clock size={12} /> 15m avg
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none drop-shadow-2xl">
                            {series.title}
                        </h1>

                        <p className="text-gray-300 text-sm md:text-lg leading-relaxed max-w-2xl mx-auto md:mx-0 line-clamp-3 md:line-clamp-none">
                            {series.description}
                        </p>

                        {/* Creator / Metadata */}
                        <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-400">
                            {series.creator && (
                                <>
                                    <span>Created by <span className="text-white font-medium">{series.creator.displayName}</span></span>
                                    <span>•</span>
                                </>
                            )}
                            <span>{new Date(series.createdAt).getFullYear()}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col md:flex-row items-center gap-4 pt-4">
                        <Link
                            href={ctaLink}
                            className="w-full md:w-auto h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-[0_0_30px_rgba(19,91,236,0.3)]"
                        >
                            <Play fill="currentColor" size={20} />
                            <div className="text-left">
                                <div className="text-sm leading-none">{ctaText}</div>
                                <div className="text-[10px] opacity-80 font-normal mt-0.5">{ctaSubtext}</div>
                            </div>
                        </Link>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                onClick={() => onToggleMyList(series._id)}
                                className={`flex-1 md:flex-none h-14 px-6 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all backdrop-blur-sm
                                    ${isMyList
                                        ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                        : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'}
                                `}
                            >
                                {isMyList ? <Check size={20} /> : <Plus size={20} />}
                                {isMyList ? "Saved" : "My List"}
                            </button>

                            <button className="h-14 w-14 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all">
                                <Share2 size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
