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
    AlertCircle,
    Layers,
    Menu,
    LogOut
} from "lucide-react"
import { useState } from "react"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import { useSettings } from "@/components/providers/SettingsProvider"
import AdminRoute from "./AdminRoute"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"

const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: Layers },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Users", href: "/admin/users", icon: Users },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const { maintenanceMode } = useSettings()
    const { logout } = useAuthStore()
    const [open, setOpen] = useState(false)

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b flex items-center justify-between">
                <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight" onClick={() => setOpen(false)}>
                    <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                        <Package className="h-5 w-5" />
                    </div>
                    <span>Admin</span>
                </Link>
            </div>

            {maintenanceMode && (
                <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase">
                        <Hammer className="h-3 w-3" />
                        Maintenance Active
                    </div>
                </div>
            )}

            <div className="flex-1 p-6 overflow-y-auto">
                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
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

            <div className="p-6 border-t space-y-2">
                <Link
                    href="/admin/settings"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                </Link>
                <button
                    onClick={() => {
                        logout()
                        router.push("/")
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all duration-200"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    )

    return (
        <AdminRoute>
            <div className="flex flex-col md:flex-row min-h-screen bg-background">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between px-6 py-4 border-b bg-card sticky top-0 z-40">
                    <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-lg">
                        <div className="bg-primary text-primary-foreground p-1 rounded-md">
                            <Package className="h-4 w-4" />
                        </div>
                        <span>Admin</span>
                    </Link>
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-64">
                            <SheetHeader className="sr-only">
                                <SheetTitle>Admin Navigation</SheetTitle>
                            </SheetHeader>
                            <SidebarContent />
                        </SheetContent>
                    </Sheet>
                </header>

                {/* Desktop Sidebar */}
                <aside className="hidden md:flex flex-col w-64 border-r bg-card h-screen sticky top-0">
                    <SidebarContent />
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto bg-muted/10">
                    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </AdminRoute>
    )
}
