"use client"

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import api from "@/lib/api"
import ProductCard from "@/components/common/ProductCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ChevronLeft, ChevronRight, Filter, SlidersHorizontal } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function ProductsPage() {
    const searchParams = useSearchParams()
    const router = useRouter()

    // Read initial values from URL
    const initialKeyword = searchParams.get("keyword") || ""
    const initialCategory = searchParams.get("category") || ""
    const initialSort = searchParams.get("sort") || "newest"
    const initialPage = Number(searchParams.get("page")) || 1

    // Local state for controlled inputs
    const [category, setCategory] = useState(initialCategory)
    const [sort, setSort] = useState(initialSort)
    const [page, setPage] = useState(initialPage)

    const pageSize = 12

    // Update URL when filters change
    const updateFilters = (overrides: {
        category?: string,
        sort?: string,
        page?: number,
    } = {}) => {
        const params = new URLSearchParams()

        // Keep existing keyword from URL if any
        if (initialKeyword) params.set("keyword", initialKeyword)

        const fCategory = overrides.category !== undefined ? overrides.category : category
        const fSort = overrides.sort !== undefined ? overrides.sort : sort
        const fPage = overrides.page !== undefined ? overrides.page : page

        if (fCategory && fCategory !== "all") params.set("category", fCategory)
        if (fSort && fSort !== "newest") params.set("sort", fSort)
        if (fPage > 1) params.set("page", fPage.toString())

        router.push(`/products?${params.toString()}`)
    }

    // Sync state with URL on mount / param change
    useEffect(() => {
        setCategory(initialCategory)
        setSort(initialSort)
        setPage(initialPage)
    }, [searchParams])

    // Fetch categories for the filter
    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/products/categories')
            return res.data as { name: string }[]
        }
    })

    // Fetch products
    const { data, isLoading, error } = useQuery({
        queryKey: ["products", page, category, initialKeyword, sort],
        queryFn: async () => {
            const params: any = {
                pageNumber: page,
                pageSize,
                sort,
            }

            if (category && category !== "all") params.category = category
            if (initialKeyword) params.keyword = initialKeyword

            const res = await api.get("/products", { params })
            return {
                products: res.data.products || [],
                total: res.data.totalProducts || 0,
                pages: res.data.pages || 1,
            }
        },
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
    })

    const totalPages = data?.pages || 1

    // Handlers
    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return
        updateFilters({ page: newPage })
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                        {category && category !== "all" ? `${category} Products` : "Our Products"}
                    </h1>
                    {initialKeyword && (
                        <p className="text-muted-foreground mt-2 italic">
                            Showing results for "{initialKeyword}"
                        </p>
                    )}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                    {/* Mobile Filter Trigger */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="lg" className="md:hidden gap-2 h-11 px-6">
                                <Filter className="h-4 w-4" />
                                Filters
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <SheetHeader className="mb-8">
                                <SheetTitle className="text-2xl font-bold">Filters</SheetTitle>
                                <SheetDescription>
                                    Refine your product search
                                </SheetDescription>
                            </SheetHeader>

                            <div className="flex flex-col gap-8 ml-4 mr-4">
                                <div className="space-y-4 ">
                                    <h3 className="font-semibold text-lg">Category</h3>
                                    <Select value={category || "all"} onValueChange={(val: string) => {
                                        setCategory(val)
                                        updateFilters({ category: val, page: 1 })
                                    }}>
                                        <SelectTrigger className="w-full h-11">
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categoriesData?.map((cat) => (
                                                <SelectItem key={cat.name} value={cat.name}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Sort By</h3>
                                    <Select value={sort} onValueChange={(val: string) => {
                                        setSort(val)
                                        updateFilters({ sort: val, page: 1 })
                                    }}>
                                        <SelectTrigger className="w-full h-11">
                                            <SelectValue placeholder="Sort by" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="newest">Newest First</SelectItem>
                                            <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                            <SelectItem value="price-desc">Price: High to Low</SelectItem>
                                            <SelectItem value="rating">Highest Rated</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="pt-4 space-y-3">
                                    {(category !== "all" || initialKeyword) && (
                                        <Button variant="outline" className="w-full h-11" asChild>
                                            <Link href="/products">Clear All Filters</Link>
                                        </Button>
                                    )}
                                    <Button className="w-full h-11" onClick={() => {
                                        // Close sheet trigger implicitly by state if needed, 
                                        // but usually shadcn sheet closes on interaction or we can just leave it
                                    }}>
                                        Apply Filters
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Desktop Filter Row */}
                    <div className="hidden md:flex flex-wrap gap-4 items-center">
                        <Select value={category || "all"} onValueChange={(val: string) => {
                            setCategory(val)
                            updateFilters({ category: val, page: 1 })
                        }}>
                            <SelectTrigger className="w-[180px] h-11">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categoriesData?.map((cat) => (
                                    <SelectItem key={cat.name} value={cat.name}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={sort} onValueChange={(val: string) => {
                            setSort(val)
                            updateFilters({ sort: val, page: 1 })
                        }}>
                            <SelectTrigger className="w-[180px] h-11">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                                <SelectItem value="rating">Highest Rated</SelectItem>
                            </SelectContent>
                        </Select>

                        {(category !== "all" || initialKeyword) && (
                            <Button variant="ghost" className="h-11 px-4 hover:bg-muted" asChild>
                                <Link href="/products">Clear All</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Results */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array(pageSize).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-[400px] w-full rounded-xl" />
                    ))}
                </div>
            ) : error ? (
                <Alert variant="destructive">
                    <AlertDescription>
                        Failed to load products. Please try again later.
                    </AlertDescription>
                </Alert>
            ) : !data?.products || data.products.length === 0 ? (
                <div className="text-center py-24">
                    <h2 className="text-2xl font-semibold mb-4">No products found</h2>
                    <p className="text-muted-foreground mb-8">
                        Try adjusting your filters or search terms.
                    </p>
                    <Button asChild>
                        <Link href="/products">Clear Filters</Link>
                    </Button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {data.products.map((product: any, index: number) => (
                            <ProductCard key={product._id} product={product} index={index} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex justify-center items-center gap-6">
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={page === 1}
                                onClick={() => handlePageChange(page - 1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            -
                            <span className="text-sm font-medium">
                                Page {page} of {totalPages}
                            </span>

                            <Button
                                variant="outline"
                                size="icon"
                                disabled={page === totalPages}
                                onClick={() => handlePageChange(page + 1)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}