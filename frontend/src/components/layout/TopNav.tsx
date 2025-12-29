'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, Menu, X, LogOut, User, Bookmark } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '@/context/AuthContext';

interface TopNavProps {
    user: any;
    logout: () => void;
}

export default function TopNav({ user, logout }: TopNavProps) {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const NAV_LINKS = [
        { label: 'Home', href: '/' },
        { label: 'Series', href: '/series' },
        { label: 'Explore', href: '/explore' },
    ];

    return (
        <>
            <header
                className={clsx(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8 py-4 flex items-center justify-between",
                    isScrolled ? "bg-[#0f1117]/95 backdrop-blur-md shadow-lg py-3" : "bg-gradient-to-b from-black/80 to-transparent"
                )}
            >
                {/* Left: Logo & Desktop Nav */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="text-2xl font-black tracking-tight text-white hover:scale-105 transition-transform">
                        <span className="text-primary">Micro</span>Drama
                    </Link>

                    <nav className="hidden md:flex items-center gap-6">
                        {NAV_LINKS.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={clsx(
                                    "text-sm font-bold transition-colors hover:text-white",
                                    pathname === link.href ? "text-white" : "text-gray-400"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    {/* Search (Icon for now) */}
                    <button className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <Search size={20} />
                    </button>

                    {user ? (
                        <>
                            {/* Notifications Placeholder */}
                            <button className="hidden md:block p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                                <Bell size={20} />
                            </button>

                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 focus:outline-none"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center font-bold text-xs ring-2 ring-transparent hover:ring-white transition-all text-white">
                                        {user.displayName?.[0] || user.email[0].toUpperCase()}
                                    </div>
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#161b22] border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-4 py-2 border-b border-white/5 mb-2">
                                            <p className="text-sm font-bold text-white truncate">{user.displayName || 'User'}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>

                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <User size={16} /> Profile
                                        </Link>
                                        <Link
                                            href="/my-list"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <Bookmark size={16} /> My List
                                        </Link>

                                        <div className="h-px bg-white/5 my-2" />

                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                        >
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-full text-sm font-bold transition-all hover:scale-105"
                        >
                            Sign In
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-white"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[60] bg-[#0f1117] flex flex-col p-6 animate-in slide-in-from-right duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <span className="text-2xl font-black text-white">
                            <span className="text-primary">Micro</span>Drama
                        </span>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 bg-white/10 rounded-full text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <nav className="flex flex-col gap-4 text-lg font-bold">
                        {NAV_LINKS.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={clsx(
                                    "py-3 border-b border-white/5",
                                    pathname === link.href ? "text-primary" : "text-white"
                                )}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {user && (
                            <>
                                <Link href="/my-list" className="py-3 border-b border-white/5 text-white" onClick={() => setIsMobileMenuOpen(false)}>My List</Link>
                                <Link href="/profile" className="py-3 border-b border-white/5 text-white" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
                            </>
                        )}
                    </nav>

                    <div className="mt-auto">
                        {user ? (
                            <button
                                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                className="w-full py-3 bg-red-500/10 text-red-400 font-bold rounded-xl"
                            >
                                Sign Out
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="block w-full text-center py-3 bg-primary text-white font-bold rounded-xl"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
