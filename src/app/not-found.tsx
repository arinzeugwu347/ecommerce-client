"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Ghost, Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
    return (
        <div className="container flex flex-1 flex-col items-center justify-center text-center px-4">
            <div className="relative mb-8">
                <Ghost className="h-24 w-24 text-muted-foreground/20 animate-bounce" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl font-bold opacity-10 select-none">
                    404
                </div>
            </div>

            <h1 className="text-4xl font-bold tracking-tight mb-4">Page Not Found</h1>
            <p className="text-xl text-muted-foreground max-w-md mx-auto mb-10">
                Oops! The page you're looking for doesn't exist or has been moved.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="gap-2">
                    <Link href="/">
                        <Home className="h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
                <Button variant="outline" size="lg" className="gap-2" onClick={() => window.history.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    Go Back
                </Button>
            </div>
        </div>
    )
}
