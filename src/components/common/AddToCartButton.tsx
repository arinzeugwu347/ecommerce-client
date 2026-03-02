"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import axios from "axios"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore"

interface AddToCartButtonProps {
    product: {
        _id: string
        name: string
        price: number
        image: string
        countInStock: number
    }
    className?: string
    size?: "default" | "sm" | "lg" | "icon"
    showText?: boolean
}

export default function AddToCartButton({
    product,
    className,
    size = "default",
    showText = true,
}: AddToCartButtonProps) {
    const [loading, setLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const countInStock = product.countInStock ?? 0
    const inStock = countInStock > 0

    const addToCartHandler = async (e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigation if in a Link
        e.stopPropagation() // Prevent bubbling

        if (!inStock || loading) return

        setLoading(true)
        try {
            // Update Zustand
            useCartStore.getState().addItem({
                product,
                quantity: 1,
                priceAtAdd: product.price
            })

            // Only call backend if authenticated
            if (useAuthStore.getState().isAuthenticated) {
                await api.post('/cart', { productId: product._id, quantity: 1 })
            }

            toast.success("Added to cart", {
                description: `${product.name} × 1`,
                action: {
                    label: "View Cart",
                    onClick: () => window.location.href = "/cart",
                },
            })

            setIsSuccess(true)
            setTimeout(() => setIsSuccess(false), 2000)
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message
                : (err instanceof Error ? err.message : "Please try again")

            toast.error("Failed to add to cart", {
                description: errorMessage || "Please try again",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            size={size}
            className={cn(
                "relative font-bold transition-all duration-300 overflow-hidden",
                isSuccess
                    ? "bg-emerald-500 hover:bg-emerald-500 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-emerald-500/20",
                !showText && "rounded-full p-2 h-10 w-10",
                className
            )}
            disabled={!inStock || loading}
            onClick={addToCartHandler}
        >
            <div className="flex items-center justify-center gap-2">
                <ShoppingCart className={cn("h-4 w-4 transition-transform", loading && "animate-bounce")} />
                {showText && (
                    <span className="whitespace-nowrap">
                        {inStock ? (loading ? "Adding..." : (isSuccess ? "Added!" : "Add to Cart")) : "Out of Stock"}
                    </span>
                )}
            </div>
        </Button>
    )
}
