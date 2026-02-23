"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import AdminLayout from "@/components/admin/AdminLayout"
import {
    TrendingUp,
    ShoppingCart,
    Package,
    Users,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react"
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import Link from "next/link"
import { Eye, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { useSettings } from "@/components/providers/SettingsProvider"
import { useTheme } from "next-themes"

export default function AdminDashboardPage() {
    const [mounted, setMounted] = useState(false)
    const { currencySymbol } = useSettings()
    const { theme, resolvedTheme } = useTheme()
    const { data, isLoading } = useQuery({
        queryKey: ["admin-stats"],
        queryFn: () => api.get("/admin/stats").then(res => res.data),
    })

    useEffect(() => {
        setMounted(true)
    }, [])

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-card rounded-xl border"></div>
                    ))}
                </div>
                <div className="mt-8 h-[400px] bg-card rounded-xl border animate-pulse"></div>
            </AdminLayout>
        )
    }

    const {
        stats = {},
        salesData = [],
        recentOrders = [],
        lowStockProducts = []
    } = data || {}

    const statCards = [
        {
            name: "Total Revenue",
            value: `${currencySymbol}${Number(stats.sales || 0).toFixed(2)}`,
            icon: TrendingUp,
            color: "text-emerald-500",
            trend: "+12.5%",
            isPositive: true
        },
        {
            name: "Orders",
            value: stats.orders,
            icon: ShoppingCart,
            color: "text-blue-500",
            trend: "+8.2%",
            isPositive: true
        },
        {
            name: "Products",
            value: stats.products,
            icon: Package,
            color: "text-orange-500",
            trend: "+3",
            isPositive: true
        },
        {
            name: "Customers",
            value: stats.users,
            icon: Users,
            color: "text-purple-500",
            trend: "-2%",
            isPositive: false
        },
    ]

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                    <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat) => (
                        <div key={stat.name} className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn("p-2 rounded-lg bg-background", stat.color)}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <div className={cn(
                                    "flex items-center text-xs font-medium px-2 py-1 rounded-full",
                                    stat.isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                )}>
                                    {stat.isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                                    {stat.trend}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.name}</p>
                                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-card p-8 rounded-xl border shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-semibold">Sales Analytics</h2>
                            <p className="text-sm text-muted-foreground">Sales performance over the last 30 days</p>
                        </div>
                        <select className="bg-background border rounded-lg px-3 py-2 text-sm">
                            <option>Last 30 Days</option>
                            <option>Last 7 Days</option>
                        </select>
                    </div>

                    <div className="h-[350px] w-full min-h-[350px]">
                        {mounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                                    <XAxis
                                        dataKey="date"
                                        stroke={resolvedTheme === 'dark' ? '#fff' : 'hsl(var(--muted-foreground))'}
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(str) => {
                                            const date = new Date(str)
                                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                        }}
                                    />
                                    <YAxis
                                        stroke={resolvedTheme === 'dark' ? '#fff' : 'hsl(var(--muted-foreground))'}
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${currencySymbol}${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            borderColor: 'hsl(var(--border))',
                                            borderRadius: '8px',
                                            fontSize: '12px'
                                        }}
                                        itemStyle={{ color: 'hsl(var(--primary))' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="sales"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorSales)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Sales */}
                    <div className="bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b bg-muted/30 flex items-center justify-between">
                            <h2 className="text-lg font-bold">Recent Sales</h2>
                            <Link href="/admin/orders" className="text-xs text-primary font-bold hover:underline">View All</Link>
                        </div>
                        <div className="flex-1">
                            {recentOrders.length === 0 ? (
                                <div className="text-sm text-muted-foreground text-center py-12 italic">
                                    No recent orders found.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/10 text-left">
                                                <th className="px-4 py-3 font-semibold text-muted-foreground">Order</th>
                                                <th className="px-4 py-3 font-semibold text-muted-foreground">User</th>
                                                <th className="px-4 py-3 font-semibold text-muted-foreground">Price</th>
                                                <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {recentOrders.map((order: any) => (
                                                <tr key={order._id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-4 py-3 font-medium uppercase text-[10px] tracking-tight text-muted-foreground">
                                                        #{order._id.slice(-6)}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium">{order.user?.name || "User"}</td>
                                                    <td className="px-4 py-3 font-bold">{currencySymbol}{order.totalPrice.toFixed(2)}</td>
                                                    <td className="px-4 py-3">
                                                        {order.isPaid ? (
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                        ) : (
                                                            <Clock className="h-4 w-4 text-amber-500" />
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Inventory Alerts */}
                    <div className="bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b bg-muted/30 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold">Inventory Alerts</h2>
                                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                                    {lowStockProducts.length}
                                </span>
                            </div>
                            <Link href="/admin/products" className="text-xs text-primary font-bold hover:underline">Manage All</Link>
                        </div>
                        <div className="p-4 flex-1 space-y-3">
                            {lowStockProducts.length === 0 ? (
                                <div className="text-sm text-muted-foreground text-center py-12 italic">
                                    All products are well stocked!
                                </div>
                            ) : (
                                lowStockProducts.map((product: any) => (
                                    <div key={product._id} className="flex items-center justify-between p-3 rounded-lg border bg-background group hover:border-red-500/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 relative rounded-md overflow-hidden bg-muted border">
                                                <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold truncate max-w-[150px]">{product.name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase">{product.category}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1.5 justify-end text-red-500 font-bold">
                                                <AlertTriangle className="h-3.5 w-3.5" />
                                                <span className="text-sm">{product.countInStock}</span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground italic">Left in stock</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
