'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
  Search, Filter, Shield, UserCheck, Zap, Ban, 
  ChevronLeft, ChevronRight, Loader2 
} from 'lucide-react';
import { clsx } from 'clsx';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: { page, search, role: roleFilter === 'all' ? undefined : roleFilter }
      });
      
      // FIX 1: The users array is directly in `res.data.data`
      // FIX 2: Pagination info is in `res.data.meta`
      setUsers(res.data.data || []); 
      setTotalPages(res.data.meta?.totalPages || 1);
      
    } catch (err) {
      console.error(err);
      setUsers([]); // Fallback to empty array on error to prevent map crash
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]); // Re-fetch on page/filter change
  console.log(users);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on new search
    fetchUsers();
  };

  const toggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      // Update local state to reflect change immediately
      setUsers((prev: any) => prev.map((u: any) => 
        u._id === userId ? { ...u, status: newStatus } : u
      ));
    } catch (err) {
      alert('Failed to update status');
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto bg-[#161b22] border border-white/5 p-1.5 rounded-xl">
           <div className="relative group flex-1 md:w-80">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
             <input 
               type="text" 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search by name or email..." 
               className="w-full bg-transparent border-none text-sm text-white placeholder:text-gray-600 focus:ring-0 px-10 py-2 outline-none"
             />
           </div>
           <button type="submit" className="hidden"></button>
        </form>
      </div>

      {/* TABLE */}
      <div className="bg-[#161b22] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* TABS */}
        <div className="flex items-center gap-6 px-6 border-b border-white/5 text-sm font-medium overflow-x-auto">
          {['All', 'Creator', 'Viewer', 'Admin'].map((tab) => (
            <button 
              key={tab}
              onClick={() => { setRoleFilter(tab.toLowerCase()); setPage(1); }}
              className={clsx(
                "py-4 border-b-2 transition-colors whitespace-nowrap",
                roleFilter === tab.toLowerCase() 
                  ? "border-primary text-white" 
                  : "border-transparent text-gray-500 hover:text-white"
              )}
            >
              {tab}s
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20 text-xs uppercase text-gray-500 font-semibold">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {users.map((user: any) => (
                  <tr key={user._id} className="group hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white font-bold text-sm">
                          {user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white">{user.displayName || 'No Name'}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                        user.role === 'admin' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                        user.role === 'creator' && "bg-purple-500/10 text-purple-400 border-purple-500/20",
                        user.role === 'viewer' && "bg-gray-500/10 text-gray-400 border-gray-500/20",
                      )}>
                        {user.role === 'admin' ? <Shield size={12}/> : user.role === 'creator' ? <Zap size={12}/> : <UserCheck size={12}/>}
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx("text-xs font-bold", user.status === 'active' ? "text-emerald-400" : "text-red-400")}>
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => toggleStatus(user._id, user.status)}
                         className={clsx(
                           "p-2 rounded-lg transition-colors",
                           user.status === 'active' ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                         )}
                         title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                       >
                         {user.status === 'active' ? <Ban size={16} /> : <UserCheck size={16} />}
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        <div className="border-t border-white/5 p-4 flex items-center justify-between bg-black/20">
          <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}