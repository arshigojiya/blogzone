import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)
const API_BASE_URL = 'http://localhost:5000/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const token = localStorage.getItem('blogzone_token')
    const savedUser = localStorage.getItem('blogzone_user')

    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        localStorage.setItem('blogzone_token', data.token)
        localStorage.setItem('blogzone_user', JSON.stringify(data.user))
        return { success: true, user: data.user }
      } else {
        return { success: false, error: data.message || 'Login failed' }
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        localStorage.setItem('blogzone_token', data.token)
        localStorage.setItem('blogzone_user', JSON.stringify(data.user))
        return { success: true, user: data.user }
      } else {
        return { success: false, error: data.message || 'Registration failed' }
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('blogzone_token')
    localStorage.removeItem('blogzone_user')
  }

  const updateUser = async (updatedData) => {
    try {
      const token = localStorage.getItem('blogzone_token')
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      })

      const data = await response.json()

      if (response.ok) {
        const updatedUser = { ...user, ...data }
        setUser(updatedUser)
        localStorage.setItem('blogzone_user', JSON.stringify(updatedUser))
        return { success: true, user: updatedUser }
      } else {
        return { success: false, error: data.message || 'Update failed' }
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const refreshUser = () => {
    const savedUser = localStorage.getItem('blogzone_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem('blogzone_token')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    loading,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    getAuthHeaders,
    API_BASE_URL,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

