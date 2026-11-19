import axios, { AxiosInstance } from "axios"

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Crucial for sending & receiving HTTP-only cookies
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
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
