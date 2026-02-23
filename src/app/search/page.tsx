// src/app/search/page.tsx
"use client"

import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import ProductCard from "@/components/common/ProductCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SearchPage() {
    const searchParams = useSearchParams()
    const query = searchParams.get("q") || ""

    const { data: products = [], isLoading, error } = useQuery({
        queryKey: ["search", query],
        queryFn: () => api.get("/products", { params: { keyword: query, limit: 20 } }).then(res => res.data.products || []),
        enabled: !!query,
    })

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
                Search Results for "{query}"
            </h1>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array(12).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-[400px] w-full rounded-xl" />
                    ))}
                </div>
            ) : error ? (
                <Alert variant="destructive">
                    <AlertDescription>
                        Failed to load search results. Please try again.
                    </AlertDescription>
                </Alert>
            ) : products.length === 0 ? (
                <div className="text-center py-24">
                    <h2 className="text-2xl font-semibold mb-4">No results found</h2>
                    <p className="text-muted-foreground mb-8">
                        Try searching with different keywords or browse our categories.
                    </p>
                    <Button asChild>
                        <Link href="/products">Browse All Products</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {products.map((product: any, index: number) => (
                        <ProductCard key={product._id} product={product} index={index} />
                    ))}
                </div>
            )}
        </div>
    )
}