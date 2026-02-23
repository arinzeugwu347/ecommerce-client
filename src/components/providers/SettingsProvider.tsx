"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { Loader2, Hammer } from "lucide-react"
import { usePathname } from "next/navigation"

interface Settings {
    storeName: string
    storeEmail: string
    currency: string
    currencySymbol: string
    taxRate: number
    shippingThreshold: number
    flatShippingRate: number
    lowStockThreshold: number
    maintenanceMode: boolean
}

const SettingsContext = createContext<Settings | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const { user, mounted } = useAuthStore()
    const pathname = usePathname()
    const isAdmin = user?.role === 'admin'

    const { data: settings, isLoading } = useQuery({
        queryKey: ["admin-settings"],
        queryFn: () => api.get("/settings").then(res => res.data),
        staleTime: 1000 * 60 * 10, // 10 minutes
    })

    if (!mounted || isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const defaultSettings: Settings = {
        storeName: "E-Commerce App",
        storeEmail: "admin@example.com",
        currency: "USD",
        currencySymbol: "$",
        taxRate: 0.15,
        shippingThreshold: 100,
        flatShippingRate: 10,
        lowStockThreshold: 5,
        maintenanceMode: false,
    }

    const effectiveSettings = settings ? { ...defaultSettings, ...settings } : defaultSettings

    // Maintenance Mode Check
    // We allow access to /admin and /login even in maintenance mode so admins can fix things
    const isPublicRoute = !pathname?.startsWith('/admin') && pathname !== '/login'

    if (effectiveSettings.maintenanceMode && !isAdmin && isPublicRoute) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
                <div className="mb-6 rounded-full bg-primary/10 p-6 text-primary">
                    <Hammer className="h-12 w-12" />
                </div>
                <h1 className="mb-2 text-4xl font-bold tracking-tight uppercase">Under Maintenance</h1>
                <p className="max-w-md text-lg text-muted-foreground">
                    We're currently performing some scheduled maintenance to improve our service.
                    We'll be back online shortly!
                </p>
                <div className="mt-8 text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} {effectiveSettings.storeName}
                </div>
            </div>
        )
    }

    return (
        <SettingsContext.Provider value={effectiveSettings}>
            {children}
        </SettingsContext.Provider>
    )
}

export const useSettings = () => {
    const context = useContext(SettingsContext)
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider")
    }
    return context
}
