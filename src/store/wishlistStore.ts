// src/store/wishlistStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import api from '@/lib/api'

export interface Product {
    _id: string
    name: string
    price: number
    image: string
    countInStock: number
    slug: string
}

interface WishlistState {
    items: Product[]
    fetchWishlist: () => Promise<void>
    addToWishlist: (product: Product) => Promise<void>
    removeFromWishlist: (productId: string) => Promise<void>
    isInWishlist: (productId: string) => boolean
    clearWishlist: () => void
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],

            fetchWishlist: async () => {
                try {
                    const res = await api.get('/wishlist')
                    set({ items: res.data.products || [] })
                } catch (err) {
                    console.error('Failed to fetch wishlist', err)
                }
            },

            addToWishlist: async (product) => {
                try {
                    const res = await api.post('/wishlist', { productId: product._id })
                    set({ items: res.data.products || [] })
                } catch (err) {
                    console.error('Failed to add to wishlist', err)
                }
            },

            removeFromWishlist: async (productId) => {
                try {
                    const res = await api.delete(`/wishlist/${productId}`)
                    set({ items: res.data.products || [] })
                } catch (err) {
                    console.error('Failed to remove from wishlist', err)
                }
            },

            isInWishlist: (productId) => {
                return get().items.some((item) => item._id === productId)
            },

            clearWishlist: () => set({ items: [] }),
        }),
        {
            name: 'wishlist-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
