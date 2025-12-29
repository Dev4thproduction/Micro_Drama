'use client';

import { useEffect, useState, use } from 'react';
import WebAppLayout from '@/components/layout/WebAppLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import SeriesHero from '@/components/series/SeriesHero';
import SeriesEpisodeList from '@/components/series/SeriesEpisodeList';
import { Loader2 } from 'lucide-react';

interface Params {
    id: string;
}

export default function SeriesDetailPage(props: { params: Promise<Params> }) {
    // Use `use` hook or await params as needed in Next.js 15+ (assuming Next 14/15 based on app router)
    // Props params is a Promise in latest Next.js types.
    const [unwrappedParams, setUnwrappedParams] = useState<Params | null>(null);
    const { user, logout, isLoading } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isMyList, setIsMyList] = useState(false);

    useEffect(() => {
        props.params.then(setUnwrappedParams);
    }, [props.params]);

    const seriesId = unwrappedParams?.id;

    // Fetch Series Data
    useEffect(() => {
        const fetchData = async () => {
            if (!seriesId) return;
            try {
                const res = await api.get(`/browse/series/${seriesId}`);
                setData(res.data?.data ?? res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [seriesId, user]);

    // Check My List Status
    useEffect(() => {
        if (typeof window !== 'undefined' && seriesId) {
            const listJson = localStorage.getItem('myList');
            const list = listJson ? JSON.parse(listJson) : [];
            setIsMyList(list.includes(seriesId));
        }
    }, [seriesId]);

    const toggleMyList = (id: string) => {
        if (typeof window === 'undefined') return;
        const listJson = localStorage.getItem('myList');
        let list = listJson ? JSON.parse(listJson) : [];

        if (list.includes(id)) {
            list = list.filter((item: string) => item !== id);
        } else {
            list.push(id);
        }

        localStorage.setItem('myList', JSON.stringify(list));
        setIsMyList(list.includes(id));
    };


    if (loading || !unwrappedParams) {
        return (
            <WebAppLayout user={user} logout={logout}>
                <div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
                    <Loader2 className="animate-spin text-primary" size={32} />
                </div>
            </WebAppLayout>
        );
    }

    if (!data || !data.series) {
        return (
            <WebAppLayout user={user} logout={logout}>
                <div className="min-h-screen flex items-center justify-center text-white">
                    Series not found.
                </div>
            </WebAppLayout>
        );
    }

    const { series, episodes, userProgress } = data;

    return (
        <WebAppLayout user={user} logout={logout}>
            <div className="pb-24">
                <SeriesHero
                    series={series}
                    userProgress={userProgress}
                    isMyList={isMyList}
                    onToggleMyList={toggleMyList}
                />

                <SeriesEpisodeList
                    seriesId={series._id}
                    episodes={episodes}
                />
            </div>
        </WebAppLayout>
    );
}
