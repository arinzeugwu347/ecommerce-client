"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import AdminRoute from "./AdminRoute"

const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Users", href: "/admin/users", icon: Users },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <AdminRoute>
            <div className="flex min-h-[calc(100vh-4rem)] bg-background">
                {/* Sidebar */}
                <aside className="w-64 border-r bg-card/50 backdrop-blur-sm sticky top-16 h-[calc(100vh-4rem)]">
                    <div className="p-6">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                            Management
                        </h2>
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
