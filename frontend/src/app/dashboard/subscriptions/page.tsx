'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { DollarSign, TrendingUp, Search, Crown, ChevronLeft, ChevronRight, Loader2, Zap } from 'lucide-react';
import { clsx } from 'clsx';

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [statsRes, subsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/subscriptions', { params: { page, search } })
        ]);
        setStats(statsRes.data.data.stats);
        setSubs(subsRes.data.data || []);
        setTotalPages(subsRes.data.meta?.totalPages || 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [page, search]);

  if (loading && page === 1) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Subscriptions & Revenue</h1>
          <p className="text-gray-400 mt-1">Manage billing and track revenue.</p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-16 bg-emerald-500/10 rounded-full blur-[40px] group-hover:bg-emerald-500/20 transition-colors"></div>
          <div className="relative z-10">
             <div className="flex justify-between mb-4">
               <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><DollarSign size={22} /></div>
               <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2 py-1 rounded-full border border-emerald-500/20">Live</span>
             </div>
             <h3 className="text-3xl font-bold text-white">${(stats.revenue || 0).toFixed(2)}</h3>
             <p className="text-sm text-gray-500">Total Revenue</p>
          </div>
        </div>
        <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
             <div className="flex justify-between mb-4">
               <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500"><TrendingUp size={22} /></div>
             </div>
             <h3 className="text-3xl font-bold text-white">{subs.filter(s => s.status === 'active').length}</h3>
             <p className="text-sm text-gray-500">Active Subscribers (This Page)</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-[#161b22] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
         <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-bold text-white">Subscriber Database</h3>
            <div className="relative group w-full md:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
               <input type="text" placeholder="Search user..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-primary/50 outline-none" />
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-black/20 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                     <th className="px-6 py-4">User</th>
                     <th className="px-6 py-4">Plan</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4">Start Date</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5 text-sm">
                  {subs.length === 0 ? <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No subscribers found.</td></tr> : subs.map((sub) => (
                     <tr key={sub._id} className="group hover:bg-white/[0.02]">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="size-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">{sub.user?.email?.[0].toUpperCase() || '?'}</div>
                              <div><div className="font-bold text-white">{sub.user?.displayName || 'Unknown'}</div><div className="text-xs text-gray-500">{sub.user?.email}</div></div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           {sub.plan === 'premium' ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Crown size={12} fill="currentColor" /> Premium</span> : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20"><Zap size={12} /> Basic</span>}
                        </td>
                        <td className="px-6 py-4"><span className={clsx("text-xs font-bold px-2 py-1 rounded-full border", sub.status === 'active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20")}>{sub.status.toUpperCase()}</span></td>
                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{new Date(sub.startDate).toLocaleDateString()}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}