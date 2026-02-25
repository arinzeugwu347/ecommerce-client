"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

interface Category {
    _id: string
    name: string
    image: string
    description: string
}

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop"

export default function CategoriesPage() {
    const { data: categories, isLoading, error } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/products/categories')
            return res.data as Category[]
        }
    })

    if (error) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <h2 className="text-2xl font-bold text-red-600">Failed to load categories</h2>
                <p className="mt-2 text-muted-foreground">Please try again later.</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-12 text-center">
                Shop by Category
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {isLoading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
                    ))
                    : categories?.map((category) => (
                        <Link key={category._id} href={`/products?category=${category.name}`}>
                            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group h-full border-none bg-transparent">
                                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                                    <Image
                                        src={category.image || PLACEHOLDER_IMAGE}
                                        alt={category.name}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-6 left-6 right-6 text-white">
                                        <h3 className="text-2xl font-bold">{category.name}</h3>
                                        <p className="text-sm mt-1 opacity-90">{category.description}</p>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))
                }
            </div>
        </div>
    )
}
