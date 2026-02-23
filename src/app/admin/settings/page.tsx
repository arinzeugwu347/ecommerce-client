"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import api from "@/lib/api"
import AdminLayout from "@/components/admin/AdminLayout"
import {
    Settings,
    Store,
    Mail,
    DollarSign,
    Percent,
    Truck,
    AlertCircle,
    Save,
    Loader2,
    Lock
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { SubmitHandler } from "react-hook-form"

const settingsSchema = z.object({
    storeName: z.string().min(1, "Store name is required"),
    storeEmail: z.string().email("Invalid email"),
    currency: z.string().min(1, "Currency is required"),
    currencySymbol: z.string().min(1, "Symbol is required"),
    taxRate: z.coerce.number().min(0).default(0),
    shippingThreshold: z.coerce.number().min(0).default(0),
    flatShippingRate: z.coerce.number().min(0).default(0),
    lowStockThreshold: z.coerce.number().min(1).default(5),
    maintenanceMode: z.boolean().default(false),
})

type SettingsValues = z.infer<typeof settingsSchema>

export default function AdminSettingsPage() {
    const queryClient = useQueryClient()
    const [isSaving, setIsSaving] = useState(false)

    const { data: settings, isLoading } = useQuery({
        queryKey: ["admin-settings"],
        queryFn: () => api.get("/settings").then(res => res.data),
    })

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty }
    } = useForm<SettingsValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            storeName: "",
            storeEmail: "",
            currency: "USD",
            currencySymbol: "$",
            taxRate: 0,
            shippingThreshold: 0,
            flatShippingRate: 0,
            lowStockThreshold: 5,
            maintenanceMode: false,
        }
    })

    useEffect(() => {
        if (settings) {
            reset(settings)
        }
    }, [settings, reset])

    const mutation = useMutation({
        mutationFn: (data: SettingsValues) => api.put("/settings", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-settings"] })
            toast.success("Settings updated successfully")
            setIsSaving(false)
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update settings")
            setIsSaving(false)
        }
    })

    const onSubmit = (data: any) => {
        setIsSaving(true)
        mutation.mutate(data)
    }

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="space-y-6 animate-pulse">
                    <div className="h-8 w-48 bg-muted rounded"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-40 bg-card rounded-xl border"></div>
                        ))}
                    </div>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
                        <p className="text-muted-foreground mt-1">Configure your global store preferences and defaults.</p>
                    </div>
                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={!isDirty || isSaving}
                        className={cn(
                            "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg",
                            !isDirty || isSaving
                                ? "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                                : "bg-primary text-primary-foreground hover:opacity-90 shadow-primary/20"
                        )}
                    >
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Save Changes
                    </button>
                </div>

                <form className="space-y-6">
                    {/* General Settings */}
                    <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                        <div className="p-6 border-b bg-muted/30 flex items-center gap-2 text-primary">
                            <Store className="h-5 w-5" />
                            <h2 className="font-bold">General Information</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Store Name</label>
                                <div className="relative">
                                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        {...register("storeName")}
                                        className="w-full bg-background border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="Enter store name"
                                    />
                                </div>
                                {errors.storeName && <p className="text-xs text-red-500 font-medium">{errors.storeName.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Store Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        {...register("storeEmail")}
                                        className="w-full bg-background border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="admin@example.com"
                                    />
                                </div>
                                {errors.storeEmail && <p className="text-xs text-red-500 font-medium">{errors.storeEmail.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Localization & Currency */}
                    <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                        <div className="p-6 border-b bg-muted/30 flex items-center gap-2 text-blue-500">
                            <DollarSign className="h-5 w-5" />
                            <h2 className="font-bold">Localization & Currency</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Primary Currency</label>
                                <input
                                    {...register("currency")}
                                    className="w-full bg-background border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="e.g. USD"
                                />
                                {errors.currency && <p className="text-xs text-red-500 font-medium">{errors.currency.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Currency Symbol</label>
                                <input
                                    {...register("currencySymbol")}
                                    className="w-full bg-background border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="e.g. $"
                                />
                                {errors.currencySymbol && <p className="text-xs text-red-500 font-medium">{errors.currencySymbol.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Tax & Shipping */}
                    <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                        <div className="p-6 border-b bg-muted/30 flex items-center gap-2 text-emerald-500">
                            <Percent className="h-5 w-5" />
                            <h2 className="font-bold">Tax & Shipping</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tax Rate (Decimal)</label>
                                <div className="relative">
                                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register("taxRate")}
                                        className="w-full bg-background border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground italic">0.15 = 15% tax</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Free Shipping Threshold</label>
                                <div className="relative">
                                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="number"
                                        {...register("shippingThreshold")}
                                        className="w-full bg-background border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Flat Shipping Rate</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="number"
                                        {...register("flatShippingRate")}
                                        className="w-full bg-background border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inventory & System */}
                    <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                        <div className="p-6 border-b bg-muted/30 flex items-center gap-2 text-amber-500">
                            <AlertCircle className="h-5 w-5" />
                            <h2 className="font-bold">Inventory & System</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Low Stock Threshold</label>
                                <div className="relative">
                                    <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="number"
                                        {...register("lowStockThreshold")}
                                        className="w-full bg-background border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground italic">Fires alerts when stock reaches this level</p>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-dashed">
                                <div className="space-y-0.5">
                                    <div className="text-sm font-bold flex items-center gap-2">
                                        <Lock className="h-3.5 w-3.5" />
                                        Maintenance Mode
                                    </div>
                                    <p className="text-xs text-muted-foreground">Disable frontend store for customers</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        {...register("maintenanceMode")}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="text-center pb-12">
                    <p className="text-xs text-muted-foreground italic">
                        All configuration changes are applied instantly across the platform.
                    </p>
                </div>
            </div>
        </AdminLayout>
    )
}
