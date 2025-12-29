'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import WebAppLayout from '@/components/layout/WebAppLayout';
import ProfileHeader from '@/components/profile/ProfileHeader';
import WatchHistorySection from '@/components/profile/WatchHistorySection';
import AccountSettings from '@/components/profile/AccountSettings';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user, logout, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
        } else if (user) {
            fetchProfileStats();
        }
    }, [authLoading, user, router]);

    const fetchProfileStats = async () => {
        try {
            const res = await api.get('/auth/profile/stats');
            setData(res.data?.data || res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
                <Loader2 className="text-primary animate-spin" size={32} />
            </div>
        );
    }

    if (!user || !data) return null;

    return (
        <WebAppLayout user={user} logout={logout}>
            <div className="min-h-screen px-4 py-8 md:px-8 space-y-8 max-w-7xl mx-auto">
                <ProfileHeader
                    user={data.user}
                    stats={data.stats}
                    subscription={data.subscription}
                />

                <WatchHistorySection history={data.watchHistory} />

                <AccountSettings />

                <div className="flex justify-center pt-8 border-t border-white/5">
                    <button onClick={logout} className="text-red-400 hover:text-red-300 font-medium text-sm transition-colors">
                        Sign Out of Session
                    </button>
                </div>
            </div>
        </WebAppLayout>
    );
}
