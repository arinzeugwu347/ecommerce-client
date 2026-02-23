"use client"

import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { X } from "lucide-react"

export default function AdminRoute({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, mounted: storeMounted } = useAuthStore()
    const router = useRouter()
    const [hydrated, setHydrated] = useState(false)

    useEffect(() => {
        // Wait for store to hydrate
        setHydrated(true)
    }, [])

    useEffect(() => {
        if (hydrated && storeMounted && (!isAuthenticated || user?.role !== 'admin')) {
            router.push('/')
        }
    }, [isAuthenticated, user, storeMounted, hydrated, router])

    if (!hydrated || !storeMounted) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!isAuthenticated || user?.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <div className="bg-red-500/10 text-red-500 p-4 rounded-full mb-4">
                    <X className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-muted-foreground max-w-sm mb-6">
                    You do not have the necessary permissions to access this page. Please log in with an administrator account.
                </p>
                <button
                    onClick={() => router.push('/')}
                    className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-all"
                >
                    Back to Home
                </button>
            </div>
        )
    }

    return <>{children}</>
}
