"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { toast } from "sonner"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Star } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useQueryClient } from "@tanstack/react-query"

const reviewSchema = z.object({
    rating: z
        .number({ message: "Please select a rating" })
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot exceed 5"),
    comment: z
        .string()
        .min(10, "Comment must be at least 10 characters long")
        .max(500, "Comment cannot exceed 500 characters")
        .trim()
        .refine((val) => val.length > 0, "Comment is required"),
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface ProductReviewFormProps {
    slug: string
    reviews: Array<{ user: string | { _id: string } }>
    onSuccess?: (newReview: any) => void
}

export default function ProductReviewForm({ slug, reviews, onSuccess }: ProductReviewFormProps) {
    const { user, isAuthenticated } = useAuthStore()
    const router = useRouter()
    const queryClient = useQueryClient()
    const hasReviewed = reviews.some(r => {
        const reviewUserId = typeof r.user === "string" ? r.user : r.user?._id
        return reviewUserId === user?._id
    })

    const form = useForm<ReviewFormData>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            rating: 0,
            comment: "",
        },
    })

    const onSubmit = async (data: ReviewFormData) => {
        try {
            const res = await api.post(`/products/${slug}/reviews`, data)
            toast.success("Review submitted", {
                description: "Thank you for your feedback!",
            })

            if (onSuccess && user) {
                // Reconstruct the review object locally for instant UI update
                // The backend currently only returns a message, so we build it ourselves
                onSuccess({
                    _id: Date.now().toString(), // Temporary ID until refresh
                    name: user.name,
                    rating: data.rating,
                    comment: data.comment,
                    user: user._id,
                    createdAt: new Date().toISOString()
                })
            }

            form.reset()
            // Invalidate any tanstack queries for products
            queryClient.invalidateQueries({ queryKey: ["products"] })
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message
                : (err instanceof Error ? err.message : "Please try again")

            toast.error("Failed to submit review", {
                description: errorMessage || "Please try again",
            })
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="mt-12 p-8 text-center bg-muted/30 rounded-2xl border-2 border-dashed">
                <h3 className="text-xl font-semibold mb-2">Want to share your thoughts?</h3>
                <p className="text-muted-foreground mb-6">You must be logged in to write a review.</p>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                    <Link href={`/login?redirect=/products/${slug}`}>Login to Review</Link>
                </Button>
            </div>
        )
    }

    if (hasReviewed) {
        return (
            <div className="mt-12 p-8 text-center bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 mx-auto mb-4">
                    <Star className="h-6 w-6 fill-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-emerald-900 dark:text-emerald-100 mb-2">Review Submitted</h3>
                <p className="text-emerald-700 dark:text-emerald-300">You have already shared your feedback for this product. Thank you!</p>
            </div>
        )
    }

    return (
        <div className="mt-12 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-6">Write a Review</h3>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* ... form fields same as before ... */}
                    {/* Rating */}
                    <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rating (1–5 stars)</FormLabel>
                                <FormControl>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => field.onChange(star)}
                                                className={cn(
                                                    "text-2xl transition-colors",
                                                    star <= field.value
                                                        ? "text-yellow-400"
                                                        : "text-muted-foreground hover:text-yellow-400"
                                                )}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Comment */}
                    <FormField
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your Review</FormLabel>
                                <FormControl>
                                    <Textarea
                                        rows={5}
                                        placeholder="Share your honest experience with this product..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                </form>
            </Form>
        </div>
    )
}
