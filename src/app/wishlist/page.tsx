// src/app/wishlist/page.tsx
"use client"

import { useEffect } from "react"
import { useWishlistStore } from "@/store/wishlistStore"
import { useAuthStore } from "@/store/authStore"
import ProductCard from "@/components/common/ProductCard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Heart, ShoppingBag } from "lucide-react"

export default function WishlistPage() {
    const { items, fetchWishlist } = useWishlistStore()
    const { isAuthenticated, mounted } = useAuthStore()

    useEffect(() => {
        if (mounted && isAuthenticated) {
            fetchWishlist()
        }
    }, [mounted, isAuthenticated, fetchWishlist])

    if (!mounted) return null

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto">
                    <div className="p-4 bg-muted rounded-full">
                        <Heart className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h2 className="text-3xl font-bold">Your Wishlist</h2>
                    <p className="text-muted-foreground">Please log in to view and manage your saved products.</p>
                    <Button asChild size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700">
                        <Link href="/login?redirect=/wishlist">Log In</Link>
                    </Button>
                </div>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto">
                    <div className="p-4 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 rounded-full">
                        <Heart className="h-12 w-12" />
                    </div>
                    <h2 className="text-3xl font-bold">Your Wishlist is Empty</h2>
                    <p className="text-muted-foreground">Looks like you haven't saved any items yet. Start exploring our collection!</p>
                    <Button asChild size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700">
                        <Link href="/products">Explore Products</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-bold mb-2">My Wishlist</h1>
                    <p className="text-muted-foreground">You have {items.length} items saved in your wishlist.</p>
                </div>
                <Button asChild variant="outline" className="flex gap-2">
                    <Link href="/products">
                        <ShoppingBag className="h-4 w-4" />
                        Continue Shopping
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {items.map((product, index) => (
                    <ProductCard key={product._id} product={product} index={index} />
                ))}
            </div>
        </div>
    )
}
