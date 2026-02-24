// src/app/products/[slug]/page.tsx
import axios from "axios"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ChevronRight, Heart } from "lucide-react"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import api, { API_BASE_URL } from "@/lib/api"
import AddToCartButton from "@/components/common/AddToCartButton"
import ProductReviewForm from "./ProductReviewForm"
import ReviewItems from "./ReviewItems"
import ProductGallery from "./ProductGallery"
import WishlistToggleButton from "@/components/common/WishlistToggleButton"

// Type for product (adjust based on your backend response)
type Product = {
    _id: string
    name: string
    price: number
    discountPrice?: number
    description?: string
    image: string
    images?: string[]
    rating?: number
    numReviews?: number
    countInStock: number
    category: string
    brand?: string
    slug: string
    reviews?: Array<{
        _id: string
        name: string
        rating: number
        comment: string
        createdAt: string
        user: string
    }>
}

// Server component - fetch data on server
async function getProduct(slug: string): Promise<Product | null> {
    try {
        const res = await fetch(`${API_BASE_URL}/api/products/${slug}`, {
            next: { revalidate: 60 } // Cache for 60 seconds
        })
        if (!res.ok) return null
        return res.json()
    } catch (error) {
        return null
    }
}

async function getSettings() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/settings`, {
            next: { revalidate: 3600 } // Cache settings for 1 hour
        });
        if (!res.ok) throw new Error('Failed to fetch settings');
        return res.json();
    } catch (error) {
        return {
            storeName: "YourStore",
            currencySymbol: "$",
            shippingThreshold: 100,
        };
    }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const [product, settings] = await Promise.all([
        getProduct(slug),
        getSettings()
    ])

    if (!product) notFound()

    const {
        name,
        price,
        discountPrice,
        description = "No description available.",
        image,
        images = [],
        rating = 0,
        numReviews = 0,
        countInStock = 0,
        category,
        brand,
        reviews = [],
    } = product

    const inStock = countInStock > 0
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    return (
        <div className="container mx-auto px-4 py-6 md:py-12">
            {/* Breadcrumbs */}
            <nav className="mb-8 text-sm text-muted-foreground">
                <ol className="flex items-center gap-2">
                    <li><Link href="/" className="hover:text-foreground">Home</Link></li>
                    <ChevronRight className="h-4 w-4" />
                    <li><Link href="/products" className="hover:text-foreground">Products</Link></li>
                    <ChevronRight className="h-4 w-4" />
                    <li className="text-foreground font-medium truncate max-w-[200px]">{name}</li>
                </ol>
            </nav>

            <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start">
                {/* Image Gallery */}
                <div className="w-full max-w-2xl mx-auto lg:max-w-none">
                    <ProductGallery images={[image, ...images]} name={name} />
                </div>

                {/* Product Info */}
                <div className="space-y-6 md:space-y-8">
                    {/* Title & Category */}
                    <div>
                        <Badge variant="outline" className="mb-3 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                            {category}
                        </Badge>
                        {brand && (
                            <p className="text-sm text-muted-foreground mb-2">Brand: {brand}</p>
                        )}
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">{name}</h1>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-3">
                        <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn(
                                        "h-5 w-5",
                                        i < fullStars
                                            ? "fill-yellow-400 text-yellow-400"
                                            : i === fullStars && hasHalfStar
                                                ? "fill-yellow-400/50 text-yellow-400"
                                                : "text-muted-foreground"
                                    )}
                                />
                            ))}
                        </div>
                        <span className="text-lg font-medium">
                            {rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            ({numReviews} {numReviews === 1 ? "review" : "reviews"})
                        </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 sm:gap-4">
                        <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-600 dark:text-emerald-400">
                            {settings.currencySymbol}{Number(price).toFixed(2)}
                        </span>

                        {!!discountPrice && discountPrice < price && (
                            <div>
                                <span className="text-2xl text-muted-foreground line-through">
                                    {settings.currencySymbol}{Number(price).toFixed(2)}
                                </span>
                                <Badge variant="destructive" className="text-lg">
                                    -{Math.round(((price - discountPrice) / price) * 100)}%
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                            {description}
                        </p>
                    </div>

                    {/* Stock & Actions */}
                    <div className="space-y-6 pt-6 border-t">
                        <div className="flex items-center gap-4 text-lg">
                            <span className="font-medium">Availability:</span>
                            {inStock ? (
                                <span className="text-emerald-600 font-semibold">
                                    In Stock ({countInStock} available)
                                </span>
                            ) : (
                                <span className="text-red-600 font-semibold">Out of Stock</span>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <AddToCartButton
                                product={{
                                    _id: product._id,
                                    name: product.name,
                                    price: product.price,
                                    image: product.image,
                                    countInStock: product.countInStock
                                }}
                                size="lg"
                                className="flex-1"
                            />
                            <WishlistToggleButton
                                product={{
                                    _id: product._id,
                                    name: product.name,
                                    price: product.price,
                                    image: product.image,
                                    slug: product.slug
                                }}
                                variant="with-text"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t">
                        <Card className="text-center p-4">
                            <CardTitle className="text-sm font-medium">Free Shipping</CardTitle>
                            <CardDescription>On orders over {settings.currencySymbol}{settings.shippingThreshold}</CardDescription>
                        </Card>
                        <Card className="text-center p-4">
                            <CardTitle className="text-sm font-medium">30-Day Returns</CardTitle>
                            <CardDescription>Easy returns policy</CardDescription>
                        </Card>
                        <Card className="text-center p-4">
                            <CardTitle className="text-sm font-medium">Secure Payment</CardTitle>
                            <CardDescription>Encrypted checkout</CardDescription>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <section className="mt-16 border-t pt-12">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl md:text-3xl font-bold mb-8">Customer Reviews</h2>

                    <ReviewItems reviews={reviews} slug={slug} />

                    {/* Submission Form */}
                    <ProductReviewForm slug={slug} reviews={reviews} />
                </div>
            </section>
        </div>
    )
}