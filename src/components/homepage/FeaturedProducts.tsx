// src/components/homepage/FeaturedProducts.tsx
"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { motion, Variants } from "framer-motion"
import ProductCard from "@/components/common/ProductCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"


export default function FeaturedProducts() {

    const { data, isLoading, error } = useQuery({
        queryKey: ["featured-products"],
        queryFn: async () => {
            const res = await api.get("/products", {
                params: { featured: true, limit: 8 },
            })

            // Convert prices to numbers right after fetch
            const products = (res.data.products || []).map((p: any) => ({
                ...p,
                price: Number(p.price),
                discountPrice: p.discountPrice ? Number(p.discountPrice) : 0,
                // add other numeric fields if needed (e.g. rating, countInStock)
            }))

            return products
        },
        staleTime: 1000 * 60 * 5, // 5 min cache
    })

    const container: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const item: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    }

    return (
        <section className="py-16 md:py-24 bg-muted/40">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                        Featured Products
                    </h2>
                    <Button variant="link" asChild>
                        <Link href="/products">View All →</Link>
                    </Button>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array(8).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-[400px] w-full rounded-xl" />
                        ))}
                    </div>
                ) : error ? (
                    <Alert variant="destructive">
                        <AlertDescription>
                            Failed to load featured products: {error.message || "Unknown error"}
                        </AlertDescription>
                    </Alert>
                ) : !data || data.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">
                        No featured products available right now.
                    </p>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
                    >
                        {data.map((product: any, index: number) => (
                            <motion.div key={product._id} variants={item}>
                                <ProductCard product={product} index={index} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    )
}