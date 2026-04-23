import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setLoading(true)
      const response = await authService.getAuthStatus()
      if (response.data.isAuthenticated) {
        setUser(response.data.user)
      }
    } catch (error) {
      console.error('Auth status check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async () => {
    try {
      // Redirect to Google OAuth
      window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
      // Still clear user state even if logout request fails
      setUser(null)
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}