import axios, { AxiosInstance } from "axios"

function getBaseURL(): string {
  const envUrl = (import.meta.env.VITE_API_URL || "").trim()

  // If a valid HTTP/HTTPS URL or relative path is provided, use it
  if (envUrl && (envUrl.startsWith("http://") || envUrl.startsWith("https://") || envUrl.startsWith("/"))) {
    return envUrl.replace(/\/+$/, "")
  }

  // When deployed on Vercel or any live host without a valid VITE_API_URL, default to /api
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return "/api"
  }

  // Local development default
  return "http://localhost:5000/api"
}

export const api: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // Crucial for sending & receiving HTTP-only cookies
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
})

// Request interceptor to attach Authorization Bearer token from localStorage
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("pathlearn_token")
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // ignore in environments where localStorage is unavailable
  }
  return config
})

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optionally handle common errors
    return Promise.reject(error)
  }
)

export default api
