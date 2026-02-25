"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import axios from "axios"
import { UserPlus, Mail, Lock, User, Loader2, ShoppingBag, ArrowRight, CheckCircle2 } from "lucide-react"
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
        <div className="relative min-h-[calc(100svh-4rem)] flex items-center justify-center p-4 overflow-hidden bg-slate-50 dark:bg-[#020817] transition-colors duration-300">
            {/* 
                BRUTAL STABILITY FIX v2
                Forcibly disables GPU intensive painting that triggers ghosting on certain mobile hardware.
            */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .glitch-guard {
                    transform: translateZ(0);
                    will-change: opacity;
                    backface-visibility: hidden;
                    perspective: 1000;
                }
                @media (max-width: 1024px) {
                    * {
                        transition: opacity 0.3s ease-out !important;
                        transform: none !important;
                        backdrop-filter: none !important;
                        filter: none !important;
                        animation-duration: 0.4s !important;
                    }
                }
            `}} />

            {/* Ambient Background Elements - Solid Opacity only */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-emerald-500/5 dark:bg-emerald-500/5 rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] bg-emerald-500/5 dark:bg-emerald-500/5 rounded-full" />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-[480px] z-10 glitch-guard"
                >
                    <Card className="border-slate-200 dark:border-emerald-500/10 bg-white/90 dark:bg-slate-900/50 shadow-2xl backdrop-blur-none transition-colors duration-300">
                        <CardHeader className="space-y-4 pt-8 text-center">
                            <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 p-0.5 shadow-lg shadow-emerald-500/20">
                                <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white dark:bg-slate-900 transition-colors duration-300">
                                    <ShoppingBag className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
                                    Create Account
                                </CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400 text-base">
                                    Join us today and enjoy exclusive benefits
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 pt-2">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 dark:text-slate-300">Full Name</FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <User className="absolute left-3.5 top-3 h-5 w-5 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-emerald-500" />
                                                        <Input
                                                            placeholder="John Doe"
                                                            className="h-11 pl-11 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-emerald-500/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-red-500 dark:text-red-400" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 dark:text-slate-300">Email Address</FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-emerald-500" />
                                                        <Input
                                                            placeholder="name@example.com"
                                                            className="h-11 pl-11 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-emerald-500/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-red-500 dark:text-red-400" />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex flex-col gap-4">
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-700 dark:text-slate-300">Password</FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-emerald-500" />
                                                            <Input
                                                                type="password"
                                                                placeholder="••••••••"
                                                                className="h-11 pl-11 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-emerald-500/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50"
                                                                {...field}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-red-500 dark:text-red-400" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-700 dark:text-slate-300">Confirm Password</FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-emerald-500" />
                                                            <Input
                                                                type="password"
                                                                placeholder="••••••••"
                                                                className="h-11 pl-11 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-emerald-500/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50"
                                                                {...field}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-red-500 dark:text-red-400" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold h-12 text-base transition-all active:scale-[0.98]"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                <span>Create Account</span>
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Form>

                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-[#121a2a] px-3 text-slate-400 dark:text-slate-500 transition-colors duration-300">Or join with</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <div className="w-full max-w-[280px] min-h-[44px] flex justify-center bg-white rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 p-0.5 transition-colors duration-300">
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
                                        theme="filled_blue"
                                        shape="pill"
                                        width="280"
                                    />
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400 mt-4">
                                    Already have an account?{" "}
                                    <Link
                                        href="/login"
                                        className="font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 ml-1 transition-colors"
                                    >
                                        Login Now
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-8 flex items-center justify-center gap-6 opacity-60 dark:opacity-40">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Privacy Protected
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Quality Guarantee
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
