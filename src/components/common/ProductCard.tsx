// src/components/common/ProductCard.tsx
"use client"

import Image from "next/image"
import Link from "next/link"

import { motion, Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import AddToCartButton from "./AddToCartButton"
import WishlistToggleButton from "./WishlistToggleButton"
import { useSettings } from "@/components/providers/SettingsProvider"
import { useRouter } from "next/navigation"

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
    const router = useRouter()

    const handleCardClick = () => {
        router.push(`/products/${product.slug}`)
    }

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
            className={cn("h-full cursor-pointer flex flex-col group/card", className)}
            style={{ willChange: "transform, opacity" }}
            onClick={handleCardClick}
        >
            <div className="relative flex-1 flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-2xl hover:border-emerald-500/30">
                {/* Image Section */}
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        priority={index < 4}
                        className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />

                    {/* Overlay for hover depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />

                    {/* Badges Left */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                        {product.isNew && (
                            <Badge className="bg-emerald-500 text-white border-0 shadow-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                                New Arrival
                            </Badge>
                        )}
                        {!!product.discount && (
                            <Badge variant="destructive" className="shadow-lg px-2 py-1 text-[10px] font-bold">
                                -{product.discount}%
                            </Badge>
                        )}
                    </div>

                    {/* Wishlist Button - Refined */}
                    <WishlistToggleButton
                        product={{
                            _id: product._id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                            slug: product.slug
                        }}
                        className="absolute top-4 right-4 scale-90 group-hover/card:scale-100"
                    />

                    {/* Stock status overlay */}
                    {product.countInStock === 0 && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                            <Badge variant="outline" className="bg-white/90 text-red-600 border-red-200 font-bold px-4 py-2 text-xs uppercase tracking-widest shadow-sm">
                                Sold Out
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex flex-col p-5 space-y-3">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                            {/* Category Placeholder if available */}
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70">
                                Premium Collection
                            </span>
                            {/* Rating Mini */}
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-muted rounded-full overflow-hidden">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-[10px] font-bold leading-none">{rating.toFixed(1)}</span>
                            </div>
                        </div>
                        <h3 className="line-clamp-1 text-base font-bold text-foreground group-hover/card:text-emerald-600 dark:group-hover/card:text-emerald-400 transition-colors">
                            {product.name}
                        </h3>
                    </div>

                    <div className="flex items-end justify-between gap-4 pt-1">
                        <div className="flex flex-col">
                            {!!product.discount && (
                                <span className="text-xs text-muted-foreground line-through opacity-70 mb-0.5">
                                    {currencySymbol}{(Number(product.price || 0) / (1 - (product.discount || 0) / 100)).toFixed(2)}
                                </span>
                            )}
                            <span className="text-xl font-black text-foreground">
                                {currencySymbol}{Number(product.price || 0).toFixed(2)}
                            </span>
                        </div>

                        <div onClick={(e) => e.stopPropagation()}>
                            <AddToCartButton
                                product={{
                                    _id: product._id,
                                    name: product.name,
                                    price: product.price,
                                    image: product.image,
                                    countInStock: product.countInStock || 0
                                }}
                                showText={false}
                                size="icon"
                                className="h-11 w-11 rounded-xl shadow-lg hover:rotate-6 active:scale-90 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
