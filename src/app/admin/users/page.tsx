"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import AdminLayout from "@/components/admin/AdminLayout"
import {
    Users,
    Search,
    ShieldCheck,
    ShieldAlert,
    Trash2,
    Mail,
    Calendar,
    MoreVertical
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { format } from "date-fns"
import ConfirmModal from "@/components/common/ConfirmModal"

export default function AdminUsersPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
        variant?: "danger" | "warning" | "info";
        confirmText?: string;
    }>({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => { },
    })
    const [page, setPage] = useState(1)
    const queryClient = useQueryClient()

    const { data, isLoading } = useQuery({
        queryKey: ["admin-users", page, searchTerm],
        queryFn: () => api.get(`/users?pageNumber=${page}&keyword=${searchTerm}`).then(res => res.data),
    })

    const users = data?.users || []
    const pages = data?.pages || 1
    const currentPage = data?.page || 1

    const updateRoleMutation = useMutation({
        mutationFn: ({ id, role }: { id: string, role: string }) => api.put(`/users/${id}`, { role }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] })
            toast.success("User role updated successfully")
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update user")
        }
    })

    const deleteUserMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/users/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] })
            toast.success("User deleted successfully")
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to delete user")
        }
    })

    const handleToggleRole = (id: string, currentRole: string, name: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin'
        setConfirmModal({
            isOpen: true,
            title: newRole === 'admin' ? "Promote to Admin?" : "Demote to User?",
            description: `Are you sure you want to change ${name}'s role to ${newRole}? This will change their administrative permissions.`,
            variant: newRole === 'admin' ? "warning" : "info",
            confirmText: newRole === 'admin' ? "Promote" : "Demote",
            onConfirm: () => {
                updateRoleMutation.mutate({ id, role: newRole })
                setConfirmModal(prev => ({ ...prev, isOpen: false }))
            }
        })
    }

    const handleDeleteUser = (id: string, name: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Delete User?",
            description: `Are you sure you want to delete user ${name}? This action cannot be undone and will permanently remove their account from the system.`,
            variant: "danger",
            confirmText: "Delete User",
            onConfirm: () => {
                deleteUserMutation.mutate(id)
                setConfirmModal(prev => ({ ...prev, isOpen: false }))
            }
        })
    }

    const filteredUsers = users

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground mt-1">Manage user accounts and permissions.</p>
                </div>

                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-muted/30">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="w-full bg-background border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b bg-muted/10">
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">User</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Email</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Joined</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Role</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {isLoading ? (
                                    [1, 2, 3, 4, 5].map((i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-4 w-32 bg-muted rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-40 bg-muted rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-24 bg-muted rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-6 w-16 bg-muted rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-8 w-24 bg-muted rounded ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : filteredUsers.map((user: any) => (
                                    <tr key={user._id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="font-semibold text-foreground">{user.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Mail className="h-3.5 w-3.5" />
                                                <span>{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>{format(new Date(user.createdAt), "MMM d, yyyy")}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                                                user.role === 'admin'
                                                    ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                                                    : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                                            )}>
                                                {user.role === 'admin' ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleToggleRole(user._id, user.role, user.name)}
                                                    className={cn(
                                                        "p-2 rounded-lg border transition-all shadow-sm",
                                                        user.role === 'admin'
                                                            ? "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                                                            : "hover:bg-purple-50 text-purple-400 hover:text-purple-600 border-purple-100"
                                                    )}
                                                    title={user.role === 'admin' ? "Demote to User" : "Promote to Admin"}
                                                >
                                                    {user.role === 'admin' ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user._id, user.name)}
                                                    className="p-2 rounded-lg hover:bg-red-50 border border-red-100 text-red-400 hover:text-red-600 transition-all shadow-sm"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex items-center justify-between p-6 border-t bg-muted/20">
                            <div className="text-sm text-muted-foreground">
                                Page {currentPage} of {pages}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1 || isLoading}
                                    className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-accent disabled:opacity-50 transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(prev => Math.min(prev + 1, pages))}
                                    disabled={currentPage === pages || isLoading}
                                    className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-accent disabled:opacity-50 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                description={confirmModal.description}
                variant={confirmModal.variant}
                confirmText={confirmModal.confirmText}
                onConfirm={confirmModal.onConfirm}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                isLoading={updateRoleMutation.isPending || deleteUserMutation.isPending}
            />
        </AdminLayout>
    )
}
