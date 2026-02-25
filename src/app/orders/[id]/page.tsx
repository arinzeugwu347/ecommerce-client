"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "sonner"
import {
    Package,
    ChevronLeft,
    CreditCard,
    Truck,
    Calendar,
    Hash,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2
} from "lucide-react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { useSettings } from "@/components/providers/SettingsProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface OrderItem {
    product: string
    quantity: number
    priceAtPurchase: number
    name: string
    image: string
}

interface Order {
    _id: string
    createdAt: string
    orderItems: OrderItem[]
    shippingAddress: {
        address: string
        city: string
        postalCode: string
        country: string
    }
    paymentMethod: string
    paymentResult?: {
        id: string
        status: string
    }
    taxPrice: number
    shippingPrice: number
    totalPrice: number
    itemsPrice: number
    isPaid: boolean
    paidAt?: string
    isDelivered: boolean
    deliveredAt?: string
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
}

export default function OrderDetailsPage() {
    const { id } = useParams()
    const { isAuthenticated, mounted, setMounted } = useAuthStore()
    const { currencySymbol } = useSettings()
    const router = useRouter()
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setMounted(true)
    }, [setMounted])

    useEffect(() => {
        if (mounted && !isAuthenticated) {
            router.push(`/login?redirect=/orders/${id}`)
            return
        }

        const fetchOrder = async () => {
            try {
                setLoading(true)
                const { data } = await api.get(`/orders/${id}`)
                setOrder(data)
                setError(null)
            } catch (err: any) {
                const message = err.response?.data?.message || "Order not found or access denied"
                setError(message)
                toast.error("Failed to load order", { description: message })
            } finally {
                setLoading(false)
            }
        }

        if (isAuthenticated && id) {
            fetchOrder()
        }
    }, [isAuthenticated, mounted, id, router])

    if (!mounted || loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
                <p className="text-muted-foreground animate-pulse">Loading order details...</p>
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-full mb-6">
                    <AlertCircle className="h-16 w-16 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Error Loading Order</h1>
                <p className="text-muted-foreground mb-8 max-w-sm">
                    {error || "We couldn't retrieve the details for this order."}
                </p>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => router.back()}>
                        Go Back
                    </Button>
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                        <Link href="/orders">View My Orders</Link>
                    </Button>
                </div>
            </div>
        )
    }

    const itemsPrice = (order.orderItems || []).reduce((acc, item) => acc + Number(item.priceAtPurchase || 0) * item.quantity, 0)

    const statusConfig = {
        pending: { color: "bg-slate-100 text-slate-700", icon: Clock },
        processing: { color: "bg-purple-100 text-purple-700", icon: Loader2 },
        shipped: { color: "bg-emerald-100 text-emerald-700", icon: Truck },
        delivered: { color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
        cancelled: { color: "bg-red-100 text-red-700", icon: AlertCircle },
    }

    const StatusIcon = statusConfig[order.status]?.icon || Clock

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="space-y-2">
                    <Button variant="ghost" size="sm" asChild className="-ml-3 text-muted-foreground hover:text-emerald-600 transition-colors">
                        <Link href="/orders" className="gap-2">
                            <ChevronLeft className="h-4 w-4" />
                            Back to My Orders
                        </Link>
                    </Button>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Order Details</h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Hash className="h-3.5 w-3.5" />
                            <span className="font-mono">{order._id.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}</span>
                        </div>
                    </div>
                </div>

                <Badge className={cn("px-4 py-1.5 text-sm font-semibold capitalize", statusConfig[order.status]?.color)}>
                    <StatusIcon className="h-4 w-4 mr-2" />
                    {order.status}
                </Badge>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Items and Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Order Items */}
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/30 py-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Package className="h-5 w-5 text-emerald-600" />
                                Order Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y p-0">
                            {order.orderItems.map((item, idx) => (
                                <div key={idx} className="flex gap-4 p-6 hover:bg-muted/10 transition-colors">
                                    <div className="relative h-20 w-20 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            sizes="80px"
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0 py-1">
                                        <h4 className="font-semibold text-base line-clamp-1">{item.name}</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {item.quantity} × {currencySymbol}{Number(item.priceAtPurchase || 0).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="text-right py-1">
                                        <p className="font-bold">{currencySymbol}{(item.quantity * Number(item.priceAtPurchase || 0)).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Shipping & Payment */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Shipping */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="py-4 border-b">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-emerald-600" />
                                    Shipping Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-1">
                                    <p className="font-medium">{useAuthStore.getState().user?.name}</p>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {order.shippingAddress.address}<br />
                                        {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                                        {order.shippingAddress.country}
                                    </p>
                                </div>
                                <div className="pt-4 mt-4 border-t">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Delivery Status:</span>
                                        {order.isDelivered ? (
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-none">
                                                Delivered {order.deliveredAt && format(new Date(order.deliveredAt), "MMM d, yyyy")}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-slate-500 bg-slate-50">
                                                Not Delivered
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="py-4 border-b">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-emerald-600" />
                                    Payment Method
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-1">
                                    <p className="font-medium capitalize">{order.paymentMethod}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1.2 mt-1">
                                        <Hash className="h-3 w-3" />
                                        ID: {order.paymentResult?.id || "N/A"}
                                    </p>
                                </div>
                                <div className="pt-4 mt-4 border-t">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Payment Status:</span>
                                        {order.isPaid ? (
                                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-none">
                                                Paid {order.paidAt && format(new Date(order.paidAt), "MMM d, yyyy")}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                                                Pending Payment
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column: Summary */}
                <div className="lg:col-span-1">
                    <Card className="border-none shadow-sm sticky top-24 overflow-hidden border-t-4 border-t-emerald-600">
                        <CardHeader className="py-4 border-b">
                            <CardTitle className="text-lg">Price Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{currencySymbol}{Number(itemsPrice || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>{currencySymbol}{Number(order.shippingPrice || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax</span>
                                <span>{currencySymbol}{Number(order.taxPrice || 0).toFixed(2)}</span>
                            </div>
                            <Separator className="my-4" />
                            <div className="flex justify-between items-center text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                <span>Total</span>
                                <span>{currencySymbol}{Number(order.totalPrice || 0).toFixed(2)}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/30 pt-4 flex flex-col gap-3">
                            <p className="text-xs text-muted-foreground text-center italic">
                                Thank you for shopping with us!
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
