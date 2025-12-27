'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  BarChart3, 
  ShieldAlert, 
  Users, 
  CreditCard, 
  UserPlus, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  Zap,
  Menu,
  Home // Imported Home Icon
} from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';

const MENU_ITEMS = [
  { name: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
  { name: 'Moderation', icon: ShieldAlert, href: '/dashboard/moderation', badge: '3' },
  { name: 'User Management', icon: Users, href: '/dashboard/users' },
  { name: 'Subscriptions', icon: CreditCard, href: '/dashboard/subscriptions' },
  { name: 'Create Admin', icon: UserPlus, href: '/dashboard/create-admin' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f1117] text-white font-display selection:bg-primary/30 flex overflow-hidden">
      
      {/* ---------------- SIDEBAR ---------------- */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-72 bg-[#161b22]/80 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          
          {/* Logo Area */}
          <div className="h-20 flex items-center gap-3 px-8 border-b border-white/5">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(19,91,236,0.2)]">
              <Zap className="text-primary fill-current" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Admin Console
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Main Menu</p>
            {MENU_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                    isActive 
                      ? "bg-primary text-white shadow-[0_0_20px_rgba(19,91,236,0.4)]" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-20" />
                  )}
                  <Icon size={20} className={clsx(isActive ? "text-white" : "group-hover:text-primary transition-colors")} />
                  <span className="font-medium">{item.name}</span>
                  
                  {item.badge && (
                    <span className="ml-auto flex items-center justify-center size-5 text-[10px] font-bold bg-red-500 text-white rounded-full shadow-lg shadow-red-500/20 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* NEW: Back to Home Link */}
            <div className="mt-4 pt-4 border-t border-white/5">
               <Link 
                  href="/"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 group"
                >
                  <Home size={20} className="group-hover:text-primary transition-colors" />
                  <span className="font-medium">Back to Home</span>
                </Link>
            </div>

          </nav>

          {/* Footer User Profile */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
              <div className="size-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold ring-2 ring-[#0f1117]">
                {user?.email?.[0].toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.displayName || 'Admin User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button 
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ---------------- MAIN CONTENT WRAPPER ---------------- */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen relative">
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />


        {/* Page Content Injection */}
        <main className="flex-1 p-8 relative z-10 overflow-y-auto">
           {children}
        </main>

      </div>
    </div>
  );
}