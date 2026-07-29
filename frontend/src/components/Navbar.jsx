import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Brain, LogOut, Mic } from 'lucide-react'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/upload', label: 'Resume' },
  { to: '/assessment', label: 'Assessment' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/skill-gap', label: 'Skill Gap' },
  { to: '/roadmap', label: 'Roadmap' },
  { to: '/learning', label: 'Learning' },
  { to: '/interview', label: 'Interview' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const { currentTheme, themes } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <nav style={{
      background: 'rgba(11, 15, 25, 0.75)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'white', fontWeight: 800, fontSize: 20 }}>
          <div style={{
            background: 'var(--primary-gradient)',
            padding: 6,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px var(--glow)'
          }}>
            <Brain size={22} color="#ffffff" />
          </div>
          <span className="text-gradient">CareerAI</span>
        </Link>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} className="desktop-nav">
          {navLinks.map(l => {
            const isActive = location.pathname === l.to
            return (
              <Link key={l.to} to={l.to} style={{
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: isActive ? 700 : 500,
                background: isActive ? 'var(--primary-gradient)' : 'transparent',
                boxShadow: isActive ? '0 4px 12px var(--glow)' : 'none',
                transition: 'all 0.25s ease'
              }}>{l.label}</Link>
            )
          })}

          {user && (
            <button onClick={handleLogout} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '6px 14px',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              marginLeft: 8,
              transition: 'all 0.2s'
            }}>
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
