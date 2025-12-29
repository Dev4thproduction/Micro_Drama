import { User, Shield, Award, Mail, Calendar } from 'lucide-react';

interface ProfileHeaderProps {
    user: any;
    stats: any;
    subscription: any;
}

export default function ProfileHeader({ user, stats, subscription }: ProfileHeaderProps) {
    const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="relative overflow-hidden rounded-3xl bg-[#161b22] border border-white/5 shadow-2xl">
            {/* Cover Background */}
            <div className="h-48 bg-gradient-to-r from-blue-900 via-purple-900 to-primary/40 relative">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] to-transparent" />
            </div>

            <div className="px-8 pb-8 flex flex-col md:flex-row items-end md:items-center gap-6 -mt-16 md:-mt-12 relative z-10">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-full border-4 border-[#161b22] bg-gradient-to-br from-gray-800 to-black flex items-center justify-center shadow-2xl shrink-0 group hover:scale-105 transition-transform cursor-pointer">
                    <span className="text-4xl font-bold text-white group-hover:text-primary transition-colors">
                        {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </span>
                </div>

                {/* User Info */}
                <div className="flex-1 mb-2">
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-bold text-white">{user.displayName}</h1>
                        {user.role === 'admin' && (
                            <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                <Shield size={10} /> Admin
                            </span>
                        )}
                        {subscription?.plan === 'premium' && (
                            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                <Award size={10} /> Premium
                            </span>
                        )}
                    </div>
                    <p className="text-gray-400 flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1.5"><Mail size={14} /> {user.email}</span>
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> Joined {joinDate}</span>
                    </p>
                </div>

                {/* Visual Stats */}
                <div className="hidden md:flex items-center gap-4">
                    <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Episodes</p>
                        <p className="text-2xl font-bold text-white leading-none">{stats?.totalEpisodesWatched || 0}</p>
                    </div>
                    <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Plan</p>
                        <p className="text-2xl font-bold text-white leading-none capitalize">{subscription?.plan || 'Free'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
