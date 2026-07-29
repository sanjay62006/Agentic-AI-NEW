import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Brain, ChevronRight, ChevronLeft, Send, Loader } from 'lucide-react'

export default function Assessment() {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)
  const [phase, setPhase] = useState('intro') // intro | questions | submitting
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const startAssessment = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/api/assessment/generate')
      setQuestions(data.questions)
      setPhase('questions')
      toast.success(`${data.total} questions generated!`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate questions')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    const unanswered = questions.filter(q => !answers[q.id]?.trim())
    if (unanswered.length > 0) {
      toast.error(`Please answer all questions (${unanswered.length} remaining)`)
      return
    }
    setPhase('submitting')
    try {
      const payload = questions.map(q => ({ assessment_id: q.id, answer: answers[q.id] || '' }))
      await api.post('/api/assessment/submit', { answers: payload })
      toast.success('Assessment submitted!')
      navigate('/assessment-result')
    } catch (err) {
      toast.error('Submission failed')
      setPhase('questions')
    }
  }

  const q = questions[current]
  const progress = questions.length ? ((current + 1) / questions.length) * 100 : 0

  if (phase === 'intro') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, transition: 'background 0.5s ease' }}>
        <div style={{ maxWidth: 600, textAlign: 'center' }}>
          <div style={{
            background: 'var(--primary-gradient)',
            width: 80,
            height: 80,
            borderRadius: 24,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            boxShadow: '0 0 30px var(--glow)'
          }}>
            <Brain size={44} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, color: 'white' }}>AI Assessment</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.7, marginBottom: 40 }}>
            Our AI will generate 12 personalised questions based on your resume. Answer honestly — this determines your candidate level and job matches.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40, textAlign: 'left' }}>
            {['Technical questions on your skills', 'Project-based questions', 'HR & behavioral questions', 'Conceptual questions'].map((t, i) => (
              <div key={i} className="glass-card" style={{ padding: 16, fontSize: 14, color: 'var(--primary)', fontWeight: 600 }}>✓ {t}</div>
            ))}
          </div>
          <button onClick={startAssessment} disabled={loading} className="btn-primary" style={{ padding: '16px 48px', fontSize: 18, borderRadius: 16 }}>
            {loading ? <><Loader size={20} className="spin" />Generating...</> : <><Brain size={20} />Start Assessment</>}
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'submitting') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Brain size={64} color="var(--primary)" style={{ marginBottom: 24, animation: 'pulse 1s infinite' }} />
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12, color: 'white' }}>Evaluating Your Answers...</h2>
          <p style={{ color: 'var(--text-muted)' }}>Our AI is analysing your responses</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', color: 'var(--text-primary)', padding: '40px 24px', transition: 'background 0.5s ease' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Progress */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Question {current + 1} of {questions.length}</span>
            <span style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 700 }}>{Math.round(progress)}% Complete</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, height: 8 }}>
            <div style={{ background: 'var(--primary-gradient)', height: '100%', borderRadius: 10, width: `${progress}%`, transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Question Card */}
        <div className="glass-card" style={{ padding: 36, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <span style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-color)', color: 'var(--primary)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{q?.skill_tag}</span>
            <span style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-color)', color: 'var(--secondary)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{q?.question_type}</span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.5, marginBottom: 28, color: 'white' }}>{q?.question}</h2>
          <textarea
            value={answers[q?.id] || ''}
            onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
            placeholder="Type your answer here..."
            rows={6}
            style={{ width: '100%', padding: 16, resize: 'vertical' }}
          />
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setCurrent(c => c - 1)} disabled={current === 0} className="btn-secondary" style={{ opacity: current === 0 ? 0.4 : 1, cursor: current === 0 ? 'not-allowed' : 'pointer' }}>
            <ChevronLeft size={18} /> Previous
          </button>

          {current < questions.length - 1 ? (
            <button onClick={() => setCurrent(c => c + 1)} className="btn-primary">
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleSubmit} className="btn-primary" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
              <Send size={18} /> Submit Assessment
            </button>
          )}
        </div>

        {/* Question dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          {questions.map((q, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: i === current ? 'var(--primary-gradient)' : answers[q.id] ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)', color: 'white' }}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
