"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { X, Upload, Loader2 } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const categorySchema = z.object({
    name: z.string().min(2, "Name is too short"),
    description: z.string().optional(),
    image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormProps {
    category?: any
    onClose: () => void
    onSuccess: () => void
}

export default function CategoryForm({ category, onClose, onSuccess }: CategoryFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [previewImage, setPreviewImage] = useState<string>(category?.image || "")

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: category ? {
            name: category.name,
            description: category.description || "",
            image: category.image || "",
        } : {
            name: "",
            description: "",
            image: "",
        }
    })

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append("images", file)

        try {
            const res = await api.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })
            const url = res.data.urls[0]
            setPreviewImage(url)
            setValue("image", url)
            toast.success("Image uploaded")
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Upload failed")
        } finally {
            setIsUploading(false)
        }
    }

    const onSubmit = async (data: CategoryFormValues) => {
        setIsSubmitting(true)
        try {
            if (category) {
                await api.put(`/categories/${category._id}`, data)
                toast.success("Category updated successfully")
            } else {
                await api.post("/categories", data)
                toast.success("Category created successfully")
            }
            onSuccess()
            onClose()
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Something went wrong")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md h-full bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-bold">{category ? 'Edit Category' : 'Add New Category'}</h2>
                        <p className="text-sm text-muted-foreground">Manage category metadata</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category Name</label>
                            <input
                                {...register("name")}
                                className={cn(
                                    "w-full bg-background border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20",
                                    errors.name ? "border-red-500" : "border-input"
                                )}
                                placeholder="Electronics"
                            />
                            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                                {...register("description")}
                                rows={3}
                                className="w-full bg-background border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 resize-none border-input"
                                placeholder="Description of the category..."
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium">Category Image</label>
                            <div className="relative aspect-video rounded-xl overflow-hidden border bg-muted group">
                                {previewImage ? (
                                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground italic">
                                        No image selected
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                    {isUploading ? (
                                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-white">
                                            <Upload className="h-6 w-6" />
                                            <span className="text-xs font-bold">Upload Image</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={isUploading}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t bg-muted/20 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg font-medium hover:bg-accent transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-2.5 rounded-lg font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        {category ? 'Update Category' : 'Create Category'}
                    </button>
                </div>
            </div>
        </div>
    )
}
