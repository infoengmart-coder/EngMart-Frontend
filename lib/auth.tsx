'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type UserProfile = {
  name: string
  email: string
  phone: string
  company: string
  role: 'retail' | 'wholesale'
}

type AuthCtx = {
  user: UserProfile | null
  login: (email: string, password?: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  updateUser: (data: Partial<UserProfile>) => void
  switchRole: (role: 'retail' | 'wholesale') => void
  isLoading: boolean
}

const AuthContext = createContext<AuthCtx | null>(null)

const LS_USER_KEY = 'engmart_auth_user'

const MOCK_RETAIL_USER: UserProfile = {
  name: 'Engr. Kamran Ahmed',
  email: 'kamran@kaelectrical.com',
  phone: '+92-300-1234567',
  company: 'KA Electrical Works',
  role: 'retail',
}

const MOCK_WHOLESALE_USER: UserProfile = {
  name: 'M. Rashid Siddiqui',
  email: 'rashid@nationalindustrial.com',
  phone: '+92-321-9876543',
  company: 'National Industrial Corp',
  role: 'wholesale',
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Hydrate user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_USER_KEY)
      if (stored) {
        setUser(JSON.parse(stored))
      } else {
        // Default to logged-in retail user for rich presentation
        setUser(MOCK_RETAIL_USER)
        localStorage.setItem(LS_USER_KEY, JSON.stringify(MOCK_RETAIL_USER))
      }
    } catch (e) {
      console.error('Failed to parse stored user:', e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password?: string) => {
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 800)) // simulate API request

    // If matches wholesale mock email or contains "wholesale" / "rashid", log in as wholesale
    const isWholesale = email.toLowerCase().includes('rashid') || email.toLowerCase().includes('wholesale')
    const loggedInUser = isWholesale ? MOCK_WHOLESALE_USER : MOCK_RETAIL_USER

    setUser(loggedInUser)
    localStorage.setItem(LS_USER_KEY, JSON.stringify(loggedInUser))
    setIsLoading(false)
    return true
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(LS_USER_KEY)
  }, [])

  const updateUser = useCallback((data: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return null
      const updated = { ...prev, ...data }
      localStorage.setItem(LS_USER_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const switchRole = useCallback((role: 'retail' | 'wholesale') => {
    const nextUser = role === 'wholesale' ? MOCK_WHOLESALE_USER : MOCK_RETAIL_USER
    setUser(nextUser)
    localStorage.setItem(LS_USER_KEY, JSON.stringify(nextUser))
  }, [])

  const isAuthenticated = user !== null

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, updateUser, switchRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
