'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import {
    Ban,
    CheckCircle,
    Crown,
    Edit3,
    Loader2,
    RefreshCw,
    Search,
    Shield,
    Trash2,
    User,
    Users,
    XCircle,
} from 'lucide-react';
import api from '@/lib/api';

type UserType = {
    _id: string;
    email: string;
    displayName?: string;
    role: 'viewer' | 'creator' | 'admin';
    status: 'active' | 'suspended' | 'deleted';
    createdAt: string;
    updatedAt?: string;
};

const PAGE_SIZE = 10;

const ROLE_CONFIG = {
    admin: { label: 'Admin', icon: Crown, class: 'border-purple-500/30 bg-purple-500/10 text-purple-200' },
    creator: { label: 'Creator', icon: Edit3, class: 'border-blue-500/30 bg-blue-500/10 text-blue-200' },
    viewer: { label: 'Viewer', icon: User, class: 'border-gray-500/30 bg-gray-500/10 text-gray-200' },
};

const STATUS_CONFIG = {
    active: { label: 'Active', icon: CheckCircle, class: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' },
    suspended: { label: 'Suspended', icon: Ban, class: 'border-amber-500/30 bg-amber-500/10 text-amber-200' },
    deleted: { label: 'Deleted', icon: XCircle, class: 'border-red-500/30 bg-red-500/10 text-red-200' },
};

export default function UsersPage() {
    const [users, setUsers] = useState<UserType[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionId, setActionId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
        [total]
    );

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params: Record<string, string | number> = { page, limit: PAGE_SIZE };
            if (searchQuery.trim()) params.q = searchQuery.trim();
            if (roleFilter) params.role = roleFilter;
            if (statusFilter) params.status = statusFilter;

            const res = await api.get('/admin/users', { params });
            const payload = res.data?.data ?? res.data;
            const items = payload?.items ?? [];
            const totalCount = payload?.total ?? items.length;
            setUsers(items);
            setTotal(totalCount);
        } catch (err: any) {
            const message =
                err?.response?.data?.error?.message ||
                err?.message ||
                'Unable to load users';
            setError(message);
            setUsers([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery, roleFilter, statusFilter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleStatusChange = async (userId: string, newStatus: string) => {
        setActionId(userId);
        const snapshot = [...users];
        setUsers((prev) =>
            prev.map((u) => (u._id === userId ? { ...u, status: newStatus as UserType['status'] } : u))
        );

        try {
            await api.patch(`/admin/users/${userId}`, { status: newStatus });
        } catch (err: any) {
            const message =
                err?.response?.data?.error?.message ||
                err?.message ||
                'Failed to update status';
            setError(message);
            setUsers(snapshot);
        } finally {
            setActionId(null);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        setActionId(userId);
        const snapshot = [...users];
        setUsers((prev) =>
            prev.map((u) => (u._id === userId ? { ...u, role: newRole as UserType['role'] } : u))
        );

        try {
            await api.patch(`/admin/users/${userId}`, { role: newRole });
        } catch (err: any) {
            const message =
                err?.response?.data?.error?.message ||
                err?.message ||
                'Failed to update role';
            setError(message);
            setUsers(snapshot);
        } finally {
            setActionId(null);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const isBusy = (id: string) => actionId === id;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                        <Users size={14} className="text-primary" />
                        User Management
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Manage Users</h1>
                    <p className="text-sm text-gray-400">
                        Search, filter, and manage user accounts, roles, and statuses.
                    </p>
                </div>

                <button
                    onClick={fetchUsers}
                    disabled={loading}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-gray-200 hover:border-white/20 hover:text-white transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={16} className={clsx('inline-block mr-2', loading && 'animate-spin')} />
                    Refresh
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by email or name..."
                            className="w-64 rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <button
                        type="submit"
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
                    >
                        Search
                    </button>
                </form>

                <select
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                >
                    <option value="">All Roles</option>
                    <option value="viewer">Viewer</option>
                    <option value="creator">Creator</option>
                    <option value="admin">Admin</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="deleted">Deleted</option>
                </select>
            </div>

            {error && (
                <div
                    role="status"
                    aria-live="polite"
                    className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                >
                    {error}
                </div>
            )}

            {/* Users Table */}
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#161b22] shadow-xl">
                <div className="grid grid-cols-12 gap-4 border-b border-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                    <div className="col-span-4 sm:col-span-3">User</div>
                    <div className="hidden sm:block col-span-3">Email</div>
                    <div className="col-span-3 sm:col-span-2">Role</div>
                    <div className="col-span-3 sm:col-span-2">Status</div>
                    <div className="col-span-2 sm:col-span-2 text-right">Actions</div>
                </div>

                <div className="divide-y divide-white/5">
                    {loading
                        ? Array.from({ length: 5 }).map((_, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-4 px-4 py-4 animate-pulse">
                                <div className="col-span-4 sm:col-span-3">
                                    <div className="h-4 w-32 rounded-full bg-white/10" />
                                </div>
                                <div className="hidden sm:block col-span-3">
                                    <div className="h-4 w-40 rounded-full bg-white/10" />
                                </div>
                                <div className="col-span-3 sm:col-span-2">
                                    <div className="h-6 w-20 rounded-full bg-white/10" />
                                </div>
                                <div className="col-span-3 sm:col-span-2">
                                    <div className="h-6 w-20 rounded-full bg-white/10" />
                                </div>
                                <div className="col-span-2 sm:col-span-2 flex justify-end">
                                    <div className="h-8 w-16 rounded-full bg-white/10" />
                                </div>
                            </div>
                        ))
                        : users.map((user) => {
                            const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.viewer;
                            const statusConfig = STATUS_CONFIG[user.status] || STATUS_CONFIG.active;
                            const RoleIcon = roleConfig.icon;
                            const StatusIcon = statusConfig.icon;

                            return (
                                <div
                                    key={user._id}
                                    className="grid grid-cols-12 gap-4 px-4 py-4 transition-colors hover:bg-white/5"
                                >
                                    <div className="col-span-4 sm:col-span-3 flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center text-sm font-bold ring-2 ring-[#161b22]">
                                            {user.displayName?.[0] || user.email[0].toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-white truncate">
                                                {user.displayName || 'No name'}
                                            </p>
                                            <p className="text-xs text-gray-500 sm:hidden truncate">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="hidden sm:flex col-span-3 items-center">
                                        <p className="text-sm text-gray-300 truncate">{user.email}</p>
                                    </div>

                                    <div className="col-span-3 sm:col-span-2 flex items-center">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                            disabled={isBusy(user._id)}
                                            className={clsx(
                                                'rounded-full border px-2 py-1 text-xs font-semibold bg-transparent focus:outline-none',
                                                roleConfig.class,
                                                isBusy(user._id) && 'opacity-50'
                                            )}
                                        >
                                            <option value="viewer">Viewer</option>
                                            <option value="creator">Creator</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>

                                    <div className="col-span-3 sm:col-span-2 flex items-center">
                                        <select
                                            value={user.status}
                                            onChange={(e) => handleStatusChange(user._id, e.target.value)}
                                            disabled={isBusy(user._id)}
                                            className={clsx(
                                                'rounded-full border px-2 py-1 text-xs font-semibold bg-transparent focus:outline-none',
                                                statusConfig.class,
                                                isBusy(user._id) && 'opacity-50'
                                            )}
                                        >
                                            <option value="active">Active</option>
                                            <option value="suspended">Suspended</option>
                                            <option value="deleted">Deleted</option>
                                        </select>
                                    </div>

                                    <div className="col-span-2 sm:col-span-2 flex items-center justify-end gap-2">
                                        {isBusy(user._id) && (
                                            <Loader2 size={16} className="animate-spin text-gray-400" />
                                        )}
                                        <span className="text-xs text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                    {!loading && users.length === 0 && (
                        <div className="px-4 py-10 text-center text-gray-400">
                            No users found matching your criteria.
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-gray-400">
                    Page {page} of {totalPages} · {total} total users
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-gray-200 hover:border-white/20 hover:text-white transition-colors disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages || loading}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-gray-200 hover:border-white/20 hover:text-white transition-colors disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
