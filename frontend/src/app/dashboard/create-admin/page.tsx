'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { 
  Shield, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  UserPlus,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { clsx } from 'clsx';

export default function CreateAdminPage() {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  // Simple strength meter logic
  const getStrength = (pass: string) => {
    let s = 0;
    if(pass.length > 6) s++;
    if(pass.length > 10) s++;
    if(/[A-Z]/.test(pass)) s++;
    if(/[0-9]/.test(pass)) s++;
    return s;
  };
  
  const strength = getStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Calls the dedicated admin creation route
      await api.post('/admin/create-admin', formData);
      
      setMessage({ type: 'success', text: 'New Admin created successfully!' });
      setFormData({ displayName: '', email: '', password: '' }); // Reset form
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create admin.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 animate-fade-in">
      
      {/* ---------------- HEADER ---------------- */}
      <div className="text-center mb-10 space-y-2">
        <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-[0_0_30px_rgba(19,91,236,0.2)]">
          <Shield className="text-primary h-8 w-8" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">Grant Admin Access</h1>
        <p className="text-gray-400 max-w-md mx-auto">
          Create a new privileged account. This user will have <span className="text-white font-bold">full control</span> over content, users, and platform settings.
        </p>
      </div>

      {/* ---------------- MAIN CARD ---------------- */}
      <div className="bg-[#161b22] border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
        
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          {/* Status Message */}
          {message && (
             <div className={clsx(
               "p-4 rounded-xl flex items-center gap-3 text-sm font-bold border",
               message.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
             )}>
                {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                {message.text}
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Display Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Display Name</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within/input:text-primary transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text"
                  required
                  placeholder="e.g. John Admin"
                  className="block w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                />
              </div>
            </div>

            {/* Locked Role Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Assigned Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-purple-400">
                  <Lock size={18} />
                </div>
                <input 
                  type="text"
                  readOnly
                  value="Administrator"
                  className="block w-full rounded-xl border border-purple-500/30 bg-purple-500/10 pl-11 pr-4 py-3.5 text-purple-400 font-bold cursor-not-allowed outline-none shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded uppercase font-bold">Fixed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative group/input">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within/input:text-primary transition-colors">
                <Mail size={18} />
              </div>
              <input 
                type="email"
                required
                placeholder="admin.name@company.com"
                className="block w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group/input">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within/input:text-primary transition-colors">
                <Lock size={18} />
              </div>
              <input 
                type={showPassword ? "text" : "password"}
                required
                placeholder="Create a secure password"
                className="block w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-11 py-3.5 text-white placeholder:text-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Strength Indicator */}
            <div className="flex gap-1 h-1 mt-2 px-1">
              {[1,2,3,4].map(i => (
                <div key={i} className={clsx(
                  "flex-1 rounded-full transition-all duration-500",
                  strength >= i ? (strength < 3 ? "bg-red-500" : strength < 4 ? "bg-yellow-500" : "bg-emerald-500") : "bg-white/10"
                )} />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => setFormData({ displayName: '', email: '', password: '' })}
              className="flex-1 py-4 rounded-xl border border-white/10 text-gray-400 font-bold hover:bg-white/5 hover:text-white transition-colors"
            >
              Clear
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-[2] py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-[0_0_20px_rgba(19,91,236,0.3)] hover:shadow-[0_0_30px_rgba(19,91,236,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                 <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                 <>
                   <UserPlus size={20} />
                   Create Admin Account
                 </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}