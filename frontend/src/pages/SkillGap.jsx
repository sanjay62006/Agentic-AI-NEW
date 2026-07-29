import { useEffect, useState } from 'react'
import api from '../api/axios'
import { Target, CheckCircle, XCircle } from 'lucide-react'

export default function SkillGap() {
  const [data, setData] = useState(null)
  const [roles, setRoles] = useState([])
  const [selectedRole, setSelectedRole] = useState('Backend Developer')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/api/career/roles').then(r => setRoles(r.data.roles)).catch(() => {})
    fetchGap('Backend Developer')
  }, [])

  const fetchGap = async (role) => {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/career/skill-gap?target_role=${encodeURIComponent(role)}`)
      setData(data)
    } catch (err) {} finally { setLoading(false) }
  }

  const handleRoleChange = (role) => {
    setSelectedRole(role)
    fetchGap(role)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', color: 'var(--text-primary)', padding: '40px 24px', transition: 'background 0.5s ease' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          Skill Gap <span className="text-gradient">Analysis</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Compare your skills against target role requirements</p>

        {/* Role Selector */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 40 }}>
          {roles.map(r => (
            <button key={r} onClick={() => handleRoleChange(r)} style={{
              background: selectedRole === r ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${selectedRole === r ? 'transparent' : 'var(--border-color)'}`,
              color: 'white',
              padding: '8px 18px',
              borderRadius: 20,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: selectedRole === r ? 700 : 500,
              boxShadow: selectedRole === r ? '0 4px 12px var(--glow)' : 'none',
              transition: 'all 0.2s'
            }}>
              {r}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}><Target size={40} style={{ marginBottom: 12 }} /><p>Analysing skill gap...</p></div>
        ) : data && (
          <>
            {/* Match Score */}
            <div className="glass-card" style={{ padding: 32, marginBottom: 28, textAlign: 'center' }}>
              <div style={{ fontSize: 64, fontWeight: 900, color: data.match_percentage >= 70 ? '#10b981' : data.match_percentage >= 40 ? '#f59e0b' : '#ef4444' }}>
                {data.match_percentage}%
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 16, marginTop: 8 }}>Match with <strong style={{ color: 'white' }}>{data.target_role}</strong></p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div className="glass-card" style={{ padding: 24, borderColor: '#10b981' }}>
                <h3 style={{ color: '#10b981', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={20} /> Skills You Have ({data.present_skills?.length || 0})
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(data.present_skills || []).map((s, i) => (
                    <span key={i} style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{s}</span>
                  ))}
                </div>
              </div>

              <div className="glass-card" style={{ padding: 24, borderColor: '#ef4444' }}>
                <h3 style={{ color: '#ef4444', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <XCircle size={20} /> Skills to Learn ({data.missing_skills?.length || 0})
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(data.missing_skills || []).map((s, i) => (
                    <span key={i} style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
