// src/store/wishlistStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import api from '@/lib/api'
import { toast } from 'sonner'

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
                if (typeof window !== 'undefined' && !localStorage.getItem('token')) return;

                try {
                    const res = await api.get('/wishlist')
                    set({ items: res.data.products || [] })
                } catch (err: any) {
                    if (err.response?.status === 401) return;
                    console.error('Failed to fetch wishlist', err)
                    toast.error(err.response?.data?.message || 'Failed to fetch wishlist')
                }
            },

            addToWishlist: async (product) => {
                if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
                    toast.error('Please login to manage your wishlist');
                    return;
                }

                try {
                    const res = await api.post('/wishlist', { productId: product._id })
                    set({ items: res.data.products || [] })
                } catch (err: any) {
                    if (err.response?.status === 401) return;
                    console.error('Failed to add to wishlist', err)
                    toast.error(err.response?.data?.message || 'Failed to add to wishlist')
                }
            },

            removeFromWishlist: async (productId) => {
                if (typeof window !== 'undefined' && !localStorage.getItem('token')) return;

                try {
                    const res = await api.delete(`/wishlist/${productId}`)
                    set({ items: res.data.products || [] })
                } catch (err: any) {
                    if (err.response?.status === 401) return;
                    console.error('Failed to remove from wishlist', err)
                    toast.error(err.response?.data?.message || 'Failed to remove from wishlist')
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
