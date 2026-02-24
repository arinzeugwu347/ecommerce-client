"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import AdminLayout from "@/components/admin/AdminLayout"
import { useSettings } from "@/components/providers/SettingsProvider"
import {
    ShoppingCart,
    Search,
    Truck,
    Eye,
    Clock,
    CheckCircle2,
    XCircle,
    User,
    CreditCard,
    Banknote,
    RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { format } from "date-fns"
import Link from "next/link"
import ConfirmModal from "@/components/common/ConfirmModal"

export default function AdminOrdersPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
        variant?: "danger" | "warning" | "info";
        confirmText?: string;
        cancelText?: string;
    }>({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => { },
    })

    const [page, setPage] = useState(1)
    const queryClient = useQueryClient()
    const { currencySymbol } = useSettings()

    const { data, isLoading } = useQuery({
        queryKey: ["admin-orders", page, searchTerm],
        queryFn: () => api.get(`/orders?pageNumber=${page}&keyword=${searchTerm}`).then(res => res.data),
    })

    const orders = data?.orders || []
    const pages = data?.pages || 1
    const currentPage = data?.page || 1

    const deliverMutation = useMutation({
        mutationFn: (id: string) => api.put(`/orders/${id}/deliver`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-orders"] })
            toast.success("Order marked as delivered")
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update order")
        }
    })

    const payMutation = useMutation({
        mutationFn: (id: string) => api.put(`/orders/${id}/pay-admin`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-orders"] })
            toast.success("Order marked as paid")
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update payment status")
        }
    })

    const verifyMutation = useMutation({
        mutationFn: ({ id, paymentIntentId }: { id: string, paymentIntentId: string }) =>
            api.post(`/orders/${id}/verify-payment`, { paymentIntentId }),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["admin-orders"] })
            if (res.data.success) {
                toast.success("Payment verified and matched!")
            } else {
                toast.info(`Payment status: ${res.data.status}`)
            }
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Verification failed")
        }
    })

    const handleDeliver = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Mark as Delivered?",
            description: "This will update the order status and notify the customer that their package is on the way or has arrived.",
            variant: "info",
            onConfirm: () => {
                deliverMutation.mutate(id)
                setConfirmModal(prev => ({ ...prev, isOpen: false }))
            }
        })
    }

    const handlePay = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Mark as Paid?",
            description: "Confirm this only if you have received the payment (e.g., Cash on Delivery). This action cannot be undone.",
            variant: "warning",
            confirmText: "Yes, Mark as Paid",
            onConfirm: () => {
                payMutation.mutate(id)
                setConfirmModal(prev => ({ ...prev, isOpen: false }))
            }
        })
    }

    const filteredOrders = orders

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            case 'shipped': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20'
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
        }
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                    <p className="text-muted-foreground mt-1">Monitor sales and manage order fulfillment.</p>
                </div>

                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-muted/30">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by Order ID or User name..."
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
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Order ID</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">User</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Date</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Method</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Total</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Paid</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Status</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {isLoading ? (
                                    [1, 2, 3, 4, 5].map((i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-4 w-24 bg-muted rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-32 bg-muted rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-20 bg-muted rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-16 bg-muted rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-6 w-16 bg-muted rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-6 w-20 bg-muted rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-8 w-24 bg-muted rounded ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                            No orders found.
                                        </td>
                                    </tr>
                                ) : filteredOrders.map((order: any) => (
                                    <tr key={order._id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4 font-medium uppercase text-xs tracking-wider">
                                            #{order._id.slice(-8)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <User className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="font-medium">{order.user?.name || "Deleted User"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {format(new Date(order.createdAt), "MMM d, yyyy")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="capitalize flex items-center gap-1.5 text-xs font-medium">
                                                {order.paymentMethod === 'stripe' ? <CreditCard className="h-3.5 w-3.5 text-blue-500" /> : <Banknote className="h-3.5 w-3.5 text-emerald-500" />}
                                                {order.paymentMethod?.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold">
                                            {currencySymbol}{Number(order.totalPrice).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.isPaid ? (
                                                <div className="flex items-center gap-1.5 text-emerald-500 font-medium">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    <span>Paid</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>Pending</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={cn(
                                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                                                getStatusColor(order.status)
                                            )}>
                                                {order.status || (order.isDelivered ? 'Delivered' : 'Pending')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 px-1">
                                                <Link
                                                    href={`/orders/${order._id}`}
                                                    className="p-2 rounded-lg hover:bg-accent border text-muted-foreground hover:text-accent-foreground transition-all shadow-sm"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                {!order.isPaid && (
                                                    <>
                                                        <button
                                                            onClick={() => handlePay(order._id)}
                                                            className="p-2 rounded-lg hover:bg-emerald-500 border border-emerald-500/20 text-emerald-500 hover:text-white transition-all shadow-sm"
                                                            title="Mark as Paid"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        </button>
                                                        {order.paymentMethod === 'stripe' && order.paymentResult?.id && (
                                                            <button
                                                                onClick={() => verifyMutation.mutate({ id: order._id, paymentIntentId: order.paymentResult.id })}
                                                                className="p-2 rounded-lg hover:bg-blue-500 border border-blue-500/20 text-blue-500 hover:text-white transition-all shadow-sm"
                                                                title="Verify Stripe Payment"
                                                                disabled={verifyMutation.isPending}
                                                            >
                                                                <RefreshCw className={cn("h-4 w-4", verifyMutation.isPending && "animate-spin")} />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                                {!order.isDelivered && (
                                                    <button
                                                        onClick={() => handleDeliver(order._id)}
                                                        className="p-2 rounded-lg hover:bg-amber-500 border border-amber-500/20 text-amber-500 hover:text-white transition-all shadow-sm"
                                                        title="Mark as Delivered"
                                                    >
                                                        <Truck className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                description={confirmModal.description}
                variant={confirmModal.variant}
                confirmText={confirmModal.confirmText}
                cancelText={confirmModal.cancelText}
                onConfirm={confirmModal.onConfirm}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                isLoading={deliverMutation.isPending || payMutation.isPending}
            />
        </AdminLayout >
    )
}
