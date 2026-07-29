import { useEffect, useState } from 'react'
import api from '../api/axios'
import { BookOpen, ExternalLink, Play, FileText, Award, Code } from 'lucide-react'

const typeIcons = { course: <BookOpen size={16} />, video: <Play size={16} />, documentation: <FileText size={16} />, certification: <Award size={16} />, practice: <Code size={16} /> }
const typeColors = { course: '#6366f1', video: '#ef4444', documentation: '#06b6d4', certification: '#f59e0b', practice: '#10b981' }

export default function Learning() {
  const [data, setData] = useState(null)
  const [roles, setRoles] = useState([])
  const [selectedRole, setSelectedRole] = useState('Backend Developer')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/api/career/roles').then(r => setRoles(r.data.roles)).catch(() => {})
    fetchLearning('Backend Developer')
  }, [])

  const fetchLearning = async (role) => {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/career/learning?target_role=${encodeURIComponent(role)}`)
      setData(data)
    } catch (err) {} finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', color: 'var(--text-primary)', padding: '40px 24px', transition: 'background 0.5s ease' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          Learning <span className="text-gradient">Resources</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Curated courses, videos, and certifications for your skill gaps</p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 40 }}>
          {roles.map(r => (
            <button key={r} onClick={() => { setSelectedRole(r); fetchLearning(r) }} style={{
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
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}><BookOpen size={40} style={{ marginBottom: 12 }} /><p>Loading resources...</p></div>
        ) : data?.resources?.length > 0 ? (
          <>
            {data.missing_skills?.length > 0 && (
              <div className="glass-card" style={{ padding: '14px 20px', marginBottom: 28, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', borderColor: '#ef4444' }}>
                <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 700 }}>Skills to learn:</span>
                {data.missing_skills.map((s, i) => <span key={i} style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{s}</span>)}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              {data.resources.map((r, i) => {
                const color = typeColors[r.type] || 'var(--primary)'
                return (
                  <div key={i} className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ background: `${color}20`, border: `1px solid ${color}40`, color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {typeIcons[r.type]} {r.type}
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: 'var(--primary)', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{r.skill}</span>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4, color: 'white' }}>{r.title}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{r.platform} • {r.duration}</span>
                    </div>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ background: `${color}20`, border: `1px solid ${color}40`, color, padding: '10px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
                      <ExternalLink size={14} /> Open Resource
                    </a>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
            <BookOpen size={48} style={{ marginBottom: 16 }} />
            <p>No resources found. Try a different role.</p>
          </div>
        )}
      </div>
    </div>
  )
}
