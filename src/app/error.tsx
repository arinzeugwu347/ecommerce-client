"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCcw, Home } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Frontend Error Boundary caught:', error.message, error.stack, error.digest)
    }, [error])

    return (
        <div className="container flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-6 mb-8">
                <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>

            <h1 className="text-4xl font-bold tracking-tight mb-4">Something went wrong!</h1>
            <p className="text-xl text-muted-foreground max-w-md mx-auto mb-10">
                We apologize for the inconvenience. An unexpected error has occurred and our team has been notified.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => reset()} size="lg" className="gap-2 bg-red-600 hover:bg-red-700">
                    <RefreshCcw className="h-4 w-4" />
                    Try again
                </Button>
                <Button variant="outline" size="lg" asChild className="gap-2">
                    <Link href="/">
                        <Home className="h-4 w-4" />
                        Go to Homepage
                    </Link>
                </Button>
            </div>
        </div>
    )
}
