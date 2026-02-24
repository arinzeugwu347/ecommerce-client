// src/app/cart/page.tsx
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { useCartStore, CartItem } from "@/store/cartStore"
import { useEffect } from "react"
import { useSettings } from "@/components/providers/SettingsProvider"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"

interface CartResponse {
    items: CartItem[]
    // Add other cart fields if they exist (e.g. subtotal, totals)
}
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingCart as CartIcon, Trash2, Plus, Minus, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function CartPage() {
    const queryClient = useQueryClient()
    const { currencySymbol } = useSettings()
    const { items, updateQuantity, removeItem } = useCartStore()
    const { isAuthenticated } = useAuthStore()
    const router = useRouter()
    const isLoading = false // We can handle this better, but for now Navbar pre-fetches

    // Mutation for updating cart on backend
    const updateCartMutation = useMutation({
        mutationFn: (updates: { productId: string; quantity: number }) =>
            api.put(`/cart/${updates.productId}`, { quantity: updates.quantity }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] })
            toast.success("Cart updated")
        },
        onError: () => toast.error("Failed to update cart"),
    })

    // Mutation for removing item
    const removeItemMutation = useMutation({
        mutationFn: (productId: string) => api.delete(`/cart/${productId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] })
            toast.success("Item removed")
        },
        onError: () => toast.error("Failed to remove item"),
    })

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + item.quantity * Number(item.priceAtAdd || 0), 0)

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
                <div className="space-y-6">
                    {Array(3).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6 max-w-md"
                >
                    <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                        <CartIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Your cart is empty</h2>
                    <p className="text-muted-foreground text-lg">
                        Looks like you haven't added anything to your cart yet. Discover our latest arrivals and start shopping!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                            <Link href="/products">Start Shopping</Link>
                        </Button>
                        <Button variant="outline" size="lg" asChild>
                            <Link href="/">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Return Home
                            </Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-10">Your Cart</h1>

            <div className="grid lg:grid-cols-3 gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                    {items.map((item) => (
                        <Card key={item.product._id} className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex flex-col sm:flex-row">
                                    {/* Image */}
                                    <div className="relative w-full sm:w-40 h-40 flex-shrink-0">
                                        <Image
                                            src={item.product.image}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                            loading="eager"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 p-6 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-semibold text-lg line-clamp-2">
                                                {item.product.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {currencySymbol}{Number(item.priceAtAdd || 0).toFixed(2)} each
                                            </p>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between">
                                            {/* Quantity */}
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    disabled={item.quantity <= 1}
                                                    onClick={() => {
                                                        updateCartMutation.mutate(
                                                            { productId: item.product._id, quantity: item.quantity - 1 },
                                                            {
                                                                onSuccess: () => updateQuantity(item.product._id, item.quantity - 1),
                                                            }
                                                        )
                                                    }}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>

                                                <span className="w-12 text-center font-medium">{item.quantity}</span>

                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    disabled={item.quantity >= item.product.countInStock}
                                                    onClick={() => {
                                                        updateCartMutation.mutate(
                                                            { productId: item.product._id, quantity: item.quantity + 1 },
                                                            {
                                                                onSuccess: () => updateQuantity(item.product._id, item.quantity + 1),
                                                            }
                                                        )
                                                    }}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            {/* Subtotal & Remove */}
                                            <div className="flex items-center gap-6">
                                                <span className="font-semibold">
                                                    {currencySymbol}{(item.quantity * Number(item.priceAtAdd || 0)).toFixed(2)}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => {
                                                        removeItemMutation.mutate(item.product._id, {
                                                            onSuccess: () => removeItem(item.product._id),
                                                        })
                                                    }}
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex justify-between text-lg">
                                <span>Subtotal</span>
                                <span>{currencySymbol}{subtotal.toFixed(2)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-xl font-bold">
                                <span>Total</span>
                                <span>{currencySymbol}{subtotal.toFixed(2)}</span>
                            </div>

                            <Button
                                className="w-full bg-emerald-600 hover:bg-emerald-700"
                                size="lg"
                                onClick={() => {
                                    if (!isAuthenticated) {
                                        toast.error("Please login to proceed to checkout")
                                        router.push("/login?redirect=/checkout")
                                    } else {
                                        router.push("/checkout")
                                    }
                                }}
                            >
                                Proceed to Checkout
                            </Button>

                            <p className="text-center text-sm text-muted-foreground">
                                Taxes and shipping calculated at checkout
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}