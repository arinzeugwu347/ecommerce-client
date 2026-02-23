import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import api from "@/lib/api"
import { useCartStore } from "./cartStore"

export interface User {
    _id: string
    name: string
    email: string
    role: string
    avatar?: string
    createdAt?: string
}

interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    mounted: boolean

    setAuth: (user: User, token: string) => void
    updateUser: (user: User) => void
    logout: () => void
    googleLogin: (idToken: string) => Promise<void>
    setError: (error: string | null) => void
    clearError: () => void
    setMounted: (mounted: boolean) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            mounted: false,

            setAuth: (user, token) => {
                if (typeof window !== "undefined") {
                    localStorage.setItem("token", token)
                }
                set({ user, token, isAuthenticated: true, error: null })
                // Sync cart after login
                useCartStore.getState().fetchCart()
            },

            updateUser: (user) => {
                set({ user })
            },

            googleLogin: async (idToken) => {
                set({ isLoading: true, error: null })
                try {
                    const res = await api.post("/auth/google", { idToken })
                    const { user, token } = res.data
                    if (typeof window !== "undefined") {
                        localStorage.setItem("token", token)
                    }
                    set({ user, token, isAuthenticated: true, isLoading: false, error: null })
                    // Sync cart after google login
                    useCartStore.getState().fetchCart()
                } catch (err: any) {
                    const msg = err.response?.data?.error?.message || "Google login failed"
                    set({ error: msg, isLoading: false })
                    throw new Error(msg)
                }
            },

            logout: () => {
                if (typeof window !== "undefined") {
                    localStorage.removeItem("token")
                }
                set({ user: null, token: null, isAuthenticated: false, error: null })
                // Clear cart state on logout (or you might want to keep it if guest carts are allowed)
                // For now, clearing it is safer to prevent user data leak to next guest
                useCartStore.getState().clearCart()
            },

            setError: (error) => set({ error }),
            clearError: () => set({ error: null }),
            setMounted: (mounted) => set({ mounted }),
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
)
