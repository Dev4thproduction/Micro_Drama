'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Home, Compass, User, Film, LogOut, Menu, Clock, Bookmark } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { clsx } from 'clsx';
import { usePathname } from 'next/navigation';

interface WebAppLayoutProps {
    children: ReactNode;
    user: any;
    logout: () => void;
}

export default function WebAppLayout({ children, user, logout }: WebAppLayoutProps) {
    const pathname = usePathname();

    const NAV_ITEMS = [
        { label: 'For You', href: '/', icon: Home },
        { label: 'Continue Watching', href: '/history', icon: Clock }, // Use Clock icon
        { label: 'Discover', href: '/discover', icon: Compass },
        { label: 'Following', href: '/following', icon: Film },
        { label: 'My List', href: '/my-list', icon: Bookmark }, // Use Bookmark icon
    ];

    return (
        <div className="min-h-screen bg-[#0f1117] text-white flex">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col border-r border-white/5 bg-[#161b22] fixed inset-y-0 z-20">
                <div className="p-6 border-b border-white/5">
                    <h1 className="text-2xl font-black tracking-tight text-white">
                        <span className="text-primary">Micro</span>Drama
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
                                    isActive ? "bg-primary text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <Icon size={20} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    {user ? (
                        <div className="space-y-3">
                            <Link href="/profile" className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 rounded-xl transition-colors">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center font-bold text-xs ring-2 ring-black">
                                    {user.displayName?.[0] || user.email[0].toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold truncate">{user.displayName || 'User'}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                            </Link>
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="block w-full text-center py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold transition-colors">
                            Log In
                        </Link>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 flex justify-center">
                {children}
            </main>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black border-t border-white/10 flex items-center justify-around z-50 px-2 pb-safe">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex flex-col items-center gap-1 p-2 transition-colors",
                                isActive ? "text-white" : "text-gray-500"
                            )}
                        >
                            <Icon size={20} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
                <Link href={user ? "/profile" : "/login"} className="flex flex-col items-center gap-1 p-2 text-gray-500">
                    {user ? (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center text-[10px] font-bold text-white">
                            {user.displayName?.[0] || 'U'}
                        </div>
                    ) : (
                        <User size={20} />
                    )}
                    <span className="text-[10px] font-medium">{user ? 'Me' : 'Login'}</span>
                </Link>
            </div>
        </div>
    );
}
