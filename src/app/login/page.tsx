"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import { toast } from "sonner"
import axios from "axios"
import { LogIn, Mail, Lock, Loader2, ArrowRight, ShoppingBag } from "lucide-react"
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

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { setAuth, googleLogin } = useAuthStore()
    const [isLoading, setIsLoading] = useState(false)

    // Redirect back to where user came from, or to home
    const redirectPath = searchParams.get("redirect") || "/"

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (values: LoginFormValues) => {
        setIsLoading(true)
        try {
            const res = await api.post("/auth/login", values)
            const { user, token } = res.data

            setAuth(user, token)
            toast.success("Welcome back!", {
                description: `Signed in as ${user.name}`,
            })

            router.push(redirectPath)
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message
                : (err instanceof Error ? err.message : "An unexpected error occurred")

            toast.error("Login failed", {
                description: errorMessage || "Please check your credentials and try again.",
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
                            &ldquo;This shop has saved me countless hours of work and helped me deliver stunning projects to my clients faster than ever before.&rdquo;
                        </p>
                        <footer className="text-sm">Alexandra</footer>
                    </blockquote>
                </div>
            </div>
            <div className="p-4 sm:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Card className="border-none shadow-none sm:border sm:shadow-sm">
                            <CardHeader className="space-y-1">
                                <CardTitle className="text-2xl font-bold tracking-tight text-center">Login</CardTitle>
                                <CardDescription className="text-center">
                                    Enter your credentials to access your account
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                                    <div className="flex items-center justify-between">
                                                        <FormLabel>Password</FormLabel>
                                                        <Link
                                                            href="/forgot-password"
                                                            className="text-sm font-medium text-emerald-600 hover:text-emerald-500 underline-offset-4 hover:underline"
                                                        >
                                                            Forgot password?
                                                        </Link>
                                                    </div>
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
                                                <LogIn className="mr-2 h-4 w-4" />
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
                                                    toast.success("Welcome back!", {
                                                        description: "Signed in with Google successfully",
                                                    })
                                                    router.push(redirectPath)
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
                                    Don't have an account?{" "}
                                    <Link
                                        href="/register"
                                        className="font-medium text-emerald-600 hover:text-emerald-500 underline-offset-4 hover:underline"
                                    >
                                        Create an account
                                    </Link>
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our{" "}
                        <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    )
}
