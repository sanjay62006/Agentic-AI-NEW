import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Upload, FileText, CheckCircle, X, Brain } from 'lucide-react'

export default function ResumeUpload() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [drag, setDrag] = useState(false)
  const navigate = useNavigate()

  const handleDrop = useCallback(e => {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === 'application/pdf') setFile(f)
    else toast.error('Please upload a PDF file')
  }, [])

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a PDF file')
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const { data } = await api.post('/api/resume/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(data)
      toast.success('Resume analysed successfully!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', color: 'var(--text-primary)', padding: '40px 24px', transition: 'background 0.5s ease' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          Upload <span className="text-gradient">Resume</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 40 }}>Our AI will extract your skills, experience, and education</p>

        {!result ? (
          <div>
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onClick={() => document.getElementById('fileInput').click()}
              className="glass-card"
              style={{
                border: `2px dashed ${drag ? 'var(--primary)' : 'var(--border-color)'}`,
                padding: '60px 40px',
                textAlign: 'center',
                cursor: 'pointer',
                background: drag ? 'rgba(255,255,255,0.08)' : 'var(--card-bg)',
                marginBottom: 24
              }}>
              <input id="fileInput" type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
              <Upload size={48} color="var(--primary)" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'white' }}>Drop your PDF here</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>or click to browse • Max 5MB</p>
            </div>

            {file && (
              <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FileText size={20} color="var(--primary)" />
                  <span style={{ fontWeight: 600, color: 'white' }}>{file.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>({(file.size / 1024).toFixed(0)} KB)</span>
                </div>
                <button onClick={() => setFile(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
            )}

            <button onClick={handleUpload} disabled={!file || loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', opacity: file && !loading ? 1 : 0.6, cursor: file && !loading ? 'pointer' : 'not-allowed' }}>
              {loading ? <><Brain size={20} />Analysing Resume...</> : <><Upload size={20} />Analyse Resume</>}
            </button>
          </div>
        ) : (
          <div>
            <div className="glass-card" style={{ padding: 24, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16, borderColor: '#10b981' }}>
              <CheckCircle size={32} color="#10b981" />
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4, color: 'white' }}>Resume Analysed Successfully!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{result.filename}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}>
              <Section title="🛠 Skills Detected" items={result.skills} color="var(--primary)" />
              <Section title="🎓 Education" items={result.education} color="var(--secondary)" />
              <Section title="💼 Experience" items={result.experience} color="#34d399" />
              <Section title="🚀 Projects" items={result.projects} color="#f59e0b" />
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/assessment')} className="btn-primary">
                Start AI Assessment →
              </button>
              <button onClick={() => { setResult(null); setFile(null) }} className="btn-secondary">
                Upload Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, items, color }) {
  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color }}>{title}</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {(items || []).map((item, i) => (
          <span key={i} style={{ background: `${color}20`, border: `1px solid ${color}40`, color, padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{item}</span>
        ))}
      </div>
    </div>
  )
}
