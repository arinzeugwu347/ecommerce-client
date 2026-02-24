"use client"

import { useState } from "react"
import { Heart, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useWishlistStore } from "@/store/wishlistStore"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface WishlistToggleButtonProps {
    product: {
        _id: string
        name: string
        price: number
        image: string
        slug: string
    }
    variant?: "icon" | "with-text"
    className?: string
}

export default function WishlistToggleButton({
    product,
    variant = "icon",
    className
}: WishlistToggleButtonProps) {
    const [loading, setLoading] = useState(false)
    const { isAuthenticated } = useAuthStore()
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore()
    const router = useRouter()

    const isFavorited = isInWishlist(product._id)

    const handleWishlistToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!isAuthenticated) {
            toast.error("Please login to use wishlist")
            router.push("/login")
            return
        }

        if (loading) return

        setLoading(true)
        try {
            if (isFavorited) {
                await removeFromWishlist(product._id)
                toast.success("Removed from wishlist")
            } else {
                // @ts-ignore - store expects a slightly different type but we have the essentials
                await addToWishlist(product)
                toast.success("Added to wishlist")
            }
        } catch (error) {
            toast.error("Action failed")
        } finally {
            setLoading(false)
        }
    }

    if (variant === "with-text") {
        return (
            <Button
                size="lg"
                variant="outline"
                className={cn("flex-1 gap-2 border-2 transition-all duration-300",
                    isFavorited ? "text-red-600 border-red-100 bg-red-50 hover:bg-red-100" : "hover:border-emerald-500",
                    className)}
                onClick={handleWishlistToggle}
                disabled={loading}
            >
                {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <Heart className={cn("h-5 w-5 transition-transform duration-300", isFavorited && "fill-current scale-110")} />
                )}
                {isFavorited ? "In Wishlist" : "Add to Wishlist"}
            </Button>
        )
    }

    return (
        <button
            onClick={handleWishlistToggle}
            className={cn(
                "p-2.5 rounded-full shadow-xl transition-all duration-300 z-20",
                isFavorited
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-white/90 text-gray-900 hover:bg-white dark:bg-black/60 dark:text-gray-100 backdrop-blur-md border border-white/20",
                loading && "opacity-80 scale-95",
                className
            )}
            disabled={loading}
        >
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    >
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="heart"
                        initial={{ scale: 1 }}
                        whileTap={{ scale: 0.8 }}
                        animate={{ scale: isFavorited ? 1.1 : 1 }}
                    >
                        <Heart className={cn("h-5 w-5 transition-colors", isFavorited && "fill-current")} />
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    )
}
