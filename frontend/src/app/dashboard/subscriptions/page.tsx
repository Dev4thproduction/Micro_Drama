'use client';

import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  UserX, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  CreditCard,
  Crown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';

export default function SubscriptionsPage() {
  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <CreditCard className="text-primary" /> Subscriptions & Revenue
          </h1>
          <p className="text-gray-400 mt-1">Manage billing plans, track revenue, and resolve payment issues.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border border-white/5 hover:bg-white/5 text-white rounded-xl transition-all text-sm font-medium">
             <Download size={16} />
             Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all text-sm font-bold shadow-lg shadow-primary/20">
             <DollarSign size={16} />
             Update Pricing
          </button>
        </div>
      </div>

      {/* ---------------- REVENUE STATS ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Monthly Revenue", val: "$12,450", trend: "+12%", trendUp: true, icon: DollarSign, color: "emerald" },
          { label: "Weekly Revenue", val: "$3,240", trend: "-5%", trendUp: false, icon: TrendingUp, color: "purple" },
          { label: "Churn Rate", val: "2.4%", trend: "+0.2%", trendUp: false, icon: UserX, color: "red" }, // Trend up on churn is bad
        ].map((stat, i) => (
          <div key={i} className="group relative overflow-hidden rounded-2xl bg-[#161b22] border border-white/5 p-6 hover:border-white/10 transition-all hover:-translate-y-1 hover:shadow-2xl">
            {/* Ambient Glow */}
            <div className={`absolute -top-10 -right-10 size-32 rounded-full bg-${stat.color}-500/10 blur-[50px] group-hover:bg-${stat.color}-500/20 transition-colors`}></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                 <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500 border border-${stat.color}-500/20`}>
                    <stat.icon size={22} />
                 </div>
                 <div className={clsx(
                   "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border",
                   stat.trendUp 
                     ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                     : "bg-red-500/10 text-red-400 border-red-500/20"
                 )}>
                   {stat.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                   {stat.trend}
                 </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{stat.val}</h3>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- RISK ZONE: ACCOUNTS ON HOLD ---------------- */}
      <div className="rounded-2xl bg-red-950/10 border border-red-500/20 overflow-hidden relative">
         <div className="absolute top-0 right-0 p-20 bg-red-600/5 rounded-full blur-[80px]"></div>
         
         <div className="p-6 border-b border-red-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-red-500/10 rounded-lg text-red-500 animate-pulse">
                  <AlertCircle size={20} />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-white">Accounts on Hold</h3>
                  <p className="text-sm text-red-400/70">Payment failed for <span className="font-bold text-white">3 users</span>. Action required.</p>
               </div>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-red-950/20 text-xs uppercase tracking-wider text-red-400/60 font-semibold border-y border-red-500/10">
                     <th className="px-6 py-4">User</th>
                     <th className="px-6 py-4">Plan</th>
                     <th className="px-6 py-4">Amount</th>
                     <th className="px-6 py-4">Due Date</th>
                     <th className="px-6 py-4 text-right">Quick Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-red-500/10 text-sm">
                  {[
                     { name: "John Wick", email: "john@continental.com", plan: "Premium", amt: "$14.99", due: "2 Days Ago" },
                     { name: "Tony Stark", email: "iron@man.com", plan: "Basic", amt: "$9.99", due: "Yesterday" },
                     { name: "Bruce Wayne", email: "bat@man.com", plan: "Premium", amt: "$14.99", due: "Today" },
                  ].map((user, i) => (
                     <tr key={i} className="group hover:bg-red-500/5 transition-colors">
                        <td className="px-6 py-4">
                           <div className="font-bold text-red-100">{user.name}</div>
                           <div className="text-xs text-red-400/60">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 text-red-200">{user.plan}</td>
                        <td className="px-6 py-4 font-mono text-red-200">{user.amt}</td>
                        <td className="px-6 py-4 text-red-300 font-bold">{user.due}</td>
                        <td className="px-6 py-4 text-right">
                           <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors shadow-lg shadow-red-500/20">
                              <RefreshCw size={12} /> Retry Payment
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* ---------------- SUBSCRIBER DATABASE ---------------- */}
      <div className="bg-[#161b22] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
         
         <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-bold text-white">Subscriber Database</h3>
            
            <div className="flex w-full md:w-auto gap-3">
               <div className="relative group flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={16} />
                  <input 
                     type="text" 
                     placeholder="Search subscribers..." 
                     className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-gray-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                  />
               </div>
               <button className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                  <Filter size={18} />
               </button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-black/20 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                     <th className="px-6 py-4">User Details</th>
                     <th className="px-6 py-4">Plan</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4">Next Billing</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5 text-sm">
                  {[
                     { name: "Sarah Jenkins", email: "sarah.j@example.com", plan: "Premium", status: "Active", bill: "Oct 24, 2025" },
                     { name: "Mike Chen", email: "mike.dev@example.com", plan: "Basic", status: "Active", bill: "Sep 12, 2025" },
                     { name: "Alex Roze", email: "alex.r@studio.com", plan: "Basic", status: "Canceled", bill: "-" },
                     { name: "Emma Wilson", email: "emma.w@example.com", plan: "Premium", status: "Active", bill: "Nov 15, 2025" },
                  ].map((user, i) => (
                     <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="size-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-white ring-1 ring-white/10">
                                 {user.name[0]}
                              </div>
                              <div>
                                 <div className="font-bold text-white group-hover:text-primary transition-colors">{user.name}</div>
                                 <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           {user.plan === 'Premium' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                 <Crown size={12} fill="currentColor" /> Premium
                              </span>
                           ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                 Basic
                              </span>
                           )}
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                              <div className={clsx(
                                 "size-1.5 rounded-full",
                                 user.status === 'Active' ? "bg-emerald-500" : "bg-gray-500"
                              )}></div>
                              <span className={user.status === 'Active' ? "text-white" : "text-gray-500"}>{user.status}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                           {user.bill}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button className="p-1.5 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
                              <MoreVertical size={16} />
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Pagination */}
         <div className="border-t border-white/5 p-4 flex items-center justify-between bg-black/20">
            <span className="text-xs text-gray-500">Showing <span className="text-white font-bold">1-4</span> of <span className="text-white font-bold">1,240</span></span>
            <div className="flex items-center gap-2">
               <button className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronLeft size={16} />
               </button>
               <button className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white">
                  <ChevronRight size={16} />
               </button>
            </div>
         </div>
         
      </div>

    </div>
  );
}