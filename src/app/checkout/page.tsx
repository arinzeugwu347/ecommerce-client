// src/app/checkout/page.tsx
"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useCartStore } from "@/store/cartStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import api from "@/lib/api"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import axios from "axios"
import { useSettings } from "@/components/providers/SettingsProvider"

const checkoutSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    postalCode: z.string().min(3, "Postal code is required"),
    country: z.string().min(2, "Country is required"),
    paymentMethod: z.enum(["stripe", "paypal", "cash_on_delivery"]),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
    const queryClient = useQueryClient()
    const { items, clearCart } = useCartStore()
    const { currencySymbol, taxRate, shippingThreshold, flatShippingRate } = useSettings()
    const router = useRouter()

    const subtotal = items.reduce((sum, item) => {
        const price = item.priceAtAdd || item.product.price || 0
        return sum + (item.quantity * Number(price))
    }, 0)
    const shipping = subtotal > shippingThreshold ? 0 : flatShippingRate
    const tax = Number((subtotal * taxRate).toFixed(2))
    const total = subtotal + shipping + tax

    const form = useForm<CheckoutForm>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            fullName: "",
            address: "",
            city: "",
            postalCode: "",
            country: "",
            paymentMethod: "stripe",
        },
    })

    const onSubmit = async (data: CheckoutForm) => {
        try {
            const orderData = {
                shippingAddress: {
                    address: data.address,
                    city: data.city,
                    postalCode: data.postalCode,
                    country: data.country,
                },
                paymentMethod: data.paymentMethod,
            }

            const res = await api.post("/orders", orderData)
            const order = res.data

            // Clear local and backend cart sync
            clearCart()
            queryClient.invalidateQueries({ queryKey: ["cart"] })

            toast.success("Order placed!", {
                description: `Order #${order._id} confirmed`,
            })

            router.push(`/order-success?orderId=${order._id}`)
        } catch (err: any) {
            const errorMessage = err.response?.data?.error?.message ||
                err.response?.data?.message ||
                (err instanceof Error ? err.message : "Please try again")

            toast.error("Failed to place order", {
                description: errorMessage || "Please check your details and try again",
            })
        }
    }

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <Button asChild size="lg">
                    <Link href="/products">Continue Shopping</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-10">Checkout</h1>

            <div className="grid lg:grid-cols-3 gap-12">
                {/* Shipping Form */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="fullName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Address</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="123 Main St" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="city"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>City</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Lagos" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="postalCode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Postal Code</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="100001" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Country</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nigeria" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="pt-6 border-t">
                                        <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    id="stripe"
                                                    value="stripe"
                                                    {...form.register("paymentMethod")}
                                                    className="h-5 w-5"
                                                />
                                                <label htmlFor="stripe" className="text-lg cursor-pointer">
                                                    Stripe (Credit/Debit Card)
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    id="paypal"
                                                    value="paypal"
                                                    {...form.register("paymentMethod")}
                                                    className="h-5 w-5"
                                                />
                                                <label htmlFor="paypal" className="text-lg cursor-pointer">
                                                    PayPal
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    id="cash_on_delivery"
                                                    value="cash_on_delivery"
                                                    {...form.register("paymentMethod")}
                                                    className="h-5 w-5"
                                                />
                                                <label htmlFor="cash_on_delivery" className="text-lg cursor-pointer">
                                                    Cash on Delivery
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <Button type="submit" size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 mt-8">
                                        Place Order – {currencySymbol}{Number(total || 0).toFixed(2)}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {items.map((item) => (
                                <div key={item.product._id} className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12 rounded">
                                            <Image
                                                src={item.product.image}
                                                alt={item.product.name}
                                                className="object-cover rounded"
                                                loading="eager"
                                                fill
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            />

                                        </div>
                                        <div>
                                            <p className="font-medium line-clamp-1">{item.product.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Qty: {item.quantity} × {currencySymbol}{Number(item.priceAtAdd || 0).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="font-medium">
                                        {currencySymbol}{(item.quantity * Number(item.priceAtAdd || 0)).toFixed(2)}
                                    </span>
                                </div>
                            ))}

                            <Separator />

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{currencySymbol}{Number(subtotal || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>{currencySymbol}{Number(shipping || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax</span>
                                    <span>{currencySymbol}{Number(tax || 0).toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-xl font-bold">
                                    <span>Total</span>
                                    <span>{currencySymbol}{Number(total || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}