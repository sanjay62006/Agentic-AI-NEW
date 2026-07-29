import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import { Briefcase, Search, Mic, MicOff, Volume2, Sparkles, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

export default function JobRecommendation() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    const qParam = searchParams.get('q')
    if (qParam !== null) {
      setSearchQuery(qParam)
    }
  }, [searchParams])

  useEffect(() => {
    api.get('/api/jobs/recommendations')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Voice Search Handler
  const toggleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Voice search is not supported in this browser.')
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    const rec = new SpeechRecognition()
    rec.continuous = false
    rec.interimResults = false
    rec.lang = 'en-US'

    rec.onstart = () => setIsListening(true)
    rec.onend = () => setIsListening(false)

    rec.onresult = (e) => {
      const text = e.results[0][0].transcript
      setSearchQuery(text)
      setSearchParams({ q: text })
      toast.success(`Voice search: "${text}"`)

      // Speak confirmation back to user
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(`Searching jobs for ${text}`)
        window.speechSynthesis.speak(u)
      }
    }

    rec.onerror = () => setIsListening(false)
    rec.start()
  }

  const levelColor = { Beginner: '#ef4444', Intermediate: '#f59e0b', Advanced: '#10b981' }

  // Filter jobs by searchQuery if present
  const filteredJobs = data?.jobs?.filter(j => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.description.toLowerCase().includes(q) ||
      j.skills_required.some(s => s.toLowerCase().includes(q))
    )
  }) || []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', color: 'var(--text-primary)', padding: '40px 24px', transition: 'background 0.5s ease' }}>
      <div style={{ maxWidth: 1050, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
              Job <span className="text-gradient">Recommendations</span>
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Matched to your verified skill level and resume</p>
          </div>

          {/* Voice Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', width: '100%', maxWidth: 460 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value)
                  if (e.target.value) setSearchParams({ q: e.target.value })
                  else setSearchParams({})
                }}
                placeholder="Voice or type to search jobs (e.g. Python, React)..."
                style={{ width: '100%', paddingLeft: 42, paddingRight: 42, height: 46 }}
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setSearchParams({}); }}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Mic Audio Button */}
            <button
              onClick={toggleVoiceSearch}
              title="Voice Search Jobs (Alexa Mode)"
              style={{
                background: isListening ? '#ef4444' : 'var(--primary-gradient)',
                color: 'white',
                border: 'none',
                height: 46,
                padding: '0 18px',
                borderRadius: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 700,
                boxShadow: isListening ? '0 0 20px #ef4444' : '0 4px 14px var(--glow)',
                transition: 'all 0.2s'
              }}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              <span>{isListening ? 'Listening...' : 'Voice Search'}</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}><Briefcase size={48} style={{ marginBottom: 16 }} /><p>Finding best matches...</p></div>
        ) : data?.jobs?.length > 0 ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
              <div className="glass-card" style={{ padding: '12px 20px', display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Your Level:</span>
                <span style={{ color: levelColor[data.level] || 'var(--primary)', fontWeight: 800, fontSize: 16 }}>{data.level}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>• {filteredJobs.length} jobs matched</span>
              </div>

              {searchQuery && (
                <span style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 600 }}>
                  Filtering for: "{searchQuery}"
                </span>
              )}
            </div>

            {filteredJobs.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
                {filteredJobs.map((job, i) => (
                  <div key={i} className="glass-card" style={{ padding: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: 'white' }}>{job.title}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{job.company}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                          {job.match_score}% match
                        </div>
                      </div>
                    </div>

                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>{job.description}</p>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                      {job.skills_required.map((s, j) => (
                        <span key={j} style={{ background: job.matched_skills?.includes(s) ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${job.matched_skills?.includes(s) ? 'rgba(16,185,129,0.4)' : 'var(--border-color)'}`, color: job.matched_skills?.includes(s) ? '#10b981' : 'var(--text-muted)', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{s}</span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>{job.salary}</span>
                      <span style={{ background: `${levelColor[job.level]}20`, color: levelColor[job.level], padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{job.level}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                <Filter size={40} style={{ marginBottom: 12 }} />
                <p style={{ fontSize: 16, fontWeight: 600 }}>No jobs matching "{searchQuery}"</p>
                <button onClick={() => { setSearchQuery(''); setSearchParams({}); }} className="btn-secondary" style={{ marginTop: 16 }}>
                  Clear Search Filter
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
            <Briefcase size={48} style={{ marginBottom: 16 }} />
            <p>Complete your assessment to get job recommendations</p>
          </div>
        )}
      </div>
    </div>
  )
}
