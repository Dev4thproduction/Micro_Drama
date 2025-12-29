import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface MobileContainerProps {
    children: ReactNode;
    className?: string;
}

export default function MobileContainer({ children, className }: MobileContainerProps) {
    return (
        <div className="min-h-screen w-full bg-[#0f1117] flex justify-center">
            <div
                className={clsx(
                    "w-full max-w-[480px] bg-[#161b22] shadow-2xl min-h-screen relative flex flex-col",
                    className
                )}
            >
                {children}
            </div>
        </div>
    );
}
