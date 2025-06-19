const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8083"

export const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`

    const config = {
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    }

    const token = localStorage.getItem("authToken")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    try {
        const response = await fetch(url, config)
        return response
    } catch (error) {
        console.error("API call failed:", {
            url,
            error: error.message,
        })
        throw error
    }
}
