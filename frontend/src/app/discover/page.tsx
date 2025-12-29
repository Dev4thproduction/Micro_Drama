'use client';

import { useEffect, useState } from 'react';
import WebAppLayout from '@/components/layout/WebAppLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Search, Filter, Flame, Clock } from 'lucide-react';
import SeriesCard from '@/components/browse/SeriesCard';

export default function DiscoverPage() {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [series, setSeries] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [activeCategory, setActiveCategory] = useState(searchParams.get('cat') || 'all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'new' | 'popular'>('new');

    // Fetch Categories on Mount
    useEffect(() => {
        api.get('/browse/home').then(res => {
            setCategories(res.data?.data?.categories || []);
        });
    }, []);

    // Fetch Results when filters change
    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (activeCategory !== 'all') params.append('category', activeCategory);
                if (searchQuery) params.append('search', searchQuery);
                params.append('sort', sortBy);

                const res = await api.get(`/browse/discover?${params.toString()}`);
                setSeries(res.data?.data ?? res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchResults, 300);
        return () => clearTimeout(debounce);
    }, [activeCategory, searchQuery, sortBy]);

    return (
        <WebAppLayout user={user} logout={logout}>
            <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 space-y-8">

                {/* HEADER & SEARCH */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 bg-[#0f1117]/95 backdrop-blur-md z-20 py-4 border-b border-white/5">
                    <h1 className="text-2xl font-bold text-white">Discover</h1>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search series, genres..."
                            className="w-full bg-[#161b22] border border-white/10 rounded-full py-2 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* FILTERS */}
                <div className="flex flex-col gap-4">
                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeCategory === 'all' ? 'bg-white text-black' : 'bg-[#161b22] text-gray-400 border border-white/5 hook:text-white'}`}
                        >
                            All
                        </button>
                        {categories.map((cat: any) => (
                            <button
                                key={cat._id}
                                onClick={() => setActiveCategory(cat.slug)}
                                className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeCategory === cat.slug ? 'bg-white text-black' : 'bg-[#161b22] text-gray-400 border border-white/5 hover:text-white'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Sorting */}
                    <div className="flex gap-4 border-b border-white/5 pb-4">
                        <button
                            onClick={() => setSortBy('new')}
                            className={`flex items-center gap-2 text-sm font-bold ${sortBy === 'new' ? 'text-primary' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Clock size={16} /> New Releases
                        </button>
                        <button
                            onClick={() => setSortBy('popular')}
                            className={`flex items-center gap-2 text-sm font-bold ${sortBy === 'popular' ? 'text-primary' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Flame size={16} /> Popular
                        </button>
                    </div>
                </div>

                {/* RESULTS GRID */}
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading...</div>
                ) : series.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20">
                        {series.map((item: any) => (
                            <SeriesCard
                                key={item._id}
                                id={item._id}
                                title={item.title}
                                posterUrl={item.posterUrl}
                                category={item.category?.name}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        No series found matching your criteria.
                    </div>
                )}

            </div>
        </WebAppLayout>
    );
}
