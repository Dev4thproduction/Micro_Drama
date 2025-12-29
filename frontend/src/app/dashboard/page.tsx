'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  Users, 
  PlayCircle, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';

interface DashboardData {
  stats: {
    totalUsers: number;
    activeCreators: number;
    pendingEpisodes: number;
    revenue: number;
  };
  urgentItems: any[];
}

export default function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/admin/stats');
        setData(res.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (error) return <div className="text-red-500 text-center p-10">{error}</div>;

  const { stats, urgentItems } = data!;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-400 mt-1">Real-time platform insights and alerts.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161b22] border border-white/5 text-xs font-medium text-gray-400">
             <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
             Live Updates On
          </div>
          <button className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-[0_0_20px_rgba(19,91,236,0.3)] transition-all hover:-translate-y-0.5">
            Generate Report
          </button>
        </div>
      </div>

      {/* KPI CARDS (Real Data) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Users", value: stats.totalUsers.toLocaleString(), trend: "Live", trendUp: true, icon: Users, color: "blue", gradient: "from-blue-500/20 to-blue-600/5" },
          { label: "Revenue (Est)", value: `$${stats.revenue.toFixed(2)}`, trend: "+8.2%", trendUp: true, icon: DollarSign, color: "emerald", gradient: "from-emerald-500/20 to-emerald-600/5" },
          { label: "Pending Reviews", value: stats.pendingEpisodes, trend: "Action Req", trendUp: false, icon: PlayCircle, color: "purple", gradient: "from-purple-500/20 to-purple-600/5" },
          { label: "Active Creators", value: stats.activeCreators, trend: "+5", trendUp: true, icon: TrendingUp, color: "orange", gradient: "from-orange-500/20 to-orange-600/5" },
        ].map((stat, i) => (
          <div key={i} className="group relative overflow-hidden rounded-2xl bg-[#161b22] border border-white/5 p-6 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-white/5 border border-white/5 text-${stat.color}-400 group-hover:bg-white/10 transition-colors`}>
                  <stat.icon size={22} />
                </div>
                <div className={clsx(
                  "flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur-md",
                  stat.trendUp 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                )}>
                  {stat.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {stat.trend}
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{stat.value}</h3>
              <p className="text-sm text-gray-500 font-medium group-hover:text-gray-400 transition-colors">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* URGENT ATTENTION (Real Pending Items) */}
      <div className="rounded-2xl bg-[#161b22] border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
               <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Urgent Attention</h3>
              <p className="text-sm text-gray-500">Recent items requiring moderation.</p>
            </div>
          </div>
          <Link href="/dashboard/moderation" className="text-primary text-sm font-bold hover:underline">
            Go to Moderation Queue &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 text-xs uppercase tracking-wider text-gray-500 font-medium">
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4">Series</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {urgentItems.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No urgent items found. Great job!</td></tr>
              ) : urgentItems.map((item: any) => (
                <tr key={item._id} className="group hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white group-hover:text-primary transition-colors">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Video Upload</div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {item.series?.title || 'Unknown Series'}
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                      <div className="size-1.5 rounded-full bg-yellow-500" /> Pending
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href="/dashboard/moderation">
                      <button className="px-3 py-1.5 rounded hover:bg-white/10 text-primary border border-white/10 transition-colors text-xs font-bold">
                        Review
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}