import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Brain, User, Mail, Lock } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await api.post('/api/auth/register', form)
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', icon: <User size={18} />, placeholder: 'John Doe' },
    { key: 'email', label: 'Email', type: 'email', icon: <Mail size={18} />, placeholder: 'you@example.com' },
    { key: 'password', label: 'Password', type: 'password', icon: <Lock size={18} />, placeholder: '••••••••' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, transition: 'background 0.5s ease' }}>
      <div className="glass-card" style={{ padding: 44, width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            background: 'var(--primary-gradient)',
            width: 60,
            height: 60,
            borderRadius: 16,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            boxShadow: '0 0 20px var(--glow)'
          }}>
            <Brain size={32} color="#ffffff" />
          </div>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Start your AI-powered career journey</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {fields.map(f => (
            <div key={f.key}>
              <label style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 8 }}>{f.label}</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{f.icon}</span>
                <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required
                  style={{ width: '100%', paddingLeft: 44 }}
                  placeholder={f.placeholder} />
              </div>
            </div>
          ))}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 8 }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 24, fontSize: 14 }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  )
}
