import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const themes = [
  {
    id: 'cosmic',
    name: 'Cosmic Neon',
    icon: '🔮',
    primary: '#a78bfa',
    secondary: '#60a5fa',
    accent: '#c084fc',
    bgGradient: 'radial-gradient(ellipse at 20% -20%, #2e1065 0%, #0f172a 50%, #020617 100%)',
    cardBg: 'rgba(30, 27, 75, 0.45)',
    border: 'rgba(167, 139, 250, 0.25)',
    glow: 'rgba(167, 139, 250, 0.4)'
  },
  {
    id: 'emerald',
    name: 'Cyber Emerald',
    icon: '⚡',
    primary: '#10b981',
    secondary: '#14b8a6',
    accent: '#34d399',
    bgGradient: 'radial-gradient(ellipse at 20% -20%, #064e3b 0%, #022c22 50%, #020617 100%)',
    cardBg: 'rgba(6, 78, 59, 0.35)',
    border: 'rgba(16, 185, 129, 0.25)',
    glow: 'rgba(16, 185, 129, 0.4)'
  },
  {
    id: 'sunset',
    name: 'Sunset Flare',
    icon: '🔥',
    primary: '#f43f5e',
    secondary: '#f59e0b',
    accent: '#fb7185',
    bgGradient: 'radial-gradient(ellipse at 20% -20%, #881337 0%, #451a03 50%, #0c0a09 100%)',
    cardBg: 'rgba(136, 19, 55, 0.35)',
    border: 'rgba(244, 63, 94, 0.25)',
    glow: 'rgba(244, 63, 94, 0.4)'
  },
  {
    id: 'cyan',
    name: 'Electric Cyan',
    icon: '💎',
    primary: '#06b6d4',
    secondary: '#3b82f6',
    accent: '#22d3ee',
    bgGradient: 'radial-gradient(ellipse at 20% -20%, #164e63 0%, #0f172a 50%, #030712 100%)',
    cardBg: 'rgba(22, 78, 99, 0.35)',
    border: 'rgba(6, 182, 212, 0.25)',
    glow: 'rgba(6, 182, 212, 0.4)'
  },
  {
    id: 'magenta',
    name: 'Vaporwave',
    icon: '🌆',
    primary: '#ec4899',
    secondary: '#a855f7',
    accent: '#f472b6',
    bgGradient: 'radial-gradient(ellipse at 20% -20%, #831843 0%, #3b0764 50%, #090514 100%)',
    cardBg: 'rgba(131, 24, 67, 0.35)',
    border: 'rgba(236, 72, 153, 0.25)',
    glow: 'rgba(236, 72, 153, 0.4)'
  },
  {
    id: 'nordic',
    name: 'Nordic Slate',
    icon: '🧊',
    primary: '#38bdf8',
    secondary: '#818cf8',
    accent: '#7dd3fc',
    bgGradient: 'radial-gradient(ellipse at 20% -20%, #1e293b 0%, #0f172a 50%, #020617 100%)',
    cardBg: 'rgba(30, 41, 59, 0.45)',
    border: 'rgba(56, 189, 248, 0.25)',
    glow: 'rgba(56, 189, 248, 0.4)'
  }
]

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('career_ai_theme') || 'cosmic'
  })
  
  const [customPrimary, setCustomPrimary] = useState(() => {
    return localStorage.getItem('career_ai_custom_p') || '#a78bfa'
  })
  
  const [customSecondary, setCustomSecondary] = useState(() => {
    return localStorage.getItem('career_ai_custom_s') || '#60a5fa'
  })

  useEffect(() => {
    const root = document.documentElement
    localStorage.setItem('career_ai_theme', currentTheme)

    if (currentTheme === 'custom') {
      localStorage.setItem('career_ai_custom_p', customPrimary)
      localStorage.setItem('career_ai_custom_s', customSecondary)
      root.setAttribute('data-theme', 'custom')
      root.style.setProperty('--primary', customPrimary)
      root.style.setProperty('--secondary', customSecondary)
      root.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${customPrimary}, ${customSecondary})`)
      root.style.setProperty('--bg-gradient', `radial-gradient(ellipse at 20% -20%, ${customPrimary}33 0%, #0f172a 50%, #020617 100%)`)
      root.style.setProperty('--card-bg', `${customPrimary}1a`)
      root.style.setProperty('--border-color', `${customPrimary}40`)
      root.style.setProperty('--glow', `${customPrimary}66`)
    } else {
      const themeObj = themes.find(t => t.id === currentTheme) || themes[0]
      root.setAttribute('data-theme', themeObj.id)
      root.style.setProperty('--primary', themeObj.primary)
      root.style.setProperty('--secondary', themeObj.secondary)
      root.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${themeObj.primary}, ${themeObj.secondary})`)
      root.style.setProperty('--bg-gradient', themeObj.bgGradient)
      root.style.setProperty('--card-bg', themeObj.cardBg)
      root.style.setProperty('--border-color', themeObj.border)
      root.style.setProperty('--glow', themeObj.glow)
    }
  }, [currentTheme, customPrimary, customSecondary])

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      setCurrentTheme,
      customPrimary,
      setCustomPrimary,
      customSecondary,
      setCustomSecondary,
      themes
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
