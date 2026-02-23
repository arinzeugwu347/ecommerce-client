"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import AdminLayout from "@/components/admin/AdminLayout"
import { useSettings } from "@/components/providers/SettingsProvider"
import {
    Package,
    Plus,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    Check,
    X,
    Filter
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Image from "next/image"
import ProductForm from "@/components/admin/ProductForm"
import ConfirmModal from "@/components/common/ConfirmModal"

export default function AdminProductsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => { },
    })
    const queryClient = useQueryClient()
    const { currencySymbol } = useSettings()

    const { data, isLoading } = useQuery({
        queryKey: ["admin-products", searchTerm],
        queryFn: () => api.get(`/products?keyword=${searchTerm}&pageSize=50`).then(res => res.data),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/products/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-products"] })
            toast.success("Product deleted successfully")
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to delete product")
        }
    })

    const handleDelete = (id: string, name: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Product?",
            description: `Are you sure you want to delete "${name}"? This action cannot be undone and will remove the product from the catalog.`,
            onConfirm: () => {
                deleteMutation.mutate(id)
                setConfirmModal(prev => ({ ...prev, isOpen: false }))
            }
        })
    }

    const products = data?.products || []

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                        <p className="text-muted-foreground mt-1">Manage your product catalog and inventory.</p>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedProduct(null)
                            setIsFormOpen(true)
                        }}
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus className="h-4 w-4" />
                        Add Product
                    </button>
                </div>

                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-muted/30 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full bg-background border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <button className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-accent transition-colors">
                                <Filter className="h-4 w-4" />
                                Filters
                            </button>
                            <div className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                                {products.length} products found
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b bg-muted/10">
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Product</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Category</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Price</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Stock</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {isLoading ? (
                                    [1, 2, 3, 4, 5].map((i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-10 w-40 bg-muted rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-20 bg-muted rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-16 bg-muted rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-12 bg-muted rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-8 w-8 bg-muted rounded ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                            No products found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product: any) => (
                                        <tr key={product._id} className="hover:bg-muted/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative h-10 w-10 flex-shrink-0 bg-muted rounded-md overflow-hidden border">
                                                        <Image
                                                            src={product.image}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-foreground">{product.name}</div>
                                                        <div className="text-xs text-muted-foreground">ID: {product._id.slice(-6)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-accent text-accent-foreground text-xs font-medium uppercase tracking-wider">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold">{currencySymbol}{Number(product.price).toFixed(2)}</div>
                                                {product.discountPrice > 0 && (
                                                    <div className="text-xs text-emerald-500">Sale active</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={cn(
                                                    "flex items-center gap-1.5 font-medium",
                                                    product.countInStock <= 5 ? "text-red-500" : "text-muted-foreground"
                                                )}>
                                                    {product.countInStock <= 5 && <X className="h-3 w-3" />}
                                                    {product.countInStock > 0 ? product.countInStock : "Out of Stock"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProduct(product)
                                                            setIsFormOpen(true)
                                                        }}
                                                        className="p-2 rounded-lg hover:bg-background border text-muted-foreground hover:text-primary transition-colors shadow-sm"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product._id, product.name)}
                                                        className="p-2 rounded-lg hover:bg-background border text-muted-foreground hover:text-red-500 transition-colors shadow-sm"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isFormOpen && (
                <ProductForm
                    product={selectedProduct}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin-products"] })}
                />
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                description={confirmModal.description}
                variant="danger"
                confirmText="Delete Product"
                onConfirm={confirmModal.onConfirm}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                isLoading={deleteMutation.isPending}
            />
        </AdminLayout>
    )
}
