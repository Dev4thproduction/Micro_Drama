'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  Search, Menu, Zap, Play, Bookmark, Flame, Clock, 
  ChevronRight, Mail, Twitter, Instagram, Globe, 
  Sparkles, TrendingUp, LogOut, LayoutDashboard, Settings, User
} from 'lucide-react';
import { clsx } from 'clsx';
import { useState, useRef, useEffect } from 'react';

export default function HomePage() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1117] text-white font-display selection:bg-primary/30 overflow-x-hidden">
      
      {/* ---------------- NAVIGATION ---------------- */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0f1117]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20 transition-all duration-300 group-hover:bg-primary/20 group-hover:shadow-[0_0_15px_rgba(19,91,236,0.3)]">
                <Zap className="text-primary fill-current group-hover:scale-110 transition-transform" size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Micro-Drama
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
              {['Browse', 'Genres', 'Creators'].map((item) => (
                <Link 
                  key={item} 
                  href="#" 
                  className="px-4 py-1.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>

          {/* Search & Auth */}
          <div className="flex flex-1 justify-end items-center gap-4">
            <div className="hidden sm:flex relative w-full max-w-xs group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                <Search size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Search stories..." 
                className="block w-full rounded-xl border border-gray-800 bg-[#161b22] py-2.5 pl-10 pr-3 text-sm placeholder:text-gray-500 focus:border-primary focus:ring-1 focus:ring-primary focus:bg-[#0f1117] transition-all outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* DYNAMIC AUTH BUTTONS */}
              {user ? (
                <div className="relative" ref={profileRef}>
                   <button 
                     onClick={() => setIsProfileOpen(!isProfileOpen)}
                     className="flex items-center gap-3 pl-2 py-1 pr-1 border-l border-white/10 hover:bg-white/5 rounded-r-xl transition-colors"
                   >
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-white leading-none">{user.displayName || 'User'}</p>
                        <p className="text-[10px] text-gray-500 leading-none mt-1 uppercase">{user.role}</p>
                      </div>
                      <div className="size-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold ring-2 ring-[#0f1117] cursor-pointer hover:ring-primary transition-all">
                        {user.displayName?.[0] || user.email[0].toUpperCase()}
                      </div>
                   </button>

                   {/* DROPDOWN MENU */}
                   {isProfileOpen && (
                     <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#161b22] border border-white/10 shadow-2xl overflow-hidden animate-fade-in z-50">
                        <div className="p-3 border-b border-white/5 bg-white/5">
                           <p className="text-sm font-bold text-white truncate">{user.displayName}</p>
                           <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        <div className="p-1">
                          {user.role === 'admin' && (
                             <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-primary hover:text-white rounded-lg transition-colors">
                               <LayoutDashboard size={16} /> Dashboard
                             </Link>
                          )}
                          <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-primary hover:text-white rounded-lg transition-colors">
                             <Settings size={16} /> Settings
                          </Link>
                        </div>
                        <div className="p-1 border-t border-white/5">
                           <button 
                             onClick={logout}
                             className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
                           >
                             <LogOut size={16} /> Sign Out
                           </button>
                        </div>
                     </div>
                   )}
                </div>
              ) : (
                /* GUEST VIEW */
                <Link href="/login">
                  <button className="hidden sm:flex h-10 px-6 items-center justify-center rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all shadow-[0_0_15px_rgba(19,91,236,0.3)] hover:shadow-[0_0_25px_rgba(19,91,236,0.5)] hover:-translate-y-0.5 active:translate-y-0">
                    Log In
                  </button>
                </Link>
              )}

              <button 
                className="sm:hidden p-2 text-gray-400 hover:text-white"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">

        {/* ---------------- HERO SECTION ---------------- */}
        <section className="relative w-full overflow-hidden rounded-[2rem] bg-[#161b22] border border-white/5 shadow-2xl group isolate">
          {/* Animated Glow Background */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow z-0"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse-slow z-0 [animation-delay:2s]"></div>

          <div className="flex flex-col lg:flex-row min-h-[550px] relative z-10">
            
            {/* Content Side */}
            <div className="flex-1 p-8 sm:p-12 lg:p-16 flex flex-col justify-center gap-8 relative z-20">
              <div className="flex items-center gap-3 animate-fade-in">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/20 shadow-[0_0_10px_rgba(19,91,236,0.2)]">
                  <Sparkles size={12} className="fill-current" /> Story of the Day
                </span>
              </div>

              <div className="space-y-6 animate-fade-in [animation-delay:100ms]">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tighter text-white drop-shadow-2xl">
                  The Last <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                    Starlight
                  </span>
                </h1>
                <p className="text-lg text-gray-300/80 max-w-lg leading-relaxed font-light border-l-2 border-primary/30 pl-4">
                  A journey into the unknown depths of the cosmos. When the final star begins to fade, one pilot must race against time itself.
                </p>
                
                {/* Author Metadata */}
                <div className="flex items-center gap-4 text-sm text-gray-400 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm">
                  <span className="flex items-center gap-2 text-white font-medium">
                    <div className="size-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 ring-2 ring-[#0f1117]" />
                    Elena Fisher
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                  <span>15 min read</span>
                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                  <span className="text-primary font-bold tracking-wide uppercase text-xs">Sci-Fi</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2 animate-fade-in [animation-delay:200ms]">
                <button className="h-14 px-8 rounded-2xl bg-white text-black font-bold hover:bg-gray-100 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 group/btn">
                  <div className="bg-black text-white rounded-full p-1 group-hover/btn:rotate-12 transition-transform">
                     <Play size={16} fill="currentColor" />
                  </div>
                  Start Watching
                </button>
                <button className="size-14 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 hover:border-white/20">
                  <Bookmark size={22} />
                </button>
              </div>
            </div>

            {/* Image Side (Cinematic Background) */}
            <div className="absolute inset-0 lg:static lg:w-[55%] bg-cover bg-center mask-image-hero" 
                 style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2694&auto=format&fit=crop")' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-[#161b22]/90 to-transparent lg:bg-gradient-to-l lg:via-[#161b22] lg:to-transparent"></div>
              <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
            </div>
          </div>
        </section>

        {/* ---------------- TRENDING SECTION ---------------- */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                <Flame size={24} fill="currentColor" />
              </div>
              Trending Now
            </h2>
            <Link href="#" className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1 group">
              View All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {/* Mock Data for Cards */}
            {[
              { title: "The Echo", author: "J. Doe", time: "10m", img: "https://images.unsplash.com/photo-1518544806352-a1c431658085?q=80&w=600&auto=format&fit=crop", cat: "Thriller" },
              { title: "Silent Hill", author: "A. Smith", time: "20m", img: "https://images.unsplash.com/photo-1481018085669-2bc6e6f00499?q=80&w=600&auto=format&fit=crop", cat: "Horror" },
              { title: "Neon City", author: "K. Lee", time: "12m", img: "https://images.unsplash.com/photo-1574365736791-c91834e554b7?q=80&w=600&auto=format&fit=crop", cat: "Cyberpunk" },
              { title: "Dust", author: "M. Roy", time: "8m", img: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=600&auto=format&fit=crop", cat: "Dystopian" },
              { title: "Orbit", author: "S. Jay", time: "15m", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop", cat: "Sci-Fi" },
            ].map((story, i) => (
              <div key={i} className="group cursor-pointer space-y-4">
                <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/5 shadow-2xl group-hover:shadow-primary/20 transition-all duration-300 group-hover:-translate-y-2">
                  <div 
                    className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url("${story.img}")` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  
                  {/* Floating Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                      {story.cat}
                    </span>
                  </div>

                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                    <div className="size-14 rounded-full bg-primary/90 backdrop-blur-md flex items-center justify-center text-white shadow-[0_0_30px_rgba(19,91,236,0.6)] scale-50 group-hover:scale-100 transition-transform duration-300">
                       <Play fill="currentColor" size={24} className="ml-1" />
                    </div>
                  </div>
                </div>
                
                <div className="px-1">
                  <h3 className="font-bold text-lg leading-tight text-gray-100 group-hover:text-primary transition-colors line-clamp-1">{story.title}</h3>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                       <div className="size-5 rounded-full bg-gray-700" />
                       <span>{story.author}</span>
                    </div>
                    <span className="flex items-center gap-1 bg-[#1c2128] px-2 py-0.5 rounded text-gray-400">
                      <Clock size={10} /> {story.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="mt-24 border-t border-white/5 bg-[#0b0d11]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 text-sm text-gray-600">
            <p>© 2025 Micro-Drama Inc. All rights reserved.</p>
            <div className="flex gap-6">
              {[Globe, Twitter, Instagram, Mail].map((Icon, i) => (
                <a key={i} href="#" className="hover:text-white hover:scale-110 transition-all p-2 hover:bg-white/5 rounded-lg">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}