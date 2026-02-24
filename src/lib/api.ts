// src/lib/api.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios"
import { toast } from "sonner"

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "")

// Create axios instance with base URL including /api
const api: AxiosInstance = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Important for sessions/cookies (guest carts)
    timeout: 10000, // 10 seconds timeout
})

// Request interceptor: attach JWT token if user is logged in
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token") // or from zustand/cookies
            if (token) {
                config.headers = config.headers || {}
                config.headers.Authorization = `Bearer ${token}`
            }
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor: handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status
        const message = error.response?.data?.message || error.message || "An unexpected error occurred"

        if (status === 401) {
            // Clear token and optionally redirect
            if (typeof window !== "undefined") {
                localStorage.removeItem("token")
            }
            toast.error("Session expired. Please login again.")
        } else if (status === 500) {
            toast.error("Internal Server Error. Please try again later.")
        } else if (error.code === "ECONNABORTED") {
            toast.error("Request timed out. Please check your connection.")
        } else if (!status) {
            toast.error("Network error. Could not connect to server.")
        }

        return Promise.reject(error)
    }
)

// Optional: helper for GET with params
export const fetchWithParams = async <T>(url: string, params?: any): Promise<T> => {
    const res = await api.get<T>(url, { params })
    return res.data
}

export default api
