'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface SectionRailProps {
    title: string;
    subtitle?: string;
    icon?: React.ElementType;
    children: React.ReactNode;
    className?: string;
}

export default function SectionRail({ title, subtitle, icon: Icon, children, className }: SectionRailProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -current.offsetWidth / 2 : current.offsetWidth / 2;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section className={clsx("py-6 space-y-4", className)}>
            <div className="flex items-center justify-between px-4 md:px-8">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Icon size={20} />
                        </div>
                    )}
                    <div>
                        <h2 className="text-xl font-bold text-white leading-none">{title}</h2>
                        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-4 px-4 md:px-8 pb-4 scrollbar-hide snap-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {children}
            </div>
        </section>
    );
}
