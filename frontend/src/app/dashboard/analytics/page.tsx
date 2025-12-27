'use client';

import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Calendar, 
  ArrowUpRight,
  Filter,
  Download
} from 'lucide-react';
import { clsx } from 'clsx';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <BarChart3 className="text-primary" /> Platform Analytics
          </h1>
          <p className="text-gray-400 mt-1">Deep dive into user behavior and content performance.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-3 py-2 bg-[#161b22] border border-white/5 rounded-xl text-sm text-gray-400">
             <Calendar size={16} />
             <span>Last 30 Days</span>
           </div>
           <button className="p-2 bg-[#161b22] hover:bg-white/5 border border-white/5 rounded-xl text-white transition-colors">
             <Filter size={18} />
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all">
             <Download size={18} />
             Export Data
           </button>
        </div>
      </div>

      {/* ---------------- SECTION 1: USER RETENTION (Bar Chart) ---------------- */}
      <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6 md:p-8 relative overflow-hidden group">
        {/* Glow Effect */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] group-hover:bg-purple-500/20 transition-colors"></div>
        
        <div className="flex justify-between items-end mb-8 relative z-10">
          <div>
            <h3 className="text-lg font-bold text-white">User Retention</h3>
            <p className="text-sm text-gray-500">Return rate over 30 days</p>
          </div>
          <div className="text-right">
             <div className="text-2xl font-bold text-white">68.4%</div>
             <div className="text-xs text-emerald-400 font-bold flex items-center justify-end gap-1">
               <TrendingUp size={12} /> +2.1% vs last month
             </div>
          </div>
        </div>

        {/* CSS Bar Chart */}
        <div className="h-64 flex items-end justify-between gap-2 md:gap-4 relative z-10">
           {/* Y-Axis Grid (Implicit) */}
           <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
             <div className="w-full h-px bg-white border-t border-dashed"></div>
             <div className="w-full h-px bg-white border-t border-dashed"></div>
             <div className="w-full h-px bg-white border-t border-dashed"></div>
             <div className="w-full h-px bg-white border-t border-dashed"></div>
           </div>

           {[
             { label: 'Day 1', val: 95, color: 'bg-purple-500' },
             { label: 'Day 3', val: 82, color: 'bg-purple-500' },
             { label: 'Day 7', val: 65, color: 'bg-purple-500' },
             { label: 'Day 14', val: 45, color: 'bg-blue-500' },
             { label: 'Day 21', val: 30, color: 'bg-blue-500' },
             { label: 'Day 30', val: 24, color: 'bg-cyan-500' },
           ].map((bar, i) => (
             <div key={i} className="flex-1 flex flex-col justify-end group/bar h-full">
                <div className="relative w-full flex-1 flex items-end">
                   <div 
                     style={{ height: `${bar.val}%` }} 
                     className={clsx(
                       "w-full rounded-t-sm opacity-80 group-hover/bar:opacity-100 transition-all duration-500 relative shadow-[0_0_15px_rgba(0,0,0,0.3)]",
                       bar.color
                     )}
                   >
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
                        {bar.val}% Retained
                     </div>
                   </div>
                </div>
                <div className="text-center mt-3 text-xs font-medium text-gray-500 group-hover/bar:text-white transition-colors">
                  {bar.label}
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ---------------- SECTION 2: CONTENT PERFORMANCE (Pie Visual) ---------------- */}
        <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col">
           <h3 className="text-lg font-bold text-white mb-6">Most Watched Genres</h3>
           
           <div className="flex flex-col md:flex-row items-center gap-8 flex-1">
              {/* CSS Conic Gradient Pie Chart */}
              <div className="relative size-48 rounded-full shrink-0 group">
                 <div 
                   className="absolute inset-0 rounded-full opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                   style={{
                     background: `conic-gradient(
                       #3b82f6 0% 35%,   /* Sci-Fi - 35% */
                       #a855f7 35% 60%,  /* Romance - 25% */
                       #06b6d4 60% 80%,  /* Thriller - 20% */
                       #10b981 80% 100%  /* Comedy - 20% */
                     )`
                   }}
                 ></div>
                 {/* Inner Hole for Donut Effect */}
                 <div className="absolute inset-4 bg-[#161b22] rounded-full flex items-center justify-center flex-col">
                    <span className="text-gray-400 text-xs uppercase tracking-wider font-medium">Total</span>
                    <span className="text-2xl font-bold text-white">1.2M</span>
                 </div>
              </div>

              {/* Legend */}
              <div className="space-y-3 w-full">
                {[
                  { label: "Sci-Fi", pct: "35%", color: "bg-blue-500" },
                  { label: "Romance", pct: "25%", color: "bg-purple-500" },
                  { label: "Thriller", pct: "20%", color: "bg-cyan-500" },
                  { label: "Comedy", pct: "20%", color: "bg-emerald-500" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-default">
                     <div className="flex items-center gap-3">
                        <div className={`size-3 rounded-full ${item.color} shadow-[0_0_8px_currentColor]`}></div>
                        <span className="text-sm font-medium text-gray-300">{item.label}</span>
                     </div>
                     <span className="text-sm font-bold text-white">{item.pct}</span>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* ---------------- SECTION 3: PEAK USAGE (Heatmap Bars) ---------------- */}
        <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6 md:p-8">
           <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Peak Usage Times</h3>
                <p className="text-sm text-gray-500">Activity by hour (UTC)</p>
              </div>
              <div className="p-2 bg-white/5 rounded-lg">
                <Clock size={20} className="text-primary" />
              </div>
           </div>

           <div className="flex items-end gap-1 h-48 pt-4">
              {/* Generate 24 bars randomly for demo */}
              {[10, 15, 8, 5, 3, 2, 5, 12, 25, 45, 60, 75, 85, 90, 95, 80, 70, 65, 85, 95, 70, 50, 30, 20].map((h, i) => {
                 // Color logic based on height (intensity)
                 const isPeak = h > 80;
                 const isHigh = h > 50 && h <= 80;
                 return (
                   <div key={i} className="flex-1 group relative h-full flex items-end">
                      <div 
                        style={{ height: `${h}%` }}
                        className={clsx(
                          "w-full rounded-sm transition-all duration-300 hover:scale-x-150",
                          isPeak ? "bg-primary shadow-[0_0_10px_rgba(19,91,236,0.5)]" : 
                          isHigh ? "bg-purple-500/60" : "bg-white/10"
                        )}
                      ></div>
                      {/* Tooltip */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap border border-white/10">
                        {i}:00 • {h}% Load
                      </div>
                   </div>
                 )
              })}
           </div>
           
           <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-mono uppercase">
              <span>00:00</span>
              <span>12:00</span>
              <span>23:00</span>
           </div>
        </div>

      </div>
    </div>
  );
}