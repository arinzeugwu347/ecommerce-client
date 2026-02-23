"use client"

import { Instagram, MessageCircle, Mail, MapPin, Phone } from "lucide-react"
import Link from "next/link"
import { useSettings } from "@/components/providers/SettingsProvider"

export default function Footer() {
    const { storeName } = useSettings()

    return (
        <footer className="bg-card border-t pt-16 pb-8 mt-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center space-x-2 font-bold text-2xl">
                            <span className="text-emerald-600 dark:text-emerald-400">{storeName}</span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                            Discover the latest trends in fashion and technology. We provide premium quality products delivered straight to your door.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all text-muted-foreground">
                                <Instagram className="h-5 w-5" />
                                <span className="sr-only">Instagram</span>
                            </a>
                            <a href="https://wa.me/15551234567" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all text-muted-foreground">
                                <MessageCircle className="h-5 w-5" />
                                <span className="sr-only">WhatsApp</span>
                            </a>
                            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all text-muted-foreground">
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-5 w-5 fill-current"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.1-3.44-3.37-3.47-5.75-.02-1.48.35-2.99 1.09-4.24 1.03-1.73 2.82-2.98 4.7-3.33v4.03c-.58.06-1.14.24-1.64.57-.85.5-1.42 1.43-1.43 2.42-.01.59.18 1.18.52 1.66.5.76 1.41 1.22 2.32 1.19.78-.01 1.51-.43 1.94-1.09.35-.5.53-1.11.53-1.72-.03-2.65-.02-5.31-.03-7.96.01-4.23.01-8.46.01-12.69z" />
                                </svg>
                                <span className="sr-only">TikTok</span>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-lg mb-6">Quick Links</h3>
                        <ul className="space-y-4">
                            <li><Link href="/products" className="text-muted-foreground hover:text-emerald-600 transition-colors text-sm">New Arrivals</Link></li>
                            <li><Link href="/categories" className="text-muted-foreground hover:text-emerald-600 transition-colors text-sm">Shop Categories</Link></li>
                            <li><Link href="/about" className="text-muted-foreground hover:text-emerald-600 transition-colors text-sm">About Us</Link></li>
                            <li><Link href="/contact" className="text-muted-foreground hover:text-emerald-600 transition-colors text-sm">Contact Support</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-bold text-lg mb-6">Support</h3>
                        <ul className="space-y-4">
                            <li><Link href="#" className="text-muted-foreground hover:text-emerald-600 transition-colors text-sm">Shipping Policy</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-emerald-600 transition-colors text-sm">Returns & Exchanges</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-emerald-600 transition-colors text-sm">Tracking Orders</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-emerald-600 transition-colors text-sm">Terms & Privacy</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-bold text-lg mb-6">Contact Us</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Mail className="h-4 w-4 text-emerald-600" />
                                <span className="text-sm">support@yourstore.com</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Phone className="h-4 w-4 text-emerald-600" />
                                <span className="text-sm">+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <MapPin className="h-4 w-4 text-emerald-600" />
                                <span className="text-sm">123 Commerce St, NY</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} {storeName}. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3 opacity-50 grayscale hover:grayscale-0 transition-all" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 opacity-50 grayscale hover:grayscale-0 transition-all" />
                    </div>
                </div>
            </div>
        </footer>
    )
}