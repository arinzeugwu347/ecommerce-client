"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCcw, Home } from "lucide-react"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // You could log to an external service here
    }, [error])

    return (
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-background">
                    <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-6 mb-8">
                        <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                    </div>

                    <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">A critical error occurred</h1>
                    <p className="text-xl text-muted-foreground max-w-md mx-auto mb-10">
                        The application encountered an unexpected error. We apologize for the inconvenience.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button onClick={() => reset()} size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                            <RefreshCcw className="h-4 w-4" />
                            Attempt Recovery
                        </Button>
                        <Button variant="outline" size="lg" asChild className="gap-2">
                            <Link href="/">
                                <Home className="h-4 w-4" />
                                Return Home
                            </Link>
                        </Button>
                    </div>
                </div>
            </body>
        </html>
    )
}
