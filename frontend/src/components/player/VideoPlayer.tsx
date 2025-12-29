'use client';

import { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoPlayerProps {
    src: string;
    poster?: string;
    isActive: boolean;
    onEnded?: () => void;
    onTimeUpdate?: (currentTime: number) => void;
    startTime?: number;
}

export default function VideoPlayer({ src, poster, isActive, onEnded, onTimeUpdate, startTime = 0 }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const hasSeeked = useRef(false);

    // Seek on load
    useEffect(() => {
        if (isActive && startTime > 0 && !hasSeeked.current && videoRef.current) {
            videoRef.current.currentTime = startTime;
            hasSeeked.current = true;
        }
    }, [isActive, startTime]);

    // Handle active state changes
    useEffect(() => {
        if (!videoRef.current) return;

        if (isActive) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsPlaying(true))
                    .catch(() => setIsPlaying(false));
            }
        } else {
            videoRef.current.pause();
            // Do NOT reset to 0 here automatically if we want to resume later? 
            // The original code reset it: videoRef.current.currentTime = 0; 
            // If we are scrolling away, resetting is fine, but if we come back?
            // "Resume ... matter more".
            // If I scroll away and come back, I expect to resume. 
            // So I should REMOVE the auto-reset to 0.
            setIsPlaying(false);
        }
    }, [isActive]);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(videoRef.current.muted);
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(percent);
        if (onTimeUpdate) {
            onTimeUpdate(videoRef.current.currentTime);
        }
    };

    return (
        <div
            className="relative w-full h-full bg-black cursor-pointer group"
            onClick={togglePlay}
        >
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                src={src}
                poster={poster}
                muted={isMuted}
                playsInline
                loop={false}
                onTimeUpdate={handleTimeUpdate}
                onEnded={onEnded}
            />

            {/* Play/Pause Overlay */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
                        <Play size={32} className="text-white fill-white" />
                    </div>
                </div>
            )}

            {/* Mute Button */}
            <button
                onClick={toggleMute}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <div
                    className="h-full bg-primary transition-all duration-100 linear"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
