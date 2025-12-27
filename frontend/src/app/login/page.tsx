'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Github,
  Chrome,
  Zap
} from 'lucide-react';
import { clsx } from 'clsx';

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(formData.email, formData.password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0f1117] font-display text-white selection:bg-primary/30 overflow-hidden">
      
      {/* LEFT SIDE: Brand & Visuals */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gray-900 justify-center items-center">
        {/* Animated Background Image with Zoom Effect */}
        <div className="absolute inset-0 z-0">
           {/* You can replace this URL with your specific image */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay animate-[slowZoom_20s_infinite_alternate]"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop")' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117] via-[#0f1117]/60 to-primary/20 mix-blend-multiply"></div>
        </div>

        {/* Brand Content */}
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
              Cinematic stories,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                reimagined vertically.
              </span>
            </h1>
            <p className="text-lg text-gray-300/90 leading-relaxed font-light">
              Experience the next generation of short-form storytelling. 
              Manage your creations, track analytics, and engage with your audience.
            </p>
          </div>

          <div className="text-sm text-gray-500 animate-fade-in-up [animation-delay:400ms]">
            © 2025 Micro-Drama Platform. All rights reserved.
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center p-6 sm:p-12">
        
        {/* Ambient Color Blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] animate-pulse-slow [animation-delay:2s]"></div>

        {/* Glass Card Container */}
        <div className="w-full max-w-[440px] relative z-10 animate-fade-in-up">
          
          <div className="mb-8 space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
            <p className="text-gray-400">Enter your credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 animate-shake">
                <div className="size-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <div className="space-y-5">
              
              {/* Email Field */}
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

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-medium text-gray-300">Password</label>
                  <a href="#" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
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
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full relative group overflow-hidden rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(19,91,236,0.3)] transition-all hover:shadow-[0_0_30px_rgba(19,91,236,0.5)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative flex items-center justify-center gap-2">
                {isSubmitting ? 'Signing in...' : 'Sign In'} 
                {!isSubmitting && <ArrowRight size={16} />}
              </span>
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#0f1117] px-4 text-xs uppercase text-gray-500 font-medium tracking-wider">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="flex items-center justify-center gap-3 rounded-xl border border-gray-800 bg-[#161b22] px-4 py-3 text-sm font-medium text-white transition-all hover:bg-[#1c2128] hover:border-gray-700">
                 {/* Lucide doesn't have a Google logo, using Chrome as placeholder or custom SVG if preferred */}
                 <Chrome size={18} /> Google
              </button>
              <button type="button" className="flex items-center justify-center gap-3 rounded-xl border border-gray-800 bg-[#161b22] px-4 py-3 text-sm font-medium text-white transition-all hover:bg-[#1c2128] hover:border-gray-700">
                <Github size={18} /> GitHub
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <Link href="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Sign up
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}