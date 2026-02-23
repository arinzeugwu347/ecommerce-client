"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "sonner"
import { Package, ChevronRight, ShoppingBag, Loader2 } from "lucide-react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { useSettings } from "@/components/providers/SettingsProvider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface Order {
    _id: string
    createdAt: string
    totalPrice: number
    isPaid: boolean
    isDelivered: boolean
    status: string
}

export default function OrdersPage() {
    const { isAuthenticated, mounted, setMounted } = useAuthStore()
    const { currencySymbol } = useSettings()
    const router = useRouter()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setMounted(true)
    }, [setMounted])

    useEffect(() => {
        if (mounted && !isAuthenticated) {
            router.push("/login?redirect=/orders")
            return
        }

        const fetchOrders = async () => {
            try {
                const { data } = await api.get("/orders/myorders")
                setOrders(data)
            } catch (err: any) {
                toast.error("Failed to fetch orders", {
                    description: err.response?.data?.message || "Please try again later"
                })
            } finally {
                setLoading(false)
            }
        }

        if (isAuthenticated) {
            fetchOrders()
        }
    }, [isAuthenticated, mounted, router])

    if (!mounted || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="bg-muted/50 p-6 rounded-full mb-6">
                    <Package className="h-16 w-16 text-muted-foreground/40" />
                </div>
                <h1 className="text-3xl font-bold mb-4">No Orders Found</h1>
                <p className="text-muted-foreground mb-8 max-w-sm">
                    You haven't placed any orders yet. Start shopping to see your orders here!
                </p>
                <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                    <Link href="/products" className="gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        Browse Products
                    </Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
                    <p className="text-muted-foreground">Manage and track your recent orders</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{orders.length}</span> Orders total
                </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="font-semibold px-6">Order ID</TableHead>
                            <TableHead className="font-semibold">Date</TableHead>
                            <TableHead className="font-semibold text-right">Total</TableHead>
                            <TableHead className="font-semibold text-center">Payment</TableHead>
                            <TableHead className="font-semibold text-center">Status</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow
                                key={order._id}
                                className="hover:bg-muted/30 transition-colors group cursor-pointer"
                                onClick={() => router.push(`/orders/${order._id}`)}
                            >
                                <TableCell className="font-mono text-xs px-6 py-4">
                                    {order._id.substring(0, 8).toUpperCase()}...
                                </TableCell>
                                <TableCell className="text-sm">
                                    {format(new Date(order.createdAt), "MMM d, yyyy")}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {currencySymbol}{Number(order.totalPrice || 0).toFixed(2)}
                                </TableCell>
                                <TableCell className="text-center">
                                    {order.isPaid ? (
                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 border-none">
                                            Paid
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                                            Pending
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge
                                        className={cn(
                                            "capitalize border-none",
                                            order.status === 'delivered' ? "bg-blue-100 text-blue-700" :
                                                order.status === 'processing' ? "bg-purple-100 text-purple-700" :
                                                    "bg-slate-100 text-slate-700"
                                        )}
                                    >
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
