import { Link } from 'react-router-dom'
import {
  Brain, FileText, HelpCircle, Award,
  Briefcase, Target, TrendingUp, BookOpen,
  Sparkles, ArrowRight, CheckCircle2
} from 'lucide-react'

// All 8 AI Agents
const agents = [
  {
    number: '01',
    name: 'Resume Analyzer Agent',
    icon: <FileText size={26} />,
    color: '#38bdf8',
    desc: 'Extracts skills, education, work experience, and key projects automatically from uploaded PDF resumes using NLP.'
  },
  {
    number: '02',
    name: 'Resume Verification Agent',
    icon: <HelpCircle size={26} />,
    color: '#a78bfa',
    desc: 'Generates 12 custom technical, project, and behavioral questions derived directly from your resume history.'
  },
  {
    number: '03',
    name: 'Answer Evaluator Agent',
    icon: <Brain size={26} />,
    color: '#ec4899',
    desc: 'Evaluates candidate answers in real-time, scoring correctness, technical depth, and communication quality.'
  },
  {
    number: '04',
    name: 'Candidate Level Agent',
    icon: <Award size={26} />,
    color: '#f59e0b',
    desc: 'Classifies candidate expertise into Beginner, Intermediate, or Advanced levels with detailed score breakdowns.'
  },
  {
    number: '05',
    name: 'Job Matching Agent',
    icon: <Briefcase size={26} />,
    color: '#3b82f6',
    desc: 'Calculates match percentages and recommends tailored job openings matching your verified skill matrix.'
  },
  {
    number: '06',
    name: 'Skill Gap Analysis Agent',
    icon: <Target size={26} />,
    color: '#ef4444',
    desc: 'Compares your current verified skills against industry benchmarks for target roles to highlight missing skills.'
  },
  {
    number: '07',
    name: 'Career Roadmap Agent',
    icon: <TrendingUp size={26} />,
    color: '#8b5cf6',
    desc: 'Generates step-by-step career progression roadmaps with clear milestones and estimated completion times.'
  },
  {
    number: '08',
    name: 'Interview Prep & Learning Agent',
    icon: <BookOpen size={26} />,
    color: '#10b981',
    desc: 'Curates targeted learning resources (courses, videos, docs) and generates role-specific interview practice questions.'
  }
]

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', color: 'var(--text-primary)', transition: 'background 0.5s ease' }}>
      <div style={{ maxWidth: 1150, margin: '0 auto', padding: '80px 24px 80px' }}>
        
        {/* HERO SECTION */}
        <div style={{ textAlign: 'center', marginBottom: 90 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 50,
            padding: '8px 22px',
            marginBottom: 32,
            boxShadow: '0 4px 20px var(--glow)'
          }}>
            <Sparkles size={18} color="var(--primary)" />
            <span style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 700 }}>
              8 Autonomous AI Agents Working For You
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.2rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 24 }}>
            Your AI-Powered<br />
            <span className="text-gradient">Career Intelligence</span><br />
            Platform
          </h1>

          <p style={{ fontSize: 18, color: 'var(--text-muted)', maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Upload your resume, get AI-verified, discover your true skill level, get matched with top jobs, and master real-world interview preparation.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ padding: '14px 36px', fontSize: 16 }}>
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary" style={{ padding: '14px 36px', fontSize: 16 }}>
              Sign In
            </Link>
          </div>
        </div>

        {/* 8 AI AGENTS GRID SECTION */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: 'white' }}>
              Meet The <span className="text-gradient">8 AI Agents</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>
              An end-to-end intelligent agent ecosystem for your entire career lifecycle
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {agents.map((agent, i) => (
              <div key={i} className="glass-card" style={{ padding: 28, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{
                      background: `${agent.color}20`,
                      border: `1px solid ${agent.color}40`,
                      color: agent.color,
                      padding: 12,
                      borderRadius: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {agent.icon}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', opacity: 0.6, fontFamily: 'monospace' }}>
                      AGENT #{agent.number}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: 'white' }}>
                    {agent.name}
                  </h3>

                  <p style={{ color: 'var(--text-muted)', fontSize: 13.5, lineHeight: 1.6 }}>
                    {agent.desc}
                  </p>
                </div>

                <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={14} color={agent.color} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: agent.color }}>Active AI Agent</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
