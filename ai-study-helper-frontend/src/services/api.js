import axios from 'axios'

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      // Forbidden
      console.error('Access forbidden:', error.response.data)
    } else if (error.response?.status >= 500) {
      // Server error
      console.error('Server error:', error.response.data)
    } else if (error.code === 'NETWORK_ERROR') {
      console.error('Network error - server might be down')
    }

    return Promise.reject(error)
  }
)

// Helper function to handle API responses
export const handleApiResponse = (response) => {
  if (response.data?.success) {
    return response.data
  } else {
    throw new Error(response.data?.message || 'API request failed')
  }
}

// Helper function to handle API errors
export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message)
  } else if (error.message) {
    throw new Error(error.message)
  } else {
    throw new Error('An unexpected error occurred')
  }
}

export default api