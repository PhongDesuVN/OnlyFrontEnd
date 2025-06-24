import Cookies from 'js-cookie'

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8083"


export const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    }

    if (options.auth) {
        const token = Cookies.get("authToken")
        if (token) {
            headers.Authorization = `Bearer ${token}`
        } else {
            console.warn("⚠️ Missing auth token in Cookies, request may be rejected.")
        }
    }

    const config = {
        method: options.method || "GET",
        headers,
        body: options.body,
        ...options,
    }

    try {
        const response = await fetch(url, config)
        return response
    } catch (error) {
        console.error(" API call failed:", { url, error: error.message })
        throw error
    }
}
