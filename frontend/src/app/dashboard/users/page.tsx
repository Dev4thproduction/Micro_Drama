'use client';

import { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Shield, 
  UserCheck, 
  UserX, 
  Mail, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal,
  Crown,
  Zap,
  CheckCircle,
  Ban,
  Trash2
} from 'lucide-react';
import { clsx } from 'clsx';

// Mock Data
const USERS = [
  { id: 1, name: "Sarah Jenkins", email: "sarah.j@example.com", role: "creator", status: "active", sub: "premium", joined: "Oct 24, 2024", lastActive: "2 mins ago", avatarColor: "bg-purple-500" },
  { id: 2, name: "Mike Chen", email: "mike.dev@example.com", role: "admin", status: "active", sub: "free", joined: "Sep 12, 2024", lastActive: "1 hour ago", avatarColor: "bg-blue-500" },
  { id: 3, name: "Alex Roze", email: "alex.r@studio.com", role: "viewer", status: "suspended", sub: "basic", joined: "Jan 01, 2025", lastActive: "2 days ago", avatarColor: "bg-orange-500" },
  { id: 4, name: "Emma Wilson", email: "emma.w@example.com", role: "creator", status: "active", sub: "premium", joined: "Nov 15, 2024", lastActive: "5 hours ago", avatarColor: "bg-emerald-500" },
  { id: 5, name: "David Kim", email: "d.kim@tech.net", role: "viewer", status: "active", sub: "free", joined: "Dec 05, 2024", lastActive: "Just now", avatarColor: "bg-pink-500" },
  { id: 6, name: "Lara Croft", email: "tomb@raider.com", role: "viewer", status: "active", sub: "premium", joined: "Feb 10, 2025", lastActive: "1 day ago", avatarColor: "bg-cyan-500" },
];

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(userId => userId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* ---------------- TOP STATS ROW ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Users", val: "12,450", trend: "+12%", color: "blue", icon: UserCheck },
          { label: "Active Creators", val: "842", trend: "+5%", color: "purple", icon: Zap },
          { label: "Suspended / Banned", val: "45", trend: "-2%", color: "red", icon: UserX },
        ].map((stat, i) => (
           <div key={i} className="bg-[#161b22] border border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:border-white/10 transition-all">
              <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-bold text-white mt-1 group-hover:scale-105 transition-transform origin-left">{stat.val}</h3>
                <span className={`text-xs font-bold ${stat.color === 'red' ? 'text-red-400' : 'text-emerald-400'}`}>{stat.trend} <span className="text-gray-500 font-normal">from last month</span></span>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500 border border-${stat.color}-500/20`}>
                <stat.icon size={24} />
              </div>
           </div>
        ))}
      </div>

      {/* ---------------- MAIN CONTROLS ---------------- */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        
        {/* Search & Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto bg-[#161b22] border border-white/5 p-1.5 rounded-xl">
           <div className="relative group flex-1 md:w-80">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
             <input 
               type="text" 
               placeholder="Search by name, email, or ID..." 
               className="w-full bg-transparent border-none text-sm text-white placeholder:text-gray-600 focus:ring-0 px-10 py-2 outline-none"
             />
           </div>
           <div className="w-px h-6 bg-white/10 mx-2"></div>
           <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
             <Filter size={16} />
             <span>Filters</span>
           </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full md:w-auto">
          {selectedUsers.length > 0 && (
             <button className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all text-sm font-bold animate-fade-in">
               <Trash2 size={16} />
               Delete ({selectedUsers.length})
             </button>
          )}
          <button className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border border-white/5 hover:bg-[#1c2128] text-white rounded-xl transition-all text-sm font-medium">
             <Download size={16} />
             Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all text-sm font-bold shadow-lg shadow-primary/20">
             <UserCheck size={16} />
             Add User
          </button>
        </div>
      </div>

      {/* ---------------- USER TABLE ---------------- */}
      <div className="bg-[#161b22] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Tabs */}
        <div className="flex items-center gap-6 px-6 border-b border-white/5 text-sm font-medium overflow-x-auto no-scrollbar">
          {['All Users', 'Active', 'Suspended', 'Creators', 'Admins'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase().split(' ')[0])}
              className={clsx(
                "py-4 border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.toLowerCase().split(' ')[0] 
                  ? "border-primary text-white" 
                  : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-4 w-12">
                   <input type="checkbox" className="rounded border-gray-700 bg-gray-800 text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer" />
                </th>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {USERS.map((user) => (
                <tr key={user.id} className={clsx(
                  "group hover:bg-white/[0.02] transition-colors",
                  selectedUsers.includes(user.id) && "bg-primary/5"
                )}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleSelect(user.id)}
                      className="rounded border-gray-700 bg-gray-800 text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer" 
                    />
                  </td>
                  
                  {/* User Profile */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`size-10 rounded-full ${user.avatarColor} flex items-center justify-center text-white font-bold text-sm ring-2 ring-[#161b22] group-hover:ring-white/10 transition-all`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-primary transition-colors">{user.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                      user.role === 'admin' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                      user.role === 'creator' && "bg-purple-500/10 text-purple-400 border-purple-500/20",
                      user.role === 'viewer' && "bg-gray-500/10 text-gray-400 border-gray-500/20",
                    )}>
                      {user.role === 'admin' && <Shield size={12} />}
                      {user.role === 'creator' && <Zap size={12} />}
                      {user.role === 'viewer' && <UserCheck size={12} />}
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={clsx(
                        "size-2 rounded-full",
                        user.status === 'active' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500"
                      )} />
                      <span className={user.status === 'active' ? "text-emerald-400" : "text-red-400"}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </div>
                  </td>

                   {/* Subscription */}
                   <td className="px-6 py-4">
                    {user.sub === 'premium' ? (
                       <span className="flex items-center gap-1 text-amber-400 text-xs font-bold uppercase tracking-wider">
                         <Crown size={14} fill="currentColor" /> Premium
                       </span>
                    ) : (
                       <span className="text-gray-500 text-xs">Free Tier</span>
                    )}
                  </td>

                  {/* Last Active */}
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                    {user.lastActive}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Edit">
                        <MoreHorizontal size={16} />
                      </button>
                      <button className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors" title="Suspend">
                        <Ban size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="border-t border-white/5 p-4 flex items-center justify-between bg-black/20">
          <span className="text-xs text-gray-500">Showing <span className="text-white font-bold">1-6</span> of <span className="text-white font-bold">12,450</span> users</span>
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