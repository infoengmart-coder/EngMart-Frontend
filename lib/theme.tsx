'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
  isDark: false,
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Force light mode only
    const root = document.documentElement
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
    localStorage.setItem('eng-mart-theme-v2', 'light')
    setMounted(true)
  }, [])

  if (!mounted) return <>{children}</>

  return (
    <ThemeContext.Provider value={{ theme: 'light', toggleTheme: () => {}, isDark: false }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
