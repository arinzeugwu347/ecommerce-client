// src/store/cartStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import api from '@/lib/api'

export interface CartItem {
    product: {
        _id: string
        name: string
        price: number
        image: string
        countInStock: number
    }
    quantity: number
    priceAtAdd: number
}

interface CartState {
    items: CartItem[]
    itemCount: number
    addItem: (item: CartItem) => void
    updateQuantity: (productId: string, quantity: number) => void
    removeItem: (productId: string) => void
    clearCart: () => void
    setCart: (cart: CartItem[]) => void // for merge / sync from backend
    fetchCart: () => Promise<void>
}

export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            items: [],
            itemCount: 0,

            addItem: (newItem) =>
                set((state) => {
                    const existing = state.items.find((i) => i.product._id === newItem.product._id)

                    if (existing) {
                        const newQty = existing.quantity + newItem.quantity
                        if (newQty > newItem.product.countInStock) return state // prevent oversell

                        return {
                            items: state.items.map((i) =>
                                i.product._id === newItem.product._id ? { ...i, quantity: newQty } : i
                            ),
                            itemCount: state.itemCount + newItem.quantity,
                        }
                    }

                    return {
                        items: [...state.items, newItem],
                        itemCount: state.itemCount + newItem.quantity,
                    }
                }),

            updateQuantity: (productId, quantity) =>
                set((state) => {
                    const item = state.items.find((i) => i.product._id === productId)
                    if (!item) return state

                    const diff = quantity - item.quantity
                    if (quantity < 1 || quantity > item.product.countInStock) return state

                    return {
                        items: state.items.map((i) =>
                            i.product._id === productId ? { ...i, quantity } : i
                        ),
                        itemCount: state.itemCount + diff,
                    }
                }),

            removeItem: (productId) =>
                set((state) => {
                    const item = state.items.find((i) => i.product._id === productId)
                    if (!item) return state

                    return {
                        items: state.items.filter((i) => i.product._id !== productId),
                        itemCount: state.itemCount - item.quantity,
                    }
                }),

            clearCart: () => set({ items: [], itemCount: 0 }),

            setCart: (cartItems) =>
                set({
                    items: cartItems,
                    itemCount: cartItems.reduce((sum, i) => sum + i.quantity, 0),
                }),

            fetchCart: async () => {
                if (typeof window !== 'undefined' && !localStorage.getItem('token')) return;

                try {
                    const res = await api.get('/cart')
                    const cartItems = res.data.items || []
                    set({
                        items: cartItems,
                        itemCount: cartItems.reduce((sum: number, i: any) => sum + i.quantity, 0),
                    })
                } catch (err: any) {
                    // Fail silently or handle via global interceptor
                    if (err.response?.status === 401) return;
                    console.error('Failed to fetch cart', err);
                }
            },
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)