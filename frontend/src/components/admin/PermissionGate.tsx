'use client';

import { ReactNode, useMemo } from 'react';
import { clsx } from 'clsx';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type PermissionGateProps = {
  allow: Array<'viewer' | 'creator' | 'admin'>;
  /**
   * When true, children render but appear disabled with visual feedback.
   * Otherwise unauthorized content is hidden completely.
   */
  showDisabled?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
};

export default function PermissionGate({
  allow,
  showDisabled = false,
  children,
  fallback,
}: PermissionGateProps) {
  const { user } = useAuth();
  const allowed = useMemo(() => {
    if (!user?.role) return false;
    return allow.includes(user.role);
  }, [user?.role, allow]);

  if (allowed) return <>{children}</>;

  if (!showDisabled) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-60">{children}</div>
      <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-red-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-red-200">
        <ShieldAlert size={12} />
        Permission required
      </div>
    </div>
  );
}
