'use client';

import { useState } from 'react';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Calendar, 
  FileText, 
  Filter, 
  MoreVertical, 
  ChevronRight,
  ShieldAlert,
  Download,
  Maximize2,
  Volume2
} from 'lucide-react';
import { clsx } from 'clsx';

// Mock Data for Pending Queue
const PENDING_QUEUE = [
  { 
    id: 101, 
    title: "Ep 1: The Awakening", 
    series: "The Lost City", 
    creator: "Sarah Jenkins", 
    submitted: "2 hours ago", 
    duration: "1:45", 
    thumbnail: "https://images.unsplash.com/photo-1515552726023-7125c8d07fb3?q=80&w=1000&auto=format&fit=crop",
    description: "The first episode introduces the main character discovering the ancient map.",
    tags: ["Sci-Fi", "Mystery", "Intro"],
    fileSize: "45.2 MB",
    resolution: "1080x1920 (9:16)"
  },
  { 
    id: 102, 
    title: "Ep 4: Betrayal", 
    series: "Crown of Thorns", 
    creator: "Mike Chen", 
    submitted: "5 hours ago", 
    duration: "2:10", 
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop",
    description: "Plot twist reveal. Requires content warning check for mild violence.",
    tags: ["Drama", "Thriller"],
    fileSize: "52.8 MB",
    resolution: "1080x1920 (9:16)"
  },
  { 
    id: 103, 
    title: "Trailer: Love & Code", 
    series: "Love & Code", 
    creator: "Alex Roze", 
    submitted: "1 day ago", 
    duration: "0:55", 
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop",
    description: "Official trailer for the upcoming rom-com series.",
    tags: ["Romance", "Comedy", "Trailer"],
    fileSize: "12.5 MB",
    resolution: "1080x1920 (9:16)"
  },
];

