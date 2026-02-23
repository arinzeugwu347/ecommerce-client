"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"

interface ProductGalleryProps {
    images: string[]
    name: string
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isZoomed, setIsZoomed] = useState(false)

    if (!images || images.length === 0) return null

    const nextImage = () => setActiveIndex((prev) => (prev + 1) % images.length)
    const prevImage = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length)

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative group aspect-square rounded-2xl overflow-hidden border bg-muted shadow-sm cursor-zoom-in">
                <Image
                    src={images[activeIndex]}
                    alt={`${name} - View ${activeIndex + 1}`}
                    fill
                    className={cn(
                        "object-cover transition-transform duration-500",
                        isZoomed ? "scale-150" : "scale-100"
                    )}
                    onClick={() => setIsZoomed(!isZoomed)}
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                />

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-background"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-background"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </>
                )}

                {/* Zoom Hint */}
                <div className="absolute bottom-4 right-4 p-2 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="h-4 w-4" />
                </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setActiveIndex(i)
                                setIsZoomed(false)
                            }}
                            className={cn(
                                "relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all",
                                activeIndex === i ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-muted-foreground/30"
                            )}
                        >
                            <Image
                                src={img}
                                alt={`${name} thumbnail ${i + 1}`}
                                fill
                                className="object-cover"
                                sizes="80px"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
