'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import { 
  User, Lock, Save, ArrowLeft, Loader2, 
  CheckCircle, AlertCircle, Camera 
} from 'lucide-react';

export default function UserSettingsPage() {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      return setMessage({ type: 'error', text: 'New passwords do not match' });
    }

    setLoading(true);
    try {
      await api.patch('/auth/profile', {
        displayName: formData.displayName,
        currentPassword: formData.currentPassword || undefined,
        newPassword: formData.newPassword || undefined
      });
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white font-display flex justify-center py-20 px-4">
      
      <div className="w-full max-w-2xl space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-gray-400">Update your personal information.</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-[#161b22] border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          
          {/* Avatar Area */}
          <div className="flex flex-col items-center mb-8">
             <div className="size-24 rounded-full bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center text-3xl font-bold ring-4 ring-[#0f1117] relative group cursor-pointer">
                {user?.displayName?.[0] || user?.email?.[0].toUpperCase()}
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Camera size={24} />
                </div>
             </div>
             <p className="mt-3 text-sm text-gray-500">{user?.email}</p>
             <span className="mt-1 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-bold uppercase tracking-wider text-gray-400">
               {user?.role} Account
             </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {message && (
              <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                 {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                 <span className="text-sm font-medium">{message.text}</span>
              </div>
            )}

            {/* Display Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <User size={14} /> Display Name
              </label>
              <input 
                type="text"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                value={formData.displayName}
                onChange={e => setFormData({...formData, displayName: e.target.value})}
              />
            </div>

            {/* Password Section */}
            <div className="pt-6 border-t border-white/5 space-y-6">
               <h3 className="text-sm font-bold text-white flex items-center gap-2">
                 <Lock size={16} className="text-primary" /> Change Password
               </h3>
               
               <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Current Password</label>
                    <input 
                      type="password"
                      placeholder="Required to set new password"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-primary outline-none transition-all"
                      value={formData.currentPassword}
                      onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">New Password</label>
                      <input 
                        type="password"
                        placeholder="Min 8 chars"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-primary outline-none transition-all"
                        value={formData.newPassword}
                        onChange={e => setFormData({...formData, newPassword: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">Confirm New</label>
                      <input 
                        type="password"
                        placeholder="Confirm password"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-primary outline-none transition-all"
                        value={formData.confirmPassword}
                        onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                      />
                   </div>
                 </div>
               </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 hover:-translate-y-1"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Changes</>}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}