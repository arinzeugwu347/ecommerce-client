// src/components/homepage/Hero.tsx
"use client"

import { motion, Variants } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const fadeIn: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
}

export default function Hero() {
    return (
        <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="relative bg-gradient-to-br from-emerald-50 to-background dark:from-emerald-950/30"
        >
            <div className="container mx-auto px-4 py-24 md:py-32 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
                >
                    Discover Premium Products
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10"
                >
                    Shop the latest electronics, fashion, home essentials and more — with fast shipping and unbeatable prices.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="flex flex-wrap justify-center gap-4"
                >
                    <Button size="lg" asChild>
                        <Link href="/products">Shop Now</Link>
                    </Button>
                    <Button size="lg" variant="outline">
                        <Link href="/categories">Browse Categories</Link>
                    </Button>
                </motion.div>
            </div>
        </motion.section>
    )
}