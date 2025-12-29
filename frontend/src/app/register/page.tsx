'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({ 
    displayName: '',
    email: '', 
    password: '', 
    role: 'viewer' // Defaults to viewer automatically
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password Strength Logic
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/\d/.test(pass)) score++;
    if (/[!@#$%^&*]/.test(pass)) score++;
    if (/[A-Z]/.test(pass)) score++;
    return score; // 0 to 4
  };

  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Pass 'viewer' (from formData.role) and the display name
      await register(formData.email, formData.password, formData.role, formData.displayName);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0f1117] font-display text-white selection:bg-primary/30 overflow-hidden">
      
      {/* LEFT SIDE: Brand & Visuals */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gray-900 justify-center items-center">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay animate-[slowZoom_20s_infinite_alternate]"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2670&auto=format&fit=crop")' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117] via-[#0f1117]/60 to-purple-900/20 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 p-16 flex flex-col justify-between h-full w-full">
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20 backdrop-blur-md">
                <Zap className="text-primary fill-current" size={24} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">Micro-Drama</span>
            </div>
          </div>

          <div className="max-w-lg space-y-6 animate-fade-in-up [animation-delay:200ms]">
            <h1 className="text-5xl font-bold leading-tight drop-shadow-2xl">
              Start your journey<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                into vertical entertainment.
              </span>
            </h1>
            <p className="text-lg text-gray-300/90 leading-relaxed font-light">
              Join thousands of users defining the future of short-form drama. 
              Watch anywhere, anytime.
            </p>
          </div>

          <div className="text-sm text-gray-500 animate-fade-in-up [animation-delay:400ms]">
            © 2025 Micro-Drama Platform. All rights reserved.
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Register Form */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        
        {/* Ambient Color Blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] animate-pulse-slow [animation-delay:2s]"></div>

        <div className="w-full max-w-[480px] relative z-10 animate-fade-in-up my-auto">
          
          <div className="mb-8 space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Create Account</h2>
            <p className="text-gray-400">Sign up to start watching.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 animate-shake">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Display Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300 ml-1">Display Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  className="block w-full rounded-xl border border-gray-800 bg-[#161b22]/80 pl-11 pr-4 py-3.5 text-gray-100 placeholder:text-gray-600 focus:border-primary focus:ring-1 focus:ring-primary focus:bg-[#161b22] transition-all duration-200 outline-none hover:border-gray-700"
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="block w-full rounded-xl border border-gray-800 bg-[#161b22]/80 pl-11 pr-4 py-3.5 text-gray-100 placeholder:text-gray-600 focus:border-primary focus:ring-1 focus:ring-primary focus:bg-[#161b22] transition-all duration-200 outline-none hover:border-gray-700"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Create a strong password"
                  className="block w-full rounded-xl border border-gray-800 bg-[#161b22]/80 pl-11 pr-11 py-3.5 text-gray-100 placeholder:text-gray-600 focus:border-primary focus:ring-1 focus:ring-primary focus:bg-[#161b22] transition-all duration-200 outline-none hover:border-gray-700"
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

              {/* Strength Meter */}
              {formData.password && (
                <div className="px-1 pt-2 animate-fade-in">
                  <div className="flex gap-1.5 h-1 mb-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={clsx(
                        "flex-1 rounded-full transition-all duration-500",
                        strength >= i 
                          ? (strength <= 2 ? "bg-red-500" : strength === 3 ? "bg-yellow-500" : "bg-emerald-500") 
                          : "bg-gray-800"
                      )}></div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {strength >= 4 ? (
                      <span className="text-emerald-500 flex items-center gap-1"><CheckCircle size={10} /> Strong Password</span>
                    ) : (
                      <span>Include numbers & symbols for strength</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full relative group overflow-hidden rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(19,91,236,0.3)] transition-all hover:shadow-[0_0_30px_rgba(19,91,236,0.5)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative flex items-center justify-center gap-2">
                {isSubmitting ? 'Creating Account...' : 'Create Account'} 
                {!isSubmitting && <ArrowRight size={16} />}
              </span>
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Sign in
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}