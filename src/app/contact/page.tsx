"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Send, MessageSquare, Instagram, MessageCircle, Share2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useSettings } from "@/components/providers/SettingsProvider"

export default function ContactPage() {
    const { storeName } = useSettings()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Mock submission
        await new Promise(resolve => setTimeout(resolve, 1500))

        toast.success("Message sent! We'll get back to you soon.")
        setIsSubmitting(false)
            ; (e.target as HTMLFormElement).reset()
    }

    const contactInfo = [
        {
            icon: Mail,
            title: "Email Us",
            detail: "support@yourstore.com",
            description: "We'll respond within 24 hours.",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            icon: Phone,
            title: "Call Us",
            detail: "+1 (555) 123-4567",
            description: "Mon-Fri from 9am to 6pm.",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            icon: MapPin,
            title: "Visit Us",
            detail: "123 Commerce St, New York, NY",
            description: "Our flagship showroom.",
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        }
    ]

    return (
        <div className="container mx-auto px-4 py-16 md:py-24 max-w-7xl">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
                >
                    Get in Touch
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-muted-foreground text-lg"
                >
                    Have questions about our products or an order? We're here to help {storeName} customers anytime.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Contact Info Cards */}
                <div className="space-y-6 lg:col-span-1">
                    {contactInfo.map((info, index) => (
                        <motion.div
                            key={info.title}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                            className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${info.bg} ${info.color} group-hover:scale-110 transition-transform`}>
                                    <info.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{info.title}</h3>
                                    <p className="text-foreground font-medium mt-1">{info.detail}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Quick Support Links */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-emerald-600 dark:bg-emerald-700 rounded-2xl p-8 text-white relative overflow-hidden group shadow-lg shadow-emerald-500/20"
                    >
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-2">Live Chat Support</h3>
                            <p className="text-emerald-50/80 text-sm mb-6">Need instant help? Our team is available 24/7 via WhatsApp.</p>
                            <button className="bg-white text-emerald-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors inline-flex items-center gap-2">
                                <MessageCircle className="h-4 w-4" />
                                Chat on WhatsApp
                            </button>
                        </div>
                        <MessageSquare className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10 rotate-12 group-hover:rotate-6 transition-transform duration-500" />
                    </motion.div>
                </div>

                {/* Contact Form */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 bg-card border rounded-3xl p-8 md:p-10 shadow-xl shadow-foreground/5"
                >
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold">Send us a Message</h2>
                        <p className="text-muted-foreground mt-2">Fill out the form below and we'll get back to you as soon as possible.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Your Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full bg-background border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="john@example.com"
                                    className="w-full bg-background border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Subject</label>
                            <select className="w-full bg-background border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none">
                                <option>General Inquiry</option>
                                <option>Order Support</option>
                                <option>Product Feedback</option>
                                <option>Business Partnership</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Message</label>
                            <textarea
                                required
                                rows={6}
                                placeholder="How can we help you today?"
                                className="w-full bg-background border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                            ></textarea>
                        </div>

                        <button
                            disabled={isSubmitting}
                            className="w-full md:w-auto bg-primary text-primary-foreground px-10 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="h-5 w-5" />
                                    Send Message
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>

            {/* Map Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-20 rounded-3xl overflow-hidden border bg-muted h-[400px] relative"
            >
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground flex-col gap-4">
                    <MapPin className="h-12 w-12 text-primary/50" />
                    <p className="text-lg font-medium italic">Interactive Store Map - Coming Soon</p>
                    <div className="grid grid-cols-2 gap-2 opacity-20">
                        <div className="w-64 h-2 bg-primary rounded-full"></div>
                        <div className="w-64 h-2 bg-primary rounded-full"></div>
                        <div className="w-64 h-2 bg-primary rounded-full"></div>
                        <div className="w-64 h-2 bg-primary rounded-full"></div>
                    </div>
                </div>
                {/* Mock Map Background Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none"></div>
            </motion.div>
        </div>
    )
}
