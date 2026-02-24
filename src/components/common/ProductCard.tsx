// src/components/common/ProductCard.tsx
"use client"

import Image from "next/image"
import Link from "next/link"

import { motion, Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import AddToCartButton from "./AddToCartButton"
import { useSettings } from "@/components/providers/SettingsProvider"

interface Product {
    _id: string
    name: string
    price: number
    image: string
    slug: string
    rating?: number
    numReviews?: number
    isNew?: boolean
    discount?: number
    countInStock?: number
}

interface ProductCardProps {
    product: Product
    index?: number // for stagger animation
    className?: string
}

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.08,
            duration: 0.5,
            ease: "easeOut",
        },
    }),
    hover: {
        y: -8,
        scale: 1.03,
        transition: { duration: 0.25 },
    },
}

export default function ProductCard({ product, index = 0, className }: ProductCardProps) {
    const { currencySymbol } = useSettings()
    const rating = product.rating || 0
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    return (
        <motion.div
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches ? "hover" : undefined}
            className={cn("h-full", className)}
            style={{ willChange: "transform, opacity" }}
        >
            <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        priority={index < 4}
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.isNew && (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                New
                            </Badge>
                        )}
                        {!!product.discount && (
                            <Badge variant="destructive">
                                -{product.discount}%
                            </Badge>
                        )}
                    </div>

                    {/* Stock badge */}
                    {product.countInStock === 0 && (
                        <Badge variant="outline" className="absolute top-3 right-3 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            Out of Stock
                        </Badge>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                    <h3 className="line-clamp-2 text-lg font-semibold leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        <Link href={`/products/${product.slug}`} className="hover:underline">
                            {product.name}
                        </Link>
                    </h3>

                    {/* Rating */}
                    <div className="mt-2 flex items-center gap-1 text-sm">
                        <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn(
                                        "h-4 w-4",
                                        i < fullStars
                                            ? "fill-yellow-400 text-yellow-400"
                                            : i === fullStars && hasHalfStar
                                                ? "fill-yellow-400/50 text-yellow-400"
                                                : "text-muted-foreground"
                                    )}
                                />
                            ))}
                        </div>
                        <span className="text-muted-foreground">
                            ({product.numReviews || 0})
                        </span>
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {currencySymbol}{Number(product.price || 0).toFixed(2)}
                        </span>
                        {!!product.discount && (
                            <span className="text-sm text-muted-foreground line-through">
                                {currencySymbol}{(Number(product.price || 0) / (1 - (product.discount || 0) / 100)).toFixed(2)}
                            </span>
                        )}
                    </div>

                    {/* Add to Cart */}
                    <AddToCartButton
                        product={{
                            _id: product._id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                            countInStock: product.countInStock || 0
                        }}
                        className="mt-auto"
                    />
                </div>
            </div>
        </motion.div>
    )
}