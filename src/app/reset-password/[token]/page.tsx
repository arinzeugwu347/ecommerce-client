"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Lock, Loader2, ArrowRight, ShoppingBag, CheckCircle2 } from "lucide-react"

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
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

const resetPasswordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
    const params = useParams()
    const router = useRouter()
    const { setAuth } = useAuthStore()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    const onSubmit = async (values: ResetPasswordValues) => {
        setIsLoading(true)
        try {
            const token = params.token as string
            const res = await api.put(`/auth/reset-password/${token}`, {
                password: values.password
            })

            const { user, token: authToken } = res.data
            setAuth(user, authToken)

            toast.success("Success!", {
                description: "Your password has been reset successfully.",
            })

            router.push("/")
        } catch (err: any) {
            toast.error("Error", {
                description: err.response?.data?.message || "Invalid or expired token. Please try again.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative min-h-[calc(100svh-4rem)] flex items-center justify-center p-4 overflow-hidden bg-slate-50 dark:bg-[#020817] transition-colors duration-300">
            {/* Stability Guard */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .glitch-guard {
                    transform: translateZ(0);
                    will-change: opacity;
                }
            `}} />

            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] bg-emerald-500/5 rounded-full" />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-[440px] z-10 glitch-guard"
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
                                    Reset Password
                                </CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400 text-base">
                                    Create a secure new password for your account.
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 pt-2">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 dark:text-slate-300">New Password</FormLabel>
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
                                                <FormLabel className="text-slate-700 dark:text-slate-300">Confirm New Password</FormLabel>
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
                                    <Button
                                        type="submit"
                                        className="w-full bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold h-12 text-base transition-all active:scale-[0.98]"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                <span>Update Password</span>
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    <div className="mt-8 flex items-center justify-center gap-6 opacity-60 dark:opacity-40">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Encryption Active
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Secure Protocol
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
