import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { Award, TrendingUp, Brain, ChevronDown, ChevronUp } from 'lucide-react'

export default function AssessmentResult() {
  const [data, setData] = useState(null)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    api.get('/api/assessment/results').then(r => setData(r.data)).catch(() => {})
  }, [])

  if (!data) return <LoadingScreen />

  const levelColor = data.level === 'Advanced' ? '#10b981' : data.level === 'Intermediate' ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', color: 'var(--text-primary)', padding: '40px 24px', transition: 'background 0.5s ease' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          Assessment <span className="text-gradient">Results</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 40 }}>Your AI-evaluated performance breakdown</p>

        {/* Score Hero */}
        <div className="glass-card" style={{ padding: 40, textAlign: 'center', marginBottom: 32, borderColor: levelColor }}>
          <div style={{ fontSize: 72, fontWeight: 900, color: levelColor, lineHeight: 1 }}>{data.overall_score}%</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 12, marginBottom: 8, color: 'white' }}>{data.level}</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            {data.level === 'Advanced' ? 'Excellent! You demonstrate strong technical expertise.' :
             data.level === 'Intermediate' ? 'Good foundation! Keep building your skills.' :
             'Great start! Focus on core fundamentals.'}
          </p>
        </div>

        {/* Skill Scores */}
        {data.skill_scores && Object.keys(data.skill_scores).length > 0 && (
          <div className="glass-card" style={{ padding: 28, marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, color: 'white' }}>
              <Brain size={22} color="var(--primary)" /> Skill Breakdown
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Object.entries(data.skill_scores).map(([skill, score]) => (
                <div key={skill}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 15, color: 'white' }}>{skill}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{score}/10</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, height: 10 }}>
                    <div style={{ background: 'var(--primary-gradient)', height: '100%', borderRadius: 8, width: `${score * 10}%`, transition: 'width 0.5s' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Q&A */}
        {data.details?.length > 0 && (
          <div className="glass-card" style={{ padding: 28, marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: 'white' }}>Detailed Feedback</h2>
            {data.details.map((d, i) => (
              <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 16, marginBottom: 16 }}>
                <button onClick={() => setExpanded(expanded === i ? null : i)} style={{ width: '100%', background: 'none', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 15, flex: 1, paddingRight: 16 }}>Q{i + 1}: {d.question}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ color: d.score >= 7 ? '#10b981' : d.score >= 4 ? '#f59e0b' : '#ef4444', fontWeight: 700 }}>{d.score}/10</span>
                    {expanded === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>
                {expanded === i && (
                  <div style={{ marginTop: 12, paddingLeft: 16 }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 8 }}><strong style={{ color: 'var(--primary)' }}>Your answer:</strong> {d.answer || 'No answer'}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}><strong style={{ color: 'var(--primary)' }}>Feedback:</strong> {d.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link to="/jobs" className="btn-primary">View Job Matches →</Link>
          <Link to="/roadmap" className="btn-secondary">Career Roadmap →</Link>
        </div>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <div style={{ textAlign: 'center' }}>
        <Award size={48} color="var(--primary)" style={{ marginBottom: 16 }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading results...</p>
      </div>
    </div>
  )
}
