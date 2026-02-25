"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { User, Mail, Lock, Loader2, Save, LogOut, Camera } from "lucide-react"

import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
}).refine((data) => {
    if (data.password && data.password !== data.confirmPassword) {
        return false
    }
    return true
}, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfilePage() {
    const { user, isAuthenticated, mounted, setMounted, updateUser, logout } = useAuthStore()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const form = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    useEffect(() => {
        setMounted(true)
    }, [setMounted])

    useEffect(() => {
        if (mounted && !isAuthenticated) {
            router.push("/login?redirect=/profile")
            return
        }

        if (user) {
            form.reset({
                name: user.name,
                email: user.email,
                password: "",
                confirmPassword: "",
            })
        }
    }, [user, isAuthenticated, mounted, router, form])

    const onSubmit = async (data: ProfileFormData) => {
        setLoading(true)
        try {
            const res = await api.put("/auth/profile", {
                name: data.name,
                email: data.email,
                password: data.password || undefined,
            })

            if (updateUser) {
                updateUser(res.data)
            }

            toast.success("Profile updated successfully")
            form.reset({
                name: res.data.name,
                email: res.data.email,
                password: "",
                confirmPassword: "",
            })
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update profile")
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        logout()
        router.push("/")
    }

    const handleImageClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file")
            return
        }

        // Validate file size (e.g., 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("File size should be less than 2MB")
            return
        }

        setUploading(true)
        const formData = new FormData()
        formData.append("image", file)

        try {
            // 1. Upload the image
            const uploadRes = await api.post("/upload/profile", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })

            const avatarUrl = uploadRes.data.url

            // 2. Update user profile with new avatar URL
            const profileRes = await api.put("/auth/profile", {
                avatar: avatarUrl,
            })

            if (updateUser) {
                updateUser(profileRes.data)
            }

            toast.success("Profile picture updated")
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to upload image")
        } finally {
            setUploading(false)
            // Reset input so it can be used again for the same file if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    if (!mounted) {
        return (
            <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl min-h-[60vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center gap-6 mb-10 text-center md:text-left">
                    <div className="relative group">
                        <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-emerald-500/10 shadow-xl ring-2 ring-emerald-500/20 transition-transform duration-300 group-hover:scale-105">
                            {uploading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10 backdrop-blur-[1px]">
                                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                                </div>
                            ) : null}
                            <AvatarImage src={user?.avatar} alt={user?.name} className="object-cover" />
                            <AvatarFallback className="bg-emerald-50 text-emerald-600 text-2xl font-bold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            onClick={handleImageClick}
                            disabled={uploading}
                            className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-colors border-2 border-background disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Camera className="h-4 w-4" />
                        </button>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 mb-2">
                            {user?.name || "Your Profile"}
                        </h1>
                        <p className="text-muted-foreground max-w-md">
                            Manage your personal details, security settings and account preferences in one place.
                        </p>
                    </div>
                </div>

                <div className="grid gap-8">
                    {/* Main Settings Card */}
                    <Card className="border border-emerald-500/5 shadow-xl shadow-emerald-500/5 rounded-3xl overflow-hidden">
                        <CardHeader className="bg-emerald-50/30 dark:bg-emerald-950/20 border-b border-emerald-500/5 py-6">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <User className="h-5 w-5 text-emerald-600" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>Update your primary account details</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80">Full Name</FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                                                            <Input {...field} placeholder="John Doe" className="pl-11 h-12 rounded-xl bg-muted/30 border-2 border-transparent focus:border-emerald-500/30 focus:bg-background transition-all" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80">Email Address</FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                                                            <Input {...field} type="email" placeholder="john@example.com" className="pl-11 h-12 rounded-xl bg-muted/30 border-2 border-transparent focus:border-emerald-500/30 focus:bg-background transition-all" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="relative py-2">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-emerald-500/10" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-background px-4 text-muted-foreground tracking-widest font-bold">Security</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80">New Password</FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                                                            <Input {...field} type="password" placeholder="••••••••" className="pl-11 h-12 rounded-xl bg-muted/30 border-2 border-transparent focus:border-emerald-500/30 focus:bg-background transition-all" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80">Confirm Password</FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                                                            <Input {...field} type="password" placeholder="••••••••" className="pl-11 h-12 rounded-xl bg-muted/30 border-2 border-transparent focus:border-emerald-500/30 focus:bg-background transition-all" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                                        <p className="text-xs text-muted-foreground italic">
                                            * Leave password blank to keep current
                                        </p>
                                        <Button type="submit" className="w-full sm:w-auto min-w-[160px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all" disabled={loading}>
                                            {loading ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="mr-2 h-4 w-4" />
                                            )}
                                            {loading ? "Updating..." : "Save Changes"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border border-red-500/10 shadow-xl shadow-red-500/5 rounded-3xl overflow-hidden bg-red-500/5">
                        <CardHeader className="py-6 border-b border-red-500/10">
                            <CardTitle className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                                <LogOut className="h-5 w-5" />
                                Danger Zone
                            </CardTitle>
                            <CardDescription>Actions that affect your account session</CardDescription>
                        </CardHeader>
                        <CardContent className="py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <p className="font-bold text-sm text-foreground mb-1">Log out of your account</p>
                                <p className="text-xs text-muted-foreground">
                                    Securely end your current browser session.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="h-12 border-2 border-red-500/20 text-red-600 hover:bg-red-600 hover:text-white font-bold rounded-xl transition-all active:scale-[0.98] px-8"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </div>
    )
}
