import { api } from './api'

class AuthService {
  async getAuthStatus() {
    try {
      const response = await api.get('/auth/status')
      return response.data
    } catch (error) {
      console.error('Get auth status failed:', error)
      throw error
    }
  }

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/user')
      return response.data
    } catch (error) {
      console.error('Get current user failed:', error)
      throw error
    }
  }

  async logout() {
    try {
      const response = await api.post('/auth/logout')
      return response.data
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  }

  // Redirect to Google OAuth
  initiateGoogleLogin() {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
    window.location.href = `${baseUrl}/auth/google`
  }

  // Check if user is authenticated based on current context
  isAuthenticated() {
    // This would typically check for valid tokens or session
    // For now, we rely on the auth context state
    return true // This will be determined by the AuthContext
  }
}

export const authService = new AuthService()