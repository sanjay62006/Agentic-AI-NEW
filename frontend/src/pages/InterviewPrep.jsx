import { useState, useEffect } from 'react'
import api from '../api/axios'
import { MessageSquare, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'

const categoryColors = { technical: '#6366f1', behavioral: '#10b981', system_design: '#f59e0b' }
const difficultyColors = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' }

export default function InterviewPrep() {
  const [data, setData] = useState(null)
  const [roles] = useState(['Software Engineer', 'Backend Developer', 'Frontend Developer', 'Full Stack Developer', 'ML Engineer', 'DevOps Engineer'])
  const [selectedRole, setSelectedRole] = useState('Software Engineer')
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { fetchQuestions('Software Engineer') }, [])

  const fetchQuestions = async (role) => {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/interview/questions?role=${encodeURIComponent(role)}`)
      setData(data)
    } catch (err) {} finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', color: 'var(--text-primary)', padding: '40px 24px', transition: 'background 0.5s ease' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          Interview <span className="text-gradient">Preparation</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>AI-generated questions tailored to your level and target role</p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 40 }}>
          {roles.map(r => (
            <button key={r} onClick={() => { setSelectedRole(r); fetchQuestions(r) }} style={{
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
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}><MessageSquare size={40} style={{ marginBottom: 12 }} /><p>Generating questions...</p></div>
        ) : data?.questions?.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {data.questions.map((q, i) => (
              <div key={i} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <button onClick={() => setExpanded(expanded === i ? null : i)} style={{ width: '100%', background: 'none', border: 'none', color: 'white', padding: '20px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, textAlign: 'left' }}>
                    <span style={{ background: 'var(--primary-gradient)', color: 'white', width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{q.question}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ background: `${categoryColors[q.category] || 'var(--primary)'}20`, border: `1px solid ${categoryColors[q.category] || 'var(--primary)'}40`, color: categoryColors[q.category] || 'var(--primary)', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{q.category}</span>
                    <span style={{ background: `${difficultyColors[q.difficulty] || 'var(--text-muted)'}20`, border: `1px solid ${difficultyColors[q.difficulty] || 'var(--text-muted)'}40`, color: difficultyColors[q.difficulty] || 'var(--text-muted)', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{q.difficulty}</span>
                    {expanded === i ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                  </div>
                </button>
                {expanded === i && q.tip && (
                  <div style={{ padding: '0 24px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 10, padding: '12px 16px', marginTop: 16, display: 'flex', gap: 10 }}>
                      <Lightbulb size={18} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} />
                      <p style={{ color: '#fde68a', fontSize: 14, lineHeight: 1.6 }}><strong>Tip:</strong> {q.tip}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
