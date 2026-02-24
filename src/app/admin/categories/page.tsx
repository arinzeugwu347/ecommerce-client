"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import AdminLayout from "@/components/admin/AdminLayout"
import {
    Plus,
    Search,
    Edit,
    Trash2,
} from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import CategoryForm from "@/components/admin/CategoryForm"
import ConfirmModal from "@/components/common/ConfirmModal"

export default function AdminCategoriesPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<any>(null)
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

    const { data: categories, isLoading } = useQuery({
        queryKey: ["admin-categories"],
        queryFn: () => api.get("/categories").then(res => res.data),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/categories/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-categories"] })
            toast.success("Category deleted successfully")
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to delete category")
        }
    })

    const handleDelete = (id: string, name: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Category?",
            description: `Are you sure you want to delete "${name}"? Products using this category will remain, but you won't be able to filter by this precise category entry anymore.`,
            onConfirm: () => {
                deleteMutation.mutate(id)
                setConfirmModal(prev => ({ ...prev, isOpen: false }))
            }
        })
    }

    const filteredCategories = categories?.filter((c: any) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                        <p className="text-muted-foreground mt-1">Organize your products into meaningful groups.</p>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedCategory(null)
                            setIsFormOpen(true)
                        }}
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus className="h-4 w-4" />
                        Add Category
                    </button>
                </div>

                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-muted/30 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search categories..."
                                className="w-full bg-background border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b bg-muted/10">
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Category</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Slug</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Description</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {isLoading ? (
                                    [1, 2, 3].map((i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-10 w-40 bg-muted rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-20 bg-muted rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-40 bg-muted rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-8 w-8 bg-muted rounded ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : filteredCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                            No categories found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCategories.map((cat: any) => (
                                        <tr key={cat._id} className="hover:bg-muted/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative h-10 w-10 flex-shrink-0 bg-muted rounded-md overflow-hidden border">
                                                        {cat.image ? (
                                                            <Image
                                                                src={cat.image}
                                                                alt={cat.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground italic">
                                                                No Img
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="font-medium text-foreground">{cat.name}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="bg-accent px-1.5 py-0.5 rounded text-xs">{cat.slug}</code>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs truncate">
                                                {cat.description || <span className="text-muted-foreground italic">No description</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 px-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCategory(cat)
                                                            setIsFormOpen(true)
                                                        }}
                                                        className="p-2 rounded-lg hover:bg-background border text-muted-foreground hover:text-primary transition-colors shadow-sm"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(cat._id, cat.name)}
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

                {isFormOpen && (
                    <CategoryForm
                        category={selectedCategory}
                        onClose={() => setIsFormOpen(false)}
                        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin-categories"] })}
                    />
                )}

                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    title={confirmModal.title}
                    description={confirmModal.description}
                    variant="danger"
                    confirmText="Delete Category"
                    onConfirm={confirmModal.onConfirm}
                    onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    isLoading={deleteMutation.isPending}
                />
            </div>
        </AdminLayout>
    )
}
