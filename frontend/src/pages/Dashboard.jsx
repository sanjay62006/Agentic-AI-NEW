import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { FileText, Brain, Target, Briefcase, TrendingUp, BookOpen, CheckCircle, ArrowRight, Award } from 'lucide-react'

const steps = [
  { icon: <FileText size={22} />, label: 'Resume Uploaded', key: 'resume', to: '/upload', color: '#10b981' },
  { icon: <Brain size={22} />, label: 'Assessment Done', key: 'assessment', to: '/assessment', color: '#6366f1' },
  { icon: <Award size={22} />, label: 'Level Classified', key: 'level', to: '/assessment-result', color: '#f59e0b' },
  { icon: <Briefcase size={22} />, label: 'Jobs Matched', key: 'jobs', to: '/jobs', color: '#3b82f6' },
  { icon: <Target size={22} />, label: 'Skill Gap Found', key: 'skillgap', to: '/skill-gap', color: '#ec4899' },
  { icon: <TrendingUp size={22} />, label: 'Roadmap Ready', key: 'roadmap', to: '/roadmap', color: '#8b5cf6' },
  { icon: <BookOpen size={22} />, label: 'Learning Plan', key: 'learning', to: '/learning', color: '#06b6d4' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [status, setStatus] = useState({ resume: false, assessment: false, level: false })
  const [resumeData, setResumeData] = useState(null)
  const [levelData, setLevelData] = useState(null)

  useEffect(() => {
    api.get('/api/resume/latest').then(r => {
      setResumeData(r.data)
      setStatus(s => ({ ...s, resume: true }))
    }).catch(() => {})

    api.get('/api/assessment/results').then(r => {
      setLevelData(r.data)
      setStatus(s => ({ ...s, assessment: true, level: true, jobs: true, skillgap: true, roadmap: true, learning: true }))
    }).catch(() => {})
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', color: 'var(--text-primary)', padding: '40px 24px', transition: 'background 0.5s ease' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
            Welcome back, <span className="text-gradient">{user?.name}</span> 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>Your AI-powered career intelligence dashboard</p>
        </div>

        {/* Progress Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 40 }}>
          {steps.map((s, i) => (
            <Link key={i} to={s.to} style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{
                padding: '20px 16px',
                textAlign: 'center',
                cursor: 'pointer',
                borderColor: status[s.key] ? 'var(--primary)' : 'var(--border-color)',
                background: status[s.key] ? 'var(--card-bg)' : 'rgba(255,255,255,0.02)'
              }}>
                <div style={{ color: status[s.key] ? 'var(--primary)' : 'var(--text-muted)', marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
                  {status[s.key] ? <CheckCircle size={22} color="var(--primary)" /> : s.icon}
                </div>
                <p style={{ color: status[s.key] ? '#ffffff' : 'var(--text-muted)', fontSize: 12, fontWeight: 700, lineHeight: 1.4 }}>{s.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats Row */}
        {levelData && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
            <StatCard label="Overall Score" value={`${levelData.overall_score}%`} color="var(--primary)" />
            <StatCard label="Candidate Level" value={levelData.level} color={levelData.level === 'Advanced' ? '#10b981' : levelData.level === 'Intermediate' ? '#f59e0b' : '#ef4444'} />
            <StatCard label="Skills Detected" value={resumeData?.skills?.length || 0} color="var(--secondary)" />
          </div>
        )}

        {/* Quick Actions */}
        <div className="glass-card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: '#ffffff' }}>
            {status.resume ? '🚀 Continue Your Journey' : '🎯 Get Started'}
          </h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {!status.resume && (
              <ActionBtn to="/upload" label="Upload Resume" />
            )}
            {status.resume && !status.assessment && (
              <ActionBtn to="/assessment" label="Take Assessment" />
            )}
            {status.assessment && (
              <>
                <ActionBtn to="/assessment-result" label="View Results" />
                <ActionBtn to="/jobs" label="Browse Jobs" />
                <ActionBtn to="/roadmap" label="Career Roadmap" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8, fontWeight: 600 }}>{label}</p>
      <p style={{ color, fontSize: 28, fontWeight: 800 }}>{value}</p>
    </div>
  )
}

function ActionBtn({ to, label }) {
  return (
    <Link to={to} className="btn-primary">
      {label} <ArrowRight size={16} />
    </Link>
  )
}
