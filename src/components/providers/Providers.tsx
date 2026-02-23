"use client"

import { useState, useEffect } from "react"
import { ThemeProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { useAuthStore } from "@/store/authStore"
import { SettingsProvider } from "./SettingsProvider"

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
            },
        },
    }))

    const setMounted = useAuthStore((state) => state.setMounted)

    useEffect(() => {
        setMounted(true)
    }, [setMounted])

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <QueryClientProvider client={queryClient}>
                <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
                    <SettingsProvider>
                        {children}
                    </SettingsProvider>
                </GoogleOAuthProvider>
            </QueryClientProvider>
        </ThemeProvider>
    )
}
