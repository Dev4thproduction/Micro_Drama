'use client';

import { useEffect, useState, useRef } from 'react';
import VideoPlayer from '@/components/player/VideoPlayer'; // Recycled core player
import { Loader2, ChevronLeft, Layers, Share2, Heart } from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Episode {
    _id: string;
    title: string;
    synopsis: string;
    order: number;
    videoUrl: string;
    thumbnailUrl: string;
    isFree?: boolean;
}

interface SeriesPlayerProps {
    seriesId: string;
}

export default function SeriesPlayer({ seriesId }: SeriesPlayerProps) {
    const router = useRouter();
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [seriesInfo, setSeriesInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [showList, setShowList] = useState(false);

    useEffect(() => {
        const fetchEpisodes = async () => {
            try {
                const res = await api.get(`/browse/series/${seriesId}/episodes`);
                const { series, episodes } = res.data?.data ?? res.data;
                setSeriesInfo(series);
                setEpisodes(episodes || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (seriesId) fetchEpisodes();
    }, [seriesId]);

    // Observer for Scroll Snap
    useEffect(() => {
        const container = containerRef.current;
        if (!container || episodes.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute('data-index'));
                        setActiveIndex(index);
                    }
                });
            },
            { root: container, threshold: 0.6 }
        );

        container.querySelectorAll('[data-index]').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [episodes]);

    const scrollToEpisode = (index: number) => {
        setActiveIndex(index);
        const el = containerRef.current?.querySelector(`[data-index="${index}"]`);
        el?.scrollIntoView({ behavior: 'smooth' });
        setShowList(false);
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-black text-white h-screen">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col md:flex-row">

            {/* 1. MAIN PLAYER (Vertical Feed Style) */}
            <div className="flex-1 relative h-full">
                {/* Top Bar (Overlay) */}
                <div className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center gap-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                    <Link href="/" className="pointer-events-auto p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                        <ChevronLeft size={24} />
                    </Link>
                    <div className="text-white drop-shadow-md">
                        <h3 className="font-bold text-sm leading-tight">{seriesInfo?.title}</h3>
                        <p className="text-xs opacity-70">Episode {episodes[activeIndex]?.order}</p>
                    </div>
                </div>

                {/* Vertical Scroll Container */}
                <div
                    ref={containerRef}
                    className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
                >
                    {episodes.map((ep, index) => (
                        <div
                            key={ep._id}
                            data-index={index}
                            className="h-full w-full snap-start snap-always relative"
                        >
                            <VideoPlayer
                                src={ep.videoUrl}
                                poster={ep.thumbnailUrl}
                                isActive={activeIndex === index}
                                onEnded={() => {
                                    if (index < episodes.length - 1) {
                                        scrollToEpisode(index + 1);
                                    }
                                }}
                                onTimeUpdate={(currentTime) => {
                                    // Record view after 5 seconds
                                    if (activeIndex === index && currentTime > 5 && !(ep as any).viewRecorded) {
                                        (ep as any).viewRecorded = true;
                                        api.post('/analytics/view', { seriesId, episodeId: ep._id }).catch(console.error);
                                    }
                                }}
                            />

                            {/* Bottom Overlay Info */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 pt-24 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
                                <h2 className="text-xl font-bold text-white mb-2">{ep.title}</h2>
                                <p className="text-sm text-gray-200 line-clamp-2 max-w-[85%]">{ep.synopsis}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Action Bar */}
                <div className="absolute bottom-24 right-4 z-30 flex flex-col gap-6 items-center">
                    <button
                        onClick={() => setShowList(true)}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 group-hover:bg-primary transition-colors text-white">
                            <Layers size={22} />
                        </div>
                        <span className="text-[10px] font-bold text-white drop-shadow-md">Episodes</span>
                    </button>

                    <button className="flex flex-col items-center gap-1 group">
                        <div className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 group-hover:bg-red-500 transition-colors text-white">
                            <Heart size={22} />
                        </div>
                        <span className="text-[10px] font-bold text-white drop-shadow-md">Save</span>
                    </button>
                </div>
            </div>

            {/* 2. EPISODE LIST DRAWER (Mobile: Overlay, Desktop: Side Panel) */}
            {/* On desktop we can keep it always open or toggleable. For now, matching the 'Drawer' style but responsive */}
            <div className={`
           fixed inset-y-0 right-0 z-40 w-full md:w-96 bg-[#161b22] border-l border-white/5 shadow-2xl transition-transform duration-300 transform
           ${showList ? 'translate-x-0' : 'translate-x-full'}
           md:relative md:translate-x-0 md:w-80 md:block
       `}>
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <h3 className="font-bold text-white">Episodes</h3>
                        <button
                            onClick={() => setShowList(false)}
                            className="md:hidden p-2 text-gray-400 hover:text-white"
                        >
                            <ChevronLeft />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {episodes.map((ep, idx) => (
                            <button
                                key={ep._id}
                                onClick={() => scrollToEpisode(idx)}
                                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left group
                             ${activeIndex === idx ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5 border border-transparent'}
                          `}
                            >
                                <div className="relative w-24 aspect-video rounded-md overflow-hidden bg-black flex-shrink-0">
                                    <img src={ep.thumbnailUrl} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-100" />
                                    {activeIndex === idx && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-bold mb-0.5 ${activeIndex === idx ? 'text-primary' : 'text-gray-300'}`}>
                                        Episode {ep.order}
                                    </p>
                                    <p className="text-sm font-medium text-white truncate">{ep.title}</p>
                                    <p className="text-[10px] text-gray-500">{ep.videoUrl ? '15m' : ''}</p>{/* Mock duration if missing */}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
