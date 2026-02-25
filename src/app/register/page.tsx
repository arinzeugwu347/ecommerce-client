"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import { toast } from "sonner"
import axios from "axios"
import { UserPlus, Mail, Lock, User, Loader2, ShoppingBag } from "lucide-react"
import { GoogleLogin } from "@react-oauth/google"

import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const router = useRouter()
    const { setAuth, googleLogin } = useAuthStore()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    const onSubmit = async (values: RegisterFormValues) => {
        setIsLoading(true)
        try {
            const { confirmPassword, ...rest } = values
            const res = await api.post("/auth/register", rest)
            const { user, token } = res.data

            setAuth(user, token)
            toast.success("Account created!", {
                description: `Welcome to the community, ${user.name}!`,
            })

            router.push("/")
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message
                : (err instanceof Error ? err.message : "An unexpected error occurred")

            toast.error("Registration failed", {
                description: errorMessage || "Please check your details and try again.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col lg:grid lg:max-w-none lg:grid-cols-2 lg:px-0 min-h-[calc(100svh-4rem)]">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-emerald-900" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">YourShop</span>
                    </Link>
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;Join thousands of satisfied customers and start your journey with the best products available in the market today.&rdquo;
                        </p>
                        <footer className="text-sm">Linda</footer>
                    </blockquote>
                </div>
            </div>
            <div className="p-4 sm:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Card className="border-none shadow-none sm:border sm:shadow-sm">
                            <CardHeader className="space-y-1">
                                <CardTitle className="text-2xl font-bold tracking-tight text-center">Create an account</CardTitle>
                                <CardDescription className="text-center">
                                    Join us today and enjoy exclusive benefits
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                placeholder="John Doe"
                                                                className="pl-10"
                                                                {...field}
                                                            />
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
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                placeholder="name@example.com"
                                                                className="pl-10"
                                                                {...field}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                type="password"
                                                                placeholder="••••••••"
                                                                className="pl-10"
                                                                {...field}
                                                            />
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
                                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                type="password"
                                                                placeholder="••••••••"
                                                                className="pl-10"
                                                                {...field}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="submit"
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 h-11"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <UserPlus className="mr-2 h-4 w-4" />
                                            )}
                                        </Button>
                                    </form>
                                </Form>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-muted-foreground/20"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                                    </div>
                                </div>

                                <div className="flex justify-center min-h-[44px]">
                                    <GoogleLogin
                                        onSuccess={async (credentialResponse) => {
                                            if (credentialResponse.credential) {
                                                try {
                                                    await googleLogin(credentialResponse.credential)
                                                    toast.success("Welcome!", {
                                                        description: "Account created with Google successfully",
                                                    })
                                                    router.push("/")
                                                } catch (err: any) {
                                                    toast.error("Google login failed", {
                                                        description: err.message || "Something went wrong.",
                                                    })
                                                }
                                            }
                                        }}
                                        onError={() => {
                                            toast.error("Google Login Failed", {
                                                description: "The Google authentication flow was interrupted.",
                                            })
                                        }}
                                        theme="outline"
                                        shape="rectangular"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4">
                                <div className="text-sm text-center text-muted-foreground">
                                    Already have an account?{" "}
                                    <Link
                                        href="/login"
                                        className="font-medium text-emerald-600 hover:text-emerald-500 underline-offset-4 hover:underline"
                                    >
                                        Login here
                                    </Link>
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
