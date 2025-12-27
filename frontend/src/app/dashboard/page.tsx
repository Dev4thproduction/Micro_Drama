'use client';

import { 
  Users, 
  PlayCircle, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Search
} from 'lucide-react';
import { clsx } from 'clsx';

export default function DashboardOverview() {
  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* ---------------- HEADER & ACTIONS ---------------- */}
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
          <button className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-[0_0_20px_rgba(19,91,236,0.3)] hover:shadow-[0_0_30px_rgba(19,91,236,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0">
            Generate Report
          </button>
        </div>
      </div>

      {/* ---------------- KPI CARDS (Vibrant) ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Users", value: "12,450", trend: "+12%", trendUp: true, icon: Users, color: "blue", gradient: "from-blue-500/20 to-blue-600/5" },
          { label: "Revenue", value: "$45,231", trend: "+8.2%", trendUp: true, icon: DollarSign, color: "emerald", gradient: "from-emerald-500/20 to-emerald-600/5" },
          { label: "Active Episodes", value: "1,203", trend: "+24", trendUp: true, icon: PlayCircle, color: "purple", gradient: "from-purple-500/20 to-purple-600/5" },
          { label: "Churn Rate", value: "2.4%", trend: "-0.5%", trendUp: true, icon: TrendingUp, color: "orange", gradient: "from-orange-500/20 to-orange-600/5" },
        ].map((stat, i) => (
          <div key={i} className="group relative overflow-hidden rounded-2xl bg-[#161b22] border border-white/5 p-6 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            {/* Background Gradient */}
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

      {/* ---------------- CHART & TRENDING SPLIT ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Chart Section */}
        <div className="lg:col-span-2 rounded-2xl bg-[#161b22] border border-white/5 p-6 md:p-8 relative overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-8 relative z-10">
             <div>
                <h3 className="text-lg font-bold text-white">Traffic Analytics</h3>
                <p className="text-xs text-gray-500">Unique visitors vs Page views</p>
             </div>
             <div className="flex gap-2">
               {['Day', 'Week', 'Month'].map((t, i) => (
                 <button key={t} className={clsx(
                   "px-3 py-1 rounded-lg text-xs font-medium transition-colors border",
                   i === 1 ? "bg-primary/10 text-primary border-primary/20" : "bg-transparent text-gray-500 border-transparent hover:bg-white/5 hover:text-white"
                 )}>
                   {t}
                 </button>
               ))}
             </div>
          </div>
          
          {/* Enhanced Chart Visual */}
          <div className="flex-1 flex items-end gap-2 sm:gap-4 h-64 relative z-10 px-2">
            {[35, 55, 45, 70, 60, 85, 75, 95, 65, 80, 50, 90].map((h, i) => (
               <div key={i} className="flex-1 group relative flex flex-col justify-end h-full">
                  <div 
                    style={{ height: `${h}%` }} 
                    className="w-full bg-gradient-to-t from-primary/10 via-primary/50 to-primary rounded-t-sm opacity-60 group-hover:opacity-100 transition-all duration-300 relative shadow-[0_0_10px_rgba(19,91,236,0.2)]"
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0f1117] border border-white/10 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                      {h * 150} Views
                    </div>
                  </div>
               </div>
            ))}
          </div>
          {/* Grid Lines */}
          <div className="absolute inset-0 top-24 bottom-6 px-8 flex flex-col justify-between pointer-events-none opacity-5">
             <div className="w-full h-px bg-white border-t border-dashed"></div>
             <div className="w-full h-px bg-white border-t border-dashed"></div>
             <div className="w-full h-px bg-white border-t border-dashed"></div>
          </div>
        </div>

        {/* Trending / Mini Stats */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-purple-900/20 to-[#161b22] border border-purple-500/20 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-20 bg-purple-600/20 rounded-full blur-[80px] -mr-10 -mt-10 group-hover:bg-purple-600/30 transition-colors"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <TrendingUp size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Top Performing</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">The Last Starlight</h3>
              <p className="text-sm text-gray-400 mb-4">Sci-Fi • 1.2M Views</p>
              <div className="w-full bg-black/30 rounded-full h-1.5 mb-2 overflow-hidden">
                <div className="bg-purple-500 h-full w-[85%] rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
              </div>
              <p className="text-xs text-purple-300">85% retention rate (Avg)</p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#161b22] border border-white/5 p-6">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">System Health</h3>
             <div className="space-y-4">
               {[
                 { label: 'Server Load', val: '24%', color: 'bg-emerald-500' },
                 { label: 'Storage (S3)', val: '68%', color: 'bg-blue-500' },
                 { label: 'API Latency', val: '45ms', color: 'bg-emerald-500' },
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{item.label}</span>
                    <div className="flex items-center gap-2">
                       <span className="font-mono text-white">{item.val}</span>
                       <div className={`size-2 rounded-full ${item.color} shadow-[0_0_5px_currentColor]`}></div>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* ---------------- DETAILED ACTIVITY TABLE ---------------- */}
      <div className="rounded-2xl bg-[#161b22] border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
               <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Urgent Attention</h3>
              <p className="text-sm text-gray-500">Items requiring immediate moderation.</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search logs..." 
              className="bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-gray-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none w-64 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 text-xs uppercase tracking-wider text-gray-500 font-medium">
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4">Reported User</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {[
                { title: "Love in Paris (Trailer)", type: "Video Upload", user: "anon_watcher", reason: "Copyright Infringement", date: "Aug 22, 2024", severity: "Critical", statusColor: "red" },
                { title: "Comment on 'Boss Life'", type: "User Comment", user: "sarah_j", reason: "Spam / Scam Link", date: "Aug 22, 2024", severity: "High", statusColor: "orange" },
                { title: "User: CryptoKing99", type: "Profile Report", user: "CryptoKing99", reason: "Impersonation", date: "Aug 21, 2024", severity: "Medium", statusColor: "yellow" },
                { title: "Ep 4: The Betrayal", type: "Video Upload", user: "Drama_Queen", reason: "Violent Content", date: "Aug 20, 2024", severity: "Low", statusColor: "blue" },
              ].map((row, i) => (
                <tr key={i} className="group hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white group-hover:text-primary transition-colors">{row.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{row.type}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                        {row.user[0].toUpperCase()}
                      </div>
                      <span className="text-gray-300">{row.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "font-medium", 
                      row.statusColor === 'red' ? "text-red-400" : "text-gray-400"
                    )}>
                      {row.reason}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                    {row.date}
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border",
                      row.statusColor === 'red' && "bg-red-500/10 text-red-500 border-red-500/20",
                      row.statusColor === 'orange' && "bg-orange-500/10 text-orange-500 border-orange-500/20",
                      row.statusColor === 'yellow' && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                      row.statusColor === 'blue' && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                    )}>
                      <div className={clsx("size-1.5 rounded-full", `bg-${row.statusColor}-500`)} />
                      {row.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded hover:bg-emerald-500/20 text-emerald-500 transition-colors" title="Approve/Safe">
                        <CheckCircle size={18} />
                      </button>
                      <button className="p-1.5 rounded hover:bg-red-500/20 text-red-500 transition-colors" title="Ban/Remove">
                        <XCircle size={18} />
                      </button>
                      <button className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-white/5 bg-black/20 text-center">
           <button className="text-xs font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-wider">
             View All Moderation Queue
           </button>
        </div>
      </div>

    </div>
  );
}