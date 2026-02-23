"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ChevronRight, ShoppingBag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function OrderSuccessPage() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get("orderId")

    return (
        <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[70vh]">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-8 max-w-2xl w-full"
            >
                <div className="flex justify-center">
                    <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4">
                        <CheckCircle2 className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Thank you for your order!</h1>
                    <p className="text-xl text-muted-foreground">
                        Your payment has been processed and your order is being prepared.
                    </p>
                </div>

                <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <CardHeader>
                        <CardTitle className="text-lg">Order Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-left">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Order ID:</span>
                            <span className="font-mono font-medium">{orderId || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-semibold">
                                Confirmed
                            </span>
                        </div>
                        <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground text-center">
                                A confirmation email has been sent to your registered email address.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    {orderId && (
                        <Button asChild size="lg" className="flex-1 gap-2">
                            <Link href={`/orders/${orderId}`}>
                                View Order Details
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                    <Button asChild variant="outline" size="lg" className="flex-1 gap-2">
                        <Link href="/products">
                            <ShoppingBag className="h-4 w-4" />
                            Continue Shopping
                        </Link>
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
