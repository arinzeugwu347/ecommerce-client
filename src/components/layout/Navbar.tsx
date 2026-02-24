"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Search, Moon, Sun, ShoppingCart, User, Menu, X, LogOut, Package, User as UserIcon, LogIn, ChevronRight, Heart } from "lucide-react"
import { useState, useEffect, useRef, forwardRef } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { useCartStore } from "@/store/cartStore"
import { useRouter, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/useDebounce"
import Image from "next/image"
import { useAuthStore } from "@/store/authStore"
import { useSettings } from "@/components/providers/SettingsProvider"
import { useWishlistStore } from "@/store/wishlistStore"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"

export default function Navbar() {
    const { theme, setTheme } = useTheme()
    const router = useRouter()
    const pathname = usePathname()
    const { storeName } = useSettings()
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const debouncedQuery = useDebounce(searchQuery, 300)
    const searchInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    const { user, isAuthenticated, logout } = useAuthStore()
    const { itemCount, setCart } = useCartStore()
    const { items: wishlistItems, fetchWishlist } = useWishlistStore()

    const { data: backendCart } = useQuery({
        queryKey: ["cart", isAuthenticated],
        queryFn: () => api.get("/cart").then(res => res.data),
        staleTime: 1000 * 60 * 5,
    })

    useEffect(() => {
        if (backendCart?.items && mounted) {
            setCart(backendCart.items)
        }
        if (isAuthenticated && mounted) {
            fetchWishlist()
        }
    }, [backendCart, setCart, mounted, isAuthenticated, fetchWishlist])

    const { data: suggestions = [] } = useQuery({
        queryKey: ["search-suggestions", debouncedQuery],
        queryFn: () => api.get("/products", { params: { keyword: debouncedQuery, limit: 5 } }).then(res => res.data.products || []),
        enabled: debouncedQuery.length >= 2,
    })

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
            setSearchQuery("")
            setIsSearchOpen(false)
        }
    }

    const navLinks = [
        { name: "Products", href: "/products" },
        { name: "Categories", href: "/categories" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
    ]

    const isDark = theme === "dark"

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16 md:h-20 gap-4">
                    {/* Logo & Desktop Nav */}
                    <div className="flex items-center gap-8 lg:gap-12">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <span className="text-2xl font-black tracking-tighter text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform duration-200">
                                {storeName}
                            </span>
                        </Link>

                        <nav className="hidden lg:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-sm font-semibold transition-all duration-200 hover:text-emerald-500 relative py-1 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-emerald-500 after:transition-all ${pathname === link.href ? 'text-emerald-500 after:w-full' : 'text-muted-foreground'}`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Desktop Search */}
                    <div className="hidden md:flex flex-1 max-w-md mx-4 relative group">
                        <SearchBar
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            handleSearch={handleSearch}
                            debouncedQuery={debouncedQuery}
                            suggestions={suggestions}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 md:gap-3">
                        {/* Mobile Search Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => {
                                setIsSearchOpen(!isSearchOpen)
                                if (!isSearchOpen) setTimeout(() => searchInputRef.current?.focus(), 100)
                            }}
                        >
                            {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                        </Button>

                        {/* Theme Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"
                            onClick={() => setTheme(isDark ? "light" : "dark")}
                        >
                            {mounted ? (
                                isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
                            ) : (
                                <div className="h-5 w-5" />
                            )}
                        </Button>

                        {/* Wishlist */}
                        <Button variant="ghost" size="icon" asChild className="relative rounded-full hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors">
                            <Link href="/wishlist">
                                <Heart className="h-5 w-5" />
                                {mounted && wishlistItems.length > 0 && (
                                    <Badge
                                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-[10px] bg-red-500 hover:bg-red-600 flex items-center justify-center border-2 border-background"
                                    >
                                        {wishlistItems.length}
                                    </Badge>
                                )}
                            </Link>
                        </Button>

                        {/* Cart */}
                        <Button variant="ghost" size="icon" asChild className="relative rounded-full hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors">
                            <Link href="/cart">
                                <ShoppingCart className="h-5 w-5" />
                                {mounted && itemCount > 0 && (
                                    <Badge
                                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-[10px] bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center border-2 border-background"
                                    >
                                        {itemCount}
                                    </Badge>
                                )}
                            </Link>
                        </Button>

                        {/* Profile Dropdown */}
                        <div className="hidden sm:block">
                            {mounted && isAuthenticated ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full bg-muted border hover:border-emerald-500/50 transition-all overflow-hidden p-0">
                                            {user?.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon className="h-5 w-5" />
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-xl border-emerald-500/10">
                                        <DropdownMenuLabel className="p-3">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{user?.name}</p>
                                                <p className="text-xs text-muted-foreground truncate font-normal">
                                                    {user?.email}
                                                </p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator className="opacity-50" />
                                        <div className="p-1 space-y-1">
                                            <DropdownMenuItem className="rounded-xl cursor-pointer p-3 hover:bg-emerald-500/5" onClick={() => router.push("/profile")}>
                                                <UserIcon className="mr-3 h-4 w-4 text-emerald-600" />
                                                <span className="font-medium text-sm">My Profile</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="rounded-xl cursor-pointer p-3 hover:bg-emerald-500/5" onClick={() => router.push("/orders")}>
                                                <Package className="mr-3 h-4 w-4 text-emerald-600" />
                                                <span className="font-medium text-sm">Order History</span>
                                            </DropdownMenuItem>
                                        </div>
                                        <DropdownMenuSeparator className="opacity-50" />
                                        <DropdownMenuItem
                                            onClick={logout}
                                            className="rounded-xl cursor-pointer p-3 text-red-600 focus:text-red-600 focus:bg-red-500/5 flex items-center gap-3 transition-colors m-1"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span className="font-bold text-sm">Sign Out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 font-bold shadow-lg shadow-emerald-500/20" asChild>
                                    <Link href="/login">Sign In</Link>
                                </Button>
                            )}
                        </div>

                        {/* Mobile Toggle */}
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild className="lg:hidden">
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 border-l border-emerald-500/10">
                                <SheetHeader>
                                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                    <SheetDescription className="sr-only">
                                        Access store pages and your account.
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="flex flex-col h-full bg-background">
                                    <div className="p-6 border-b border-emerald-500/5">
                                        <h2 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{storeName}</h2>
                                    </div>

                                    <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 pl-2">Navigation</p>
                                        {navLinks.map((link) => (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                onClick={() => setOpen(false)}
                                                className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-200 group ${pathname === link.href ? 'bg-emerald-500/10 text-emerald-600' : 'hover:bg-muted text-foreground'}`}
                                            >
                                                <span className="font-bold">{link.name}</span>
                                                <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${pathname === link.href ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                                            </Link>
                                        ))}
                                        <Link
                                            href="/wishlist"
                                            onClick={() => setOpen(false)}
                                            className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-200 group ${pathname === '/wishlist' ? 'bg-red-500/10 text-red-600' : 'hover:bg-muted text-foreground'}`}
                                        >
                                            <span className="font-bold flex items-center gap-2">
                                                Wishlist
                                                {mounted && wishlistItems.length > 0 && (
                                                    <Badge className="h-5 rounded-full px-1.5 text-[10px] bg-red-500">{wishlistItems.length}</Badge>
                                                )}
                                            </span>
                                            <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${pathname === '/wishlist' ? 'text-red-500' : 'text-muted-foreground'}`} />
                                        </Link>
                                    </div>

                                    <div className="p-6 mt-auto border-t border-emerald-500/5 bg-muted/30">
                                        {mounted && isAuthenticated ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4 p-2">
                                                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                                                        <UserIcon className="h-6 w-6" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold truncate">{user?.name}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Button variant="outline" className="rounded-xl font-bold text-xs" asChild onClick={() => setOpen(false)}>
                                                        <Link href="/profile">Profile</Link>
                                                    </Button>
                                                    <Button variant="destructive" className="rounded-xl font-bold text-xs" onClick={() => { logout(); setOpen(false); }}>
                                                        Sign Out
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold h-12 shadow-lg shadow-emerald-500/20" asChild onClick={() => setOpen(false)}>
                                                <Link href="/login">Sign In & Enjoy</Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                {/* Mobile Search Overlay */}
                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden overflow-hidden border-t border-emerald-500/5"
                        >
                            <div className="py-4 px-1 pb-6">
                                <SearchBar
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    handleSearch={handleSearch}
                                    debouncedQuery={debouncedQuery}
                                    suggestions={suggestions}
                                    ref={searchInputRef}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    )
}

const SearchBar = forwardRef(({ searchQuery, setSearchQuery, handleSearch, debouncedQuery, suggestions }: any, ref: any) => {
    const { currencySymbol } = useSettings()
    return (
        <div className="w-full relative">
            <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <Input
                    type="search"
                    placeholder="Search for items, brands..."
                    className="pl-11 pr-24 w-full h-11 md:h-12 bg-muted/30 border-2 border-transparent focus:border-emerald-500/30 focus:bg-background rounded-2xl transition-all duration-300 shadow-none ring-0 placeholder:text-muted-foreground/60"
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    ref={ref}
                />
                <div className="absolute inset-y-0 right-0 p-1 flex items-center">
                    <Button
                        type="submit"
                        size="sm"
                        className="h-9 px-4 md:px-5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 transition-all text-xs"
                    >
                        Search
                    </Button>
                </div>
            </form>

            <AnimatePresence>
                {debouncedQuery.length >= 2 && suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-3 bg-background border border-emerald-500/10 rounded-3xl shadow-2xl overflow-hidden z-50 p-2"
                    >
                        {suggestions.map((product: any) => (
                            <Link
                                key={product._id}
                                href={`/products/${product.slug}`}
                                className="flex items-center gap-4 p-3 hover:bg-emerald-500/5 rounded-2xl transition-all group"
                                onClick={() => setSearchQuery("")}
                            >
                                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-muted group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate group-hover:text-emerald-600 transition-colors">{product.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">
                                            {currencySymbol}{(Number(product.price) || 0).toFixed(2)}
                                        </span>
                                        {product.oldPrice && (
                                            <span className="text-[10px] text-muted-foreground line-through opacity-60">
                                                {currencySymbol}{product.oldPrice.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </Link>
                        ))}
                        <div className="p-2 pt-0 mt-1">
                            <Button variant="ghost" asChild className="w-full rounded-xl hover:bg-emerald-500/10 text-emerald-600 font-bold text-xs py-5">
                                <Link href={`/search?q=${encodeURIComponent(debouncedQuery)}`}>
                                    View all results for "{debouncedQuery}"
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
})
SearchBar.displayName = "SearchBar"
