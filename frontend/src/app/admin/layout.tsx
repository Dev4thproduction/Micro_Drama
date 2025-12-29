'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  BarChart3,
  LogOut,
  Menu,
  Shield,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Categories', href: '/admin/categories', icon: FileText },
  { label: 'Series', href: '/admin/series', icon: FileText },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'admin') {
        router.replace('/');
      }
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const activeItem = NAV_ITEMS.find((item) =>
    item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1117] text-white">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#161b22] border border-white/10">
          <div className="size-3 rounded-full bg-primary animate-ping" />
          <span className="text-sm font-medium text-gray-300">Checking your session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-[#0f1117] text-white">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 w-72 transform bg-[#161b22]/90 backdrop-blur-xl border-r border-white/5 transition-transform duration-300',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center gap-3 px-6 border-b border-white/5">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20 shadow-[0_0_15px_rgba(19,91,236,0.2)]">
              <Zap className="text-primary" size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.08em]">
                Admin
              </p>
              <p className="text-lg font-bold leading-5">Control Center</p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200',
                    isActive
                      ? 'bg-primary text-white shadow-[0_0_18px_rgba(19,91,236,0.35)]'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon
                    size={18}
                    className={clsx(
                      isActive
                        ? 'text-white'
                        : 'text-gray-500 group-hover:text-primary transition-colors'
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/5 p-3">
              <div className="size-10 rounded-full bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center text-sm font-bold ring-2 ring-[#0f1117]">
                {user.displayName?.[0] || user.email[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {user.displayName || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-h-screen flex flex-col sm:ml-72 relative">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -top-10 left-12 h-60 w-60 rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-10 right-12 h-64 w-64 rounded-full bg-purple-600/20 blur-[140px]" />
        </div>

        <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0f1117]/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-300 transition-colors hover:text-white sm:hidden"
                onClick={() => setSidebarOpen((open) => !open)}
                aria-label="Toggle navigation"
              >
                <Menu size={20} />
              </button>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                  Admin Shell
                </p>
                <h1 className="text-lg font-semibold text-white">
                  {activeItem?.label || 'Workspace'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                <Shield size={16} className="text-primary" />
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-white">
                    {user.displayName || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-200 transition-all hover:bg-red-500/20"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="relative z-10 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
