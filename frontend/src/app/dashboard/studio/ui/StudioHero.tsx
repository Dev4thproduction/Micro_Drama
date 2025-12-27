'use client';

import Link from 'next/link';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';

type Props = {
  user: { email: string; role: string; displayName?: string } | null;
  videosCount: number;
  seriesCount: number;
};

export function StudioHero({ user, videosCount, seriesCount }: Props) {
  const heroRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.studio-hero', { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out' });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={heroRef}
      className="relative overflow-hidden rounded-[28px] studio-hero border border-white/5 bg-gradient-to-br from-[#111827] via-[#0c1220] to-[#0a0f1c] shadow-[0_30px_120px_rgba(0,0,0,0.45)] mb-10"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(93,135,255,0.15),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.12),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.15),transparent_30%)]" />
      <div className="relative p-8 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs uppercase tracking-[0.3em] text-primary">
            Creator Studio
          </div>
          <h1 className="text-4xl lg:text-5xl font-black leading-tight">
            Upload. Organize. Ship cinematic drops.
          </h1>
          <p className="text-gray-300/80 text-base max-w-2xl">
            Smooth, GSAP-powered workspace for creators. Upload videos to S3, assemble series, attach episodes, and
            handoff to admins for approval, all without leaving the browser.
          </p>
          <div className="flex gap-3 flex-wrap">
            <a
              href="#upload"
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold shadow-[0_10px_40px_rgba(19,91,236,0.35)] hover:bg-primary/90 transition-all"
            >
              Start uploading
            </a>
            <a
              href="#episodes"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold hover:border-white/30 transition-all"
            >
              Build episodes
            </a>
            <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-gray-300 flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              Lag-free UX with GSAP transitions
            </div>
          </div>
        </div>
        <div className="backdrop-blur-xl rounded-2xl border border-white/10 bg-white/5 p-5 w-full lg:w-[320px] space-y-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center font-bold">
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'C'}
            </div>
            <div>
              <div className="text-sm text-gray-400">Signed in as</div>
              <div className="font-semibold">{user?.email}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-300">
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="text-gray-400">Role</div>
              <div className="font-semibold uppercase">{user?.role}</div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="text-gray-400">Uploads</div>
              <div className="font-semibold">{videosCount}</div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="text-gray-400">Series</div>
              <div className="font-semibold">{seriesCount}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm hover:border-primary hover:text-primary transition-all">
                Home
              </div>
            </Link>
            {user?.role === 'admin' ? (
              <Link href="/dashboard">
                <div className="px-4 py-2 rounded-xl bg-primary text-sm font-semibold shadow-[0_10px_40px_rgba(19,91,236,0.35)]">
                  Admin Hub
                </div>
              </Link>
            ) : (
              <Link href="/dashboard/cms">
                <div className="px-4 py-2 rounded-xl bg-primary text-sm font-semibold shadow-[0_10px_40px_rgba(19,91,236,0.35)]">
                  Editorial CMS
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

