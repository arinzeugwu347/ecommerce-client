"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { X, Upload, Loader2, Plus, Trash2 } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useSettings } from "@/components/providers/SettingsProvider"

const productSchema = z.object({
    name: z.string().min(2, "Name is too short"),
    description: z.string().min(10, "Description is too short"),
    price: z.coerce.number().min(0),
    discountPrice: z.coerce.number().min(0).optional(),
    countInStock: z.coerce.number().min(0),
    image: z.string().url("Must be a valid URL"),
    images: z.array(z.string().url("Must be a valid URL")),
    category: z.string().min(1, "Category is required"),
    brand: z.string().min(1, "Brand is required"),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
    product?: any
    onClose: () => void
    onSuccess: () => void
}

export default function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
    const { currencySymbol } = useSettings()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isUploadingMain, setIsUploadingMain] = useState(false)
    const [previewImages, setPreviewImages] = useState<string[]>(product?.images || [])
    const [mainImage, setMainImage] = useState<string>(product?.image || "")

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any, // Cast to any to bypass strict resolver type mismatch with coerced numbers
        defaultValues: product ? {
            name: product.name,
            description: product.description,
            price: Number(product.price),
            discountPrice: Number(product.discountPrice),
            countInStock: Number(product.countInStock),
            image: product.image || "",
            images: Array.isArray(product.images) ? product.images : [],
            category: product.category,
            brand: product.brand,
        } : {
            name: "",
            description: "",
            price: 0,
            discountPrice: 0,
            countInStock: 0,
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000",
            images: [],
            category: "",
            brand: "",
        }
    })

    const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploadingMain(true)
        const formData = new FormData()
        formData.append("images", file) // Reuse the same 'images' field for backend compatibility

        try {
            const res = await api.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })
            const url = res.data.urls[0]
            setMainImage(url)
            setValue("image", url)
            toast.success("Main image updated")
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Upload failed")
        } finally {
            setIsUploadingMain(false)
        }
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setIsUploading(true)
        const formData = new FormData()
        Array.from(files).forEach((file) => {
            formData.append("images", file)
        })

        try {
            const res = await api.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })
            const newUrls = res.data.urls
            const updatedImages = [...previewImages, ...newUrls]
            setPreviewImages(updatedImages)
            setValue("images", updatedImages)

            // If no main image was set or it's the default, set first uploaded as main
            if (!product && previewImages.length === 0) {
                setMainImage(newUrls[0])
                setValue("image", newUrls[0])
            }
            toast.success("Images uploaded successfully")
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Upload failed")
        } finally {
            setIsUploading(false)
        }
    }

    const removeImage = (index: number) => {
        const updated = previewImages.filter((_, i) => i !== index)
        setPreviewImages(updated)
        setValue("images", updated)
    }

    const onSubmit = async (data: ProductFormValues) => {
        setIsSubmitting(true)
        try {
            if (product) {
                await api.put(`/products/${product._id}`, data)
                toast.success("Product updated successfully")
            } else {
                await api.post("/products", data)
                toast.success("Product created successfully")
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
            <div className="w-full max-w-xl h-full bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-bold">{product ? 'Edit Product' : 'Add New Product'}</h2>
                        <p className="text-sm text-muted-foreground">{product ? `${product.name}` : 'Create a new item in your catalog'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Product Name</label>
                            <input
                                {...register("name")}
                                className={cn(
                                    "w-full bg-background border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20",
                                    errors.name ? "border-red-500" : "border-input"
                                )}
                                placeholder="iPhone 15 Pro Max"
                            />
                            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                                {...register("description")}
                                rows={4}
                                className={cn(
                                    "w-full bg-background border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 resize-none",
                                    errors.description ? "border-red-500" : "border-input"
                                )}
                                placeholder="Describe the product features, specifications..."
                            />
                            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Base Price ({currencySymbol})</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register("price")}
                                    className={cn(
                                        "w-full bg-background border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20",
                                        errors.price ? "border-red-500" : "border-input"
                                    )}
                                />
                                {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Discount Price ({currencySymbol})</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register("discountPrice")}
                                    className={cn(
                                        "w-full bg-background border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20",
                                        errors.discountPrice ? "border-red-500" : "border-input"
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Stock Quantity</label>
                                <input
                                    type="number"
                                    {...register("countInStock")}
                                    className={cn(
                                        "w-full bg-background border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20",
                                        errors.countInStock ? "border-red-500" : "border-input"
                                    )}
                                />
                                {errors.countInStock && <p className="text-xs text-red-500">{errors.countInStock.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Brand</label>
                                <input
                                    {...register("brand")}
                                    className={cn(
                                        "w-full bg-background border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20",
                                        errors.brand ? "border-red-500" : "border-input"
                                    )}
                                />
                                {errors.brand && <p className="text-xs text-red-500">{errors.brand.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <input
                                {...register("category")}
                                className={cn(
                                    "w-full bg-background border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20",
                                    errors.category ? "border-red-500" : "border-input"
                                )}
                            />
                            {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
                        </div>

                        {/* Main Image Upload */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium">Main Product Image</label>
                            <div className="relative aspect-video rounded-xl overflow-hidden border bg-muted group max-w-sm">
                                {mainImage ? (
                                    <img src={mainImage} alt="Main Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground italic">
                                        No image selected
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                    {isUploadingMain ? (
                                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-white">
                                            <Upload className="h-6 w-6" />
                                            <span className="text-xs font-bold">Change Main Image</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleMainImageUpload}
                                        disabled={isUploadingMain}
                                    />
                                </label>
                            </div>
                            {errors.image && <p className="text-xs text-red-500">{errors.image.message}</p>}
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-medium">Product Gallery</label>

                            <div className="grid grid-cols-4 gap-4">
                                {previewImages.map((url, index) => (
                                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
                                        <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="p-1.5 rounded-full bg-red-500 text-white transition-transform hover:scale-110"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {previewImages.length < 6 && (
                                    <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group">
                                        {isUploading ? (
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        ) : (
                                            <>
                                                <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                                <span className="text-[10px] font-medium text-muted-foreground">Upload</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleUpload}
                                            disabled={isUploading}
                                        />
                                    </label>
                                )}
                            </div>

                            <p className="text-[11px] text-muted-foreground">
                                Upload up to 6 images via the file system. The star icon marks the primary image.
                            </p>
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
                        {product ? 'Update Product' : 'Create Product'}
                    </button>
                </div>
            </div>
        </div>
    )
}
