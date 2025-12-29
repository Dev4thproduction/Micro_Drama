'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Check, Zap, Crown, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: 'basic' | 'premium') => {
    setLoading(plan);
    try {
      await api.post('/subscriptions/subscribe', { plan });
      alert(`Successfully subscribed to ${plan.toUpperCase()}!`);
      router.push('/'); 
    } catch (err: any) {
      alert(err.response?.data?.message || 'Subscription failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white font-display py-12 px-4 flex flex-col items-center">
      <Link href="/" className="absolute top-8 left-8 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
        <ArrowLeft size={24} />
      </Link>

      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
          Choose Your <span className="text-primary">Experience</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Unlock the full potential of Micro-Drama.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* BASIC */}
        <div className="p-8 rounded-3xl border border-white/5 bg-[#161b22] hover:border-white/10 transition-all flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-300 flex items-center gap-2"><Zap size={20} /> Basic</h3>
            <div className="flex items-baseline gap-1 mt-4">
              <span className="text-4xl font-bold text-white">$4.99</span><span className="text-gray-500">/mo</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            {['Access to all mini-series', '720p Streaming', 'Limited Ads'].map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-gray-300"><Check size={16} className="text-primary" /> {f}</li>
            ))}
          </ul>
          <button onClick={() => handleSubscribe('basic')} disabled={!!loading} className="w-full py-4 rounded-xl border border-white/10 hover:bg-white/5 font-bold transition-all disabled:opacity-50">
            {loading === 'basic' ? <Loader2 className="animate-spin mx-auto" /> : 'Choose Basic'}
          </button>
        </div>

        {/* PREMIUM */}
        <div className="p-8 rounded-3xl border border-primary/50 bg-gradient-to-b from-primary/10 to-[#161b22] flex flex-col shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Crown size={20} className="text-amber-400" /> Premium</h3>
            <div className="flex items-baseline gap-1 mt-4">
              <span className="text-4xl font-bold text-white">$9.99</span><span className="text-gray-500">/mo</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            {['Everything in Basic', '4K Ultra HD', 'Ad-Free', 'Offline Downloads'].map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-white"><Check size={16} className="text-primary" /> {f}</li>
            ))}
          </ul>
          <button onClick={() => handleSubscribe('premium')} disabled={!!loading} className="w-full py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-all disabled:opacity-50">
            {loading === 'premium' ? <Loader2 className="animate-spin mx-auto" /> : 'Get Premium'}
          </button>
        </div>
      </div>
    </div>
  );
}