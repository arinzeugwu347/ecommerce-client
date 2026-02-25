"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import ReviewItems from "./ReviewItems"
import ProductReviewForm from "./ProductReviewForm"

interface Review {
    _id?: string
    name: string
    rating: number
    comment: string
    createdAt: string
    user: string
}

interface ReviewsContainerProps {
    slug: string
    initialReviews: Review[]
}

export default function ReviewsContainer({ slug, initialReviews }: ReviewsContainerProps) {
    const router = useRouter()
    const [reviews, setReviews] = useState<Review[]>(initialReviews)
    const [isPending, startTransition] = useTransition()

    // Sync with server data only when NOT in a transition
    // This prevents flickering back to old data while refreshing
    useEffect(() => {
        if (!isPending) {
            setReviews(initialReviews)
        }
    }, [initialReviews, isPending])

    const handleRefresh = () => {
        startTransition(() => {
            router.refresh()
        })
    }

    const handleReviewAdded = (newReview: Review) => {
        setReviews(prev => [newReview, ...prev])
        handleRefresh()
    }

    const handleReviewDeleted = (reviewId: string) => {
        setReviews(prev => prev.filter(r => r._id !== reviewId))
        handleRefresh()
    }

    return (
        <div className="space-y-12">
            <ReviewItems
                reviews={reviews}
                slug={slug}
                onDelete={handleReviewDeleted}
            />

            <ProductReviewForm
                slug={slug}
                reviews={reviews}
                onSuccess={handleReviewAdded}
            />
        </div>
    )
}
