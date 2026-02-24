"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    ChevronRight,
    Hammer,
    AlertCircle
} from "lucide-react"
import api from "@/lib/api" // Added api import
import { cn } from "@/lib/utils"
import { useSettings } from "@/components/providers/SettingsProvider" // Added useSettings import
import AdminRoute from "./AdminRoute"

const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: LayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Users", href: "/admin/users", icon: Users },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { maintenanceMode } = useSettings() // Added useSettings hook call

    return (
        <AdminRoute>
            <div className="flex min-h-[calc(100vh-4rem)] bg-background">
                {/* Sidebar */}
                <aside className="hidden md:flex flex-col w-64 border-r bg-card h-screen sticky top-0 transition-all duration-300"> {/* Modified aside classes */}
                    <div className="p-6 border-b flex items-center justify-between"> {/* Modified div inside aside */}
                        <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                                <Package className="h-5 w-5" />
                            </div>
                            <span>Admin</span>
                        </Link>
                    </div>

                    {maintenanceMode && ( // Added maintenanceMode banner
                        <div className="px-4 py-3 bg-amber-500/10 border-b border-amber-500/20">
                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase">
                                <Hammer className="h-3 w-3" />
                                Maintenance Active
                            </div>
                        </div>
                    )}

                    <div className="p-6">
                        <nav className="space-y-1">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        )}
                                    >
                                        <item.icon className={cn(
                                            "h-4 w-4 transition-transform duration-200",
                                            isActive ? "scale-110" : "group-hover:scale-110"
                                        )} />
                                        <span className="flex-1">{item.name}</span>
                                        {isActive && <ChevronRight className="h-3 w-3 opacity-50" />}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    <div className="absolute bottom-8 left-0 right-0 px-6">
                        <Link
                            href="/admin/settings"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                        >
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    <div className="max-w-7xl mx-auto p-8">
                        {children}
                    </div>
                </main>
            </div>
        </AdminRoute>
    )
}
