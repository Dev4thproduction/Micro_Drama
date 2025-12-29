import { ReactNode } from 'react';
import TopNav from './TopNav';

interface WebAppLayoutProps {
    children: ReactNode;
    user: any;
    logout: () => void;
}

export default function WebAppLayout({ children, user, logout }: WebAppLayoutProps) {
    return (
        <div className="min-h-screen bg-[#0f1117] text-white">
            <TopNav user={user} logout={logout} />

            {/* Main Content Area - Full Width, with padding for fixed header */}
            <main className="pt-20 min-h-screen">
                {children}
            </main>
        </div>
    );
}
