import { Play, Clock } from 'lucide-react';
import Link from 'next/link';

interface WatchHistoryItem {
    _id: string;
    series: { _id: string, title: string, posterUrl: string };
    episode: { _id: string, title: string, order: number, thumbnailUrl: string, duration: number };
    progress: number;
    completed: boolean;
    lastWatched: string;
}

interface WatchHistorySectionProps {
    history: WatchHistoryItem[];
}

export default function WatchHistorySection({ history }: WatchHistorySectionProps) {
    if (!history || history.length === 0) return null;

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Clock className="text-primary" size={20} /> Continue Watching
                </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.map((item) => {
                    const percentage = Math.min(100, Math.round((item.progress / item.episode.duration) * 100));

                    return (
                        <Link
                            key={item._id}
                            href={`/series/${item.series._id}?ep=${item.episode._id}`}
                            className="group flex gap-3 bg-[#161b22] hover:bg-[#1c222b] border border-white/5 hover:border-white/10 p-3 rounded-xl transition-all"
                        >
                            {/* Thumbnail */}
                            <div className="relative w-32 aspect-video bg-black/40 rounded-lg overflow-hidden shrink-0">
                                {item.episode.thumbnailUrl ? (
                                    <img src={item.episode.thumbnailUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={item.episode.title} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                                        <Play size={20} className="text-white/20" />
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                                    <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                    <div className="p-1.5 rounded-full bg-primary text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                        <Play size={12} fill="currentColor" />
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <p className="text-xs text-primary font-semibold mb-0.5">Episode {item.episode.order}</p>
                                <h3 className="text-sm font-bold text-white truncate leading-tight mb-1">{item.series.title}</h3>
                                <p className="text-xs text-gray-500 truncate">{item.episode.title}</p>
                                <p className="text-[10px] text-gray-600 mt-2">Watched {new Date(item.lastWatched).toLocaleDateString()}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
