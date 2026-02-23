"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Star, Trash2, User } from "lucide-react"
import { format } from "date-fns"
import axios from "axios"

import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface Review {
    _id?: string
    name: string
    rating: number
    comment: string
    createdAt: string
    user: string
}

interface ReviewItemsProps {
    reviews: Review[]
    slug: string
}

export default function ReviewItems({ reviews, slug }: ReviewItemsProps) {
    const router = useRouter()
    const { user } = useAuthStore()
    const [isDeleting, setIsDeleting] = useState<boolean>(false)
    const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)

    const handleDelete = async () => {
        if (!reviewToDelete) return

        setIsDeleting(true)
        try {
            await api.delete(`/products/${slug}/reviews`, {
                data: { reviewId: reviewToDelete }
            })
            toast.success("Review deleted successfully")
            setReviewToDelete(null)
            router.refresh()
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message
                : (err instanceof Error ? err.message : "Failed to delete review")

            toast.error("Deletion failed", {
                description: errorMessage || "Please try again later."
            })
        } finally {
            setIsDeleting(false)
        }
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-muted/30 rounded-2xl border-2 border-dashed">
                <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
            </div>
        )
    }

    return (
        <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reviews.map((review, index) => (
                    <Card key={review._id || index} className="overflow-hidden border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm leading-none mb-1">{review.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(review.createdAt), "MMM d, yyyy")}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={cn(
                                                "h-3.5 w-3.5",
                                                star <= review.rating
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-muted-foreground/30"
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed italic">
                                &ldquo;{review.comment}&rdquo;
                            </p>

                            {(user?._id === review.user || user?.role === "admin") && (
                                <div className="mt-4 flex justify-end">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                        onClick={() => setReviewToDelete(review._id || "")}
                                        disabled={isDeleting && reviewToDelete === review._id}
                                    >
                                        <Trash2 className={cn("h-4 w-4", isDeleting && reviewToDelete === review._id && "animate-pulse")} />
                                        <span className="sr-only">Delete review</span>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={!!reviewToDelete} onOpenChange={(open) => !open && setReviewToDelete(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Review</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this review? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 flex-row justify-end space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => setReviewToDelete(null)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete Review"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
