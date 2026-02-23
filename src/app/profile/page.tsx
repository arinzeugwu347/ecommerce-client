"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { User, Mail, Lock, Loader2, Save, LogOut } from "lucide-react"

import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

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

    if (!mounted) return null

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">Your Profile</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>

            <div className="grid gap-8">
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your name, email, and password</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input {...field} className="pl-10 h-11" />
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
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input {...field} type="email" className="pl-10 h-11" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator className="my-2" />

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input {...field} type="password" placeholder="••••••••" className="pl-10 h-11" />
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
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input {...field} type="password" placeholder="••••••••" className="pl-10 h-11" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1 px-1">Leave blank to keep current</p>
                                </div>

                                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 transition-all" disabled={loading}>
                                    {loading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    {loading ? "Updating..." : "Save Changes"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm border-t-2 border-t-red-500/10">
                    <CardHeader>
                        <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                        <CardDescription>Actions that cannot be undone</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Logout of your account securely from this device.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-2 transition-colors" onClick={handleLogout}>
                            <LogOut className="h-4 w-4" />
                            Log Out
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