export default function ModerationPage() {
  const [selectedId, setSelectedId] = useState<number>(101);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Get current selected item
  const selectedItem = PENDING_QUEUE.find(item => item.id === selectedId) || PENDING_QUEUE[0];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 animate-fade-in pb-4">
      
      {/* ---------------- LEFT COL: THE QUEUE ---------------- */}
      <section className="lg:w-1/3 flex flex-col gap-4 h-full">
        
        {/* Queue Header */}
        <div className="flex items-center justify-between p-1">
           <div>
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
               <ShieldAlert className="text-primary" size={20} />
               Review Queue
             </h2>
             <p className="text-xs text-gray-500">3 items pending action</p>
           </div>
           <button className="p-2 bg-[#161b22] border border-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
             <Filter size={16} />
           </button>
        </div>

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {PENDING_QUEUE.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={clsx(
                "group flex gap-4 p-3 rounded-xl cursor-pointer border transition-all relative overflow-hidden",
                selectedId === item.id 
                  ? "bg-[#161b22] border-primary/50 shadow-lg shadow-primary/5" 
                  : "bg-[#161b22]/50 border-transparent hover:bg-[#161b22] hover:border-white/10"
              )}
            >
              {/* Active Indicator Strip */}
              {selectedId === item.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
              )}

              {/* Thumbnail */}
              <div className="relative w-16 h-24 rounded-lg overflow-hidden shrink-0 bg-black">
                 <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                 <div className="absolute bottom-1 right-1 bg-black/80 text-[10px] font-bold px-1 rounded text-white">
                   {item.duration}
                 </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                 <h4 className={clsx("font-bold truncate", selectedId === item.id ? "text-primary" : "text-white")}>
                   {item.title}
                 </h4>
                 <p className="text-xs text-gray-400 truncate">{item.series}</p>
                 <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">
                       <Clock size={10} /> {item.submitted}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                       by <span className="text-gray-300">{item.creator}</span>
                    </div>
                 </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center text-gray-600 group-hover:text-white transition-colors">
                 <ChevronRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ---------------- RIGHT COL: WORKSPACE ---------------- */}
      <section className="lg:w-2/3 h-full bg-[#161b22] border border-white/5 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* Workspace Header */}
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0f1117]/50 backdrop-blur-sm">
           <div className="flex items-center gap-3">
              <div className="p-1.5 bg-primary/10 rounded text-primary font-bold text-xs uppercase tracking-wide border border-primary/20">
                Pending Review
              </div>
              <span className="text-gray-600 text-sm">ID: #{selectedItem.id}</span>
           </div>
           <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                 <MoreVertical size={18} />
              </button>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
              
              {/* VIDEO PLAYER (Vertical) */}
              <div className="relative aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 group max-h-[600px] mx-auto w-full max-w-[340px]">
                 <img src={selectedItem.thumbnail} className="w-full h-full object-cover opacity-60" />
                 
                 {/* Play Button Overlay */}
                 <div className="absolute inset-0 flex items-center justify-center">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="size-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:scale-110 hover:bg-white/20 transition-all shadow-xl"
                    >
                      {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                    </button>
                 </div>

                 {/* Player Controls (Mock) */}
                 <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                    <div className="h-1 bg-white/20 rounded-full mb-3 overflow-hidden">
                       <div className="h-full w-[30%] bg-primary"></div>
                    </div>
                    <div className="flex justify-between text-white/80">
                       <div className="flex gap-3">
                         <Volume2 size={18} />
                       </div>
                       <Maximize2 size={18} />
                    </div>
                 </div>
              </div>

              {/* METADATA & ACTIONS */}
              <div className="flex flex-col h-full">
                 
                 {/* Metadata Card */}
                 <div className="bg-[#0f1117] rounded-xl border border-white/5 p-5 space-y-4 mb-6">
                    <div>
                       <h1 className="text-2xl font-bold text-white mb-1">{selectedItem.title}</h1>
                       <div className="flex flex-wrap gap-2 text-sm text-gray-400">
                          <span>{selectedItem.series}</span>
                          <span>•</span>
                          <span>{selectedItem.duration}</span>
                          <span>•</span>
                          <span className="text-primary">{selectedItem.fileSize}</span>
                       </div>
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                       <p className="text-sm text-gray-300 leading-relaxed bg-[#161b22] p-3 rounded-lg border border-white/5">
                          {selectedItem.description}
                       </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Creator</label>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="size-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
                                {selectedItem.creator[0]}
                             </div>
                             <span className="text-sm text-white">{selectedItem.creator}</span>
                          </div>
                       </div>
                       <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Technical</label>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                             <FileText size={14} /> {selectedItem.resolution}
                          </div>
                       </div>
                    </div>

                    <div>
                       <label className="text-xs font-bold text-gray-500 uppercase">Tags</label>
                       <div className="flex flex-wrap gap-2 mt-2">
                          {selectedItem.tags.map(tag => (
                             <span key={tag} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-300">
                                {tag}
                             </span>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* DECISION AREA */}
                 <div className="mt-auto space-y-4 border-t border-white/5 pt-6">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                       <ShieldAlert size={16} className="text-primary" /> Moderation Decision
                    </h3>
                    
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                       {/* Reject Flow */}
                       <div className="space-y-2">
                          <select 
                             className="w-full bg-[#0f1117] border border-red-500/20 rounded-lg text-sm text-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 p-2.5 outline-none"
                             value={rejectReason}
                             onChange={(e) => setRejectReason(e.target.value)}
                          >
                             <option value="">Select Rejection Reason...</option>
                             <option value="guidelines">Community Guidelines</option>
                             <option value="copyright">Copyright Violation</option>
                             <option value="quality">Low Quality / Technical</option>
                             <option value="violence">Inappropriate Content</option>
                          </select>
                          <button className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group">
                             <XCircle size={18} /> 
                             Reject Content
                          </button>
                       </div>

                       {/* Approve Flow */}
                       <div className="flex items-end">
                          <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 h-[84px]">
                             <CheckCircle size={20} />
                             Approve & Publish
                          </button>
                       </div>
                    </div>
                 </div>

              </div>
           </div>
        </div>
      </section>

    </div>
  );
}