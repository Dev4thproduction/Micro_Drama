'use client';

import { useEffect, useState, useRef } from 'react';
import VideoPlayer from '@/components/player/VideoPlayer';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface FeedItem {
    _id: string;
    videoUrl: string;
    thumbnailUrl: string;
    title: string;
    series: {
        _id: string;
        title: string;
        posterUrl: string;
    };
}

export default function VideoFeed() {
    const [items, setItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchFeed();
    }, []);

    const fetchFeed = async () => {
        try {
            setLoading(true);
            const res = await api.get('/feed?limit=10');
            const data = res.data?.data ?? res.data;
            if (Array.isArray(data)) {
                setItems(data);
            }
        } catch (err) {
            console.error('Failed to load feed', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle Scroll Snap Intersection
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute('data-index'));
                        setActiveIndex(index);
                    }
                });
            },
            {
                root: container,
                threshold: 0.6 // 60% visibility needed to activate
            }
        );

        const children = container.querySelectorAll('[data-index]');
        children.forEach((child) => observer.observe(child));

        return () => observer.disconnect();
    }, [items]); // Re-observe when items change

    if (loading && items.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-white">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black text-white"
        >
            {items.map((item, index) => (
                <div
                    key={item._id}
                    data-index={index}
                    className="h-full w-full snap-start snap-always relative"
                >
                    {/* Main Player */}
                    <VideoPlayer
                        src={item.videoUrl}
                        poster={item.thumbnailUrl}
                        isActive={activeIndex === index}
                        onEnded={() => {
                            // Auto scroll to next if possible
                            if (index < items.length - 1) {
                                const nextEl = containerRef.current?.querySelector(`[data-index="${index + 1}"]`);
                                nextEl?.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                    />

                    {/* Overlay Info */}
                    <div className="absolute bottom-4 left-4 right-16 z-10 pointer-events-none">
                        <div className="flex items-end gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden bg-gray-800">
                                {item.series.posterUrl && (
                                    <img src={item.series.posterUrl} alt={item.series.title} className="w-full h-full object-cover" />
                                )}
                            </div>
                            <div className="pb-1">
                                <h3 className="font-bold text-white drop-shadow-md text-sm">{item.series.title}</h3>
                            </div>
                        </div>

                        <p className="text-sm text-gray-100 line-clamp-2 drop-shadow-md">
                            <span className="font-semibold">{item.title}</span>
                            <span className="mx-2 opacity-60">|</span>
                            Episode {item.order ?? 1}
                        </p>
                    </div>

                    {/* Right Action Bar (Mock) */}
                    <div className="absolute bottom-8 right-2 flex flex-col items-center gap-6 z-20">
                        {/* Like */}
                        <div className="flex flex-col items-center gap-1">
                            <div className="p-2 rounded-full bg-black/40 backdrop-blur-sm">
                                <span className="text-xl">❤️</span>
                            </div>
                            <span className="text-xs font-bold drop-shadow-md">8.2k</span>
                        </div>
                        {/* Share */}
                        <div className="flex flex-col items-center gap-1">
                            <div className="p-2 rounded-full bg-black/40 backdrop-blur-sm">
                                <span className="text-xl">↗️</span>
                            </div>
                            <span className="text-xs font-bold drop-shadow-md">Share</span>
                        </div>
                    </div>
                </div>
            ))}

            {items.length === 0 && !loading && (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No videos found in feed.</p>
                </div>
            )}
        </div>
    );
}
