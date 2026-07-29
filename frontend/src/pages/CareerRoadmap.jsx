import { useEffect, useState } from 'react'
import api from '../api/axios'
import { TrendingUp, Clock, ChevronRight } from 'lucide-react'

export default function CareerRoadmap() {
  const [data, setData] = useState(null)
  const [roles, setRoles] = useState([])
  const [selectedRole, setSelectedRole] = useState('Backend Developer')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/api/career/roles').then(r => setRoles(r.data.roles)).catch(() => {})
    fetchRoadmap('Backend Developer')
  }, [])

  const fetchRoadmap = async (role) => {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/career/roadmap?target_role=${encodeURIComponent(role)}`)
      setData(data)
    } catch (err) {} finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', color: 'var(--text-primary)', padding: '40px 24px', transition: 'background 0.5s ease' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          Career <span className="text-gradient">Roadmap</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Your personalised path to your target role</p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 40 }}>
          {roles.map(r => (
            <button key={r} onClick={() => { setSelectedRole(r); fetchRoadmap(r) }} style={{
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
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}><TrendingUp size={40} style={{ marginBottom: 12 }} /><p>Generating roadmap...</p></div>
        ) : data && (
          <>
            <div className="glass-card" style={{ padding: '16px 24px', marginBottom: 36, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Current Level</span><p style={{ fontWeight: 800, color: 'var(--primary)' }}>{data.current_level}</p></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Target Role</span><p style={{ fontWeight: 800, color: 'var(--secondary)' }}>{data.target_role}</p></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Estimated Time</span><p style={{ fontWeight: 800, color: '#34d399' }}>{data.estimated_time}</p></div>
            </div>

            <div style={{ position: 'relative' }}>
              {(data.steps || []).map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 20, marginBottom: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: 'white', flexShrink: 0, boxShadow: '0 0 15px var(--glow)' }}>{step.step}</div>
                    {i < (data.steps.length - 1) && <div style={{ width: 2, flex: 1, background: 'var(--border-color)', margin: '4px 0' }} />}
                  </div>
                  <div className="glass-card" style={{ padding: 24, flex: 1, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: 'white' }}>{step.title}</h3>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, whiteSpace: 'nowrap' }}>
                        <Clock size={14} />{step.duration}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{step.description}</p>
                    {step.resources?.length > 0 && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {step.resources.map((r, j) => (
                          <span key={j} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: 'var(--primary)', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{r}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
