import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Mic, MicOff, Volume2, VolumeX, X, Bot, Sparkles, Send, Zap, Radio, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [handsFree, setHandsFree] = useState(false) // Continuous autonomous voice mode
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [transcript, setTranscript] = useState('')
  const [lastExecutedAction, setLastExecutedAction] = useState('')
  const [inputVal, setInputVal] = useState('')
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "🤖 Autonomous AI Voice Agent active! Speak any command like 'Go to dashboard', 'Search Python jobs', 'Start assessment', or 'Change theme to Emerald' — no typing or clicking needed!"
    }
  ])

  const { logout } = useAuth()
  const { setCurrentTheme, themes } = useTheme()
  const navigate = useNavigate()

  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)
  const handsFreeRef = useRef(handsFree)

  useEffect(() => {
    handsFreeRef.current = handsFree
  }, [handsFree])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = true
      rec.lang = 'en-US'

      rec.onstart = () => {
        setIsListening(true)
        setTranscript('')
      }

      rec.onresult = (event) => {
        let currentText = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript
        }
        setTranscript(currentText)
      }

      rec.onend = () => {
        setIsListening(false)
        // If hands-free continuous mode is enabled, auto-restart listening!
        if (handsFreeRef.current) {
          setTimeout(() => {
            try { rec.start() } catch (e) {}
          }, 400)
        }
      }

      rec.onerror = (err) => {
        setIsListening(false)
        if (err.error !== 'no-speech' && err.error !== 'aborted') {
          console.warn('Speech error:', err.error)
        }
      }

      recognitionRef.current = rec
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isListening])

  // Handle Voice Command when speech ends and we have a transcript
  useEffect(() => {
    if (!isListening && transcript.trim()) {
      executeAutonomousVoiceCommand(transcript.trim())
      setTranscript('')
    }
  }, [isListening, transcript])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in your browser.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      setHandsFree(false)
    } else {
      try {
        window.speechSynthesis?.cancel()
        setIsSpeaking(false)
        recognitionRef.current.start()
        setIsOpen(true)
      } catch (err) {
        console.error(err)
      }
    }
  }

  const toggleHandsFree = () => {
    const nextVal = !handsFree
    setHandsFree(nextVal)
    if (nextVal) {
      toast.success('🟢 Hands-Free Autonomous Voice Mode ENABLED')
      speakText("Hands free autonomous voice mode enabled. Speak any command anytime.")
      if (!isListening) {
        try { recognitionRef.current?.start() } catch (e) {}
      }
    } else {
      toast('Hands-Free Mode Disabled')
      speakText("Hands free mode disabled.")
    }
  }

  const speakText = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()

    const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = 1.05
    utterance.pitch = 1.0

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  // Autonomous AI Action Classifier & Dispatcher
  const executeAutonomousVoiceCommand = (queryText) => {
    const userMsg = { sender: 'user', text: queryText }
    setMessages((prev) => [...prev, userMsg])

    const lower = queryText.toLowerCase()
    let reply = ''
    let actionLabel = ''
    let actionCallback = null

    // 1. Theme Commands
    if (lower.includes('theme') || lower.includes('color') || lower.includes('mood')) {
      if (lower.includes('emerald') || lower.includes('green')) {
        setCurrentTheme('emerald')
        reply = "Autonomous Action: Changed color theme to Cyber Emerald."
        actionLabel = "Theme -> Cyber Emerald"
      } else if (lower.includes('sunset') || lower.includes('orange') || lower.includes('red')) {
        setCurrentTheme('sunset')
        reply = "Autonomous Action: Changed color theme to Sunset Flare."
        actionLabel = "Theme -> Sunset Flare"
      } else if (lower.includes('cyan') || lower.includes('blue') || lower.includes('aqua')) {
        setCurrentTheme('cyan')
        reply = "Autonomous Action: Changed color theme to Electric Cyan."
        actionLabel = "Theme -> Electric Cyan"
      } else if (lower.includes('vapor') || lower.includes('magenta') || lower.includes('pink')) {
        setCurrentTheme('magenta')
        reply = "Autonomous Action: Changed color theme to Vaporwave Magenta."
        actionLabel = "Theme -> Vaporwave Magenta"
      } else if (lower.includes('slate') || lower.includes('nordic')) {
        setCurrentTheme('nordic')
        reply = "Autonomous Action: Changed color theme to Nordic Slate."
        actionLabel = "Theme -> Nordic Slate"
      } else {
        setCurrentTheme('cosmic')
        reply = "Autonomous Action: Changed color theme to Cosmic Neon."
        actionLabel = "Theme -> Cosmic Neon"
      }
    }

    // 2. Navigation & Platform Actions
    else if (lower.includes('dashboard') || lower.includes('home page')) {
      reply = "Autonomous AI: Navigating to your dashboard."
      actionLabel = "Opening Dashboard"
      actionCallback = () => navigate('/dashboard')
    } else if (lower.includes('resume') || lower.includes('upload') || lower.includes('cv')) {
      reply = "Autonomous AI: Opening resume upload screen."
      actionLabel = "Opening Resume Upload"
      actionCallback = () => navigate('/upload')
    } else if (lower.includes('assessment') || lower.includes('test') || lower.includes('quiz') || lower.includes('start test')) {
      reply = "Autonomous AI: Launching your AI skill assessment."
      actionLabel = "Opening AI Assessment"
      actionCallback = () => navigate('/assessment')
    } else if (lower.includes('result') || lower.includes('score')) {
      reply = "Autonomous AI: Opening assessment results."
      actionLabel = "Opening Assessment Results"
      actionCallback = () => navigate('/assessment-result')
    } else if (lower.includes('job') || lower.includes('search') || lower.includes('vacancy')) {
      if (lower.includes('python')) {
        reply = "Autonomous AI: Searching Python Developer jobs."
        actionLabel = "Searching Python Jobs"
        actionCallback = () => navigate('/jobs?q=python')
      } else if (lower.includes('react') || lower.includes('frontend')) {
        reply = "Autonomous AI: Searching Frontend React jobs."
        actionLabel = "Searching React Jobs"
        actionCallback = () => navigate('/jobs?q=react')
      } else if (lower.includes('backend')) {
        reply = "Autonomous AI: Searching Backend Developer jobs."
        actionLabel = "Searching Backend Jobs"
        actionCallback = () => navigate('/jobs?q=backend')
      } else {
        reply = "Autonomous AI: Navigating to job recommendations."
        actionLabel = "Opening Jobs"
        actionCallback = () => navigate('/jobs')
      }
    } else if (lower.includes('gap') || lower.includes('missing skill')) {
      reply = "Autonomous AI: Opening skill gap analysis."
      actionLabel = "Opening Skill Gap"
      actionCallback = () => navigate('/skill-gap')
    } else if (lower.includes('roadmap') || lower.includes('career plan')) {
      reply = "Autonomous AI: Opening career roadmap."
      actionLabel = "Opening Career Roadmap"
      actionCallback = () => navigate('/roadmap')
    } else if (lower.includes('learn') || lower.includes('course') || lower.includes('video')) {
      reply = "Autonomous AI: Opening learning resources."
      actionLabel = "Opening Learning Resources"
      actionCallback = () => navigate('/learning')
    } else if (lower.includes('interview') || lower.includes('practice')) {
      reply = "Autonomous AI: Opening interview preparation."
      actionLabel = "Opening Interview Prep"
      actionCallback = () => navigate('/interview')
    } else if (lower.includes('logout') || lower.includes('sign out')) {
      reply = "Autonomous AI: Logging out of your account."
      actionLabel = "Logging Out"
      actionCallback = () => { logout(); navigate('/') }
    } else {
      reply = `Autonomous AI: Recognized command "${queryText}". Executing career analysis now!`
      actionLabel = `AI Processed: ${queryText}`
    }

    // Execute response and callback
    setLastExecutedAction(actionLabel || queryText)
    toast.success(`⚡ AI Action: ${actionLabel || queryText}`)

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: 'assistant', text: reply }])
      speakText(reply)
      if (actionCallback) actionCallback()
    }, 300)
  }

  const handleSubmitText = (e) => {
    e.preventDefault()
    if (!inputVal.trim()) return
    executeAutonomousVoiceCommand(inputVal.trim())
    setInputVal('')
  }

  return (
    <>
      {/* Top Autonomous AI Action HUD Toast Banner */}
      {lastExecutedAction && (
        <div style={{
          position: 'fixed',
          top: 76,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 997,
          background: 'rgba(11, 15, 25, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--primary)',
          borderRadius: 50,
          padding: '8px 20px',
          color: 'white',
          fontSize: 13,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 8px 30px var(--glow)',
          animation: 'fadeInDown 0.3s ease-out'
        }}>
          <Zap size={16} color="var(--primary)" className="spin" />
          <span>Autonomous AI Executed:</span>
          <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{lastExecutedAction}</span>
          <button
            onClick={() => setLastExecutedAction('')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 6 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Floating Autonomous AI Voice Launcher */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 998,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <button
          onClick={() => {
            setIsOpen(!isOpen)
            if (!isOpen) toggleListening()
          }}
          title="Autonomous AI Voice Control"
          style={{
            background: isListening ? 'linear-gradient(135deg, #ef4444, #f43f5e)' : 'var(--primary-gradient)',
            color: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 50,
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: isListening ? '0 0 30px #ef4444' : '0 8px 25px var(--glow)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 13,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mic size={18} />
            {isListening && (
              <span style={{
                position: 'absolute',
                inset: -6,
                border: '2px solid white',
                borderRadius: '50%',
                animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
              }} />
            )}
          </div>
          <span>{isListening ? 'AI Listening...' : 'Autonomous Voice AI'}</span>
        </button>

        {/* Hands-Free Autonomous Mode Toggle Badge */}
        <button
          onClick={toggleHandsFree}
          title="Toggle Hands-Free Continuous Mode"
          style={{
            background: handsFree ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${handsFree ? '#10b981' : 'var(--border-color)'}`,
            color: handsFree ? '#10b981' : 'var(--text-muted)',
            borderRadius: 20,
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Radio size={14} color={handsFree ? '#10b981' : 'var(--text-muted)'} className={handsFree ? 'spin' : ''} />
          <span>{handsFree ? 'Hands-Free ON' : 'Hands-Free OFF'}</span>
        </button>
      </div>

      {/* Voice Assistant Modal */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: 84,
          left: 24,
          zIndex: 999,
          width: 'calc(100vw - 48px)',
          maxWidth: 420,
          background: '#0b0f19',
          border: '1px solid var(--border-color)',
          borderRadius: 24,
          padding: 20,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px var(--glow)',
          display: 'flex',
          flexDirection: 'column',
          height: 500,
          animation: 'slideUp 0.3s ease-out'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                background: 'var(--primary-gradient)',
                padding: 8,
                borderRadius: 12,
                color: 'white',
                display: 'flex'
              }}>
                <Bot size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Autonomous Voice AI <Zap size={14} color="var(--primary)" />
                </h4>
                <span style={{ fontSize: 11, color: isListening ? '#ef4444' : handsFree ? '#10b981' : 'var(--text-muted)', fontWeight: 700 }}>
                  ● {isListening ? 'Listening for speech...' : handsFree ? 'Continuous Hands-Free Active' : 'Ready'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                title={voiceEnabled ? 'Mute Voice' : 'Enable Voice'}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: 'none',
                  color: voiceEnabled ? 'var(--primary)' : 'var(--text-muted)',
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: 'none',
                  color: 'var(--text-muted)',
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Hands-Free Indicator Banner */}
          {handsFree && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 12,
              padding: '8px 12px',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={14} /> Fully Hands-Free Mode Active
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>No clicking required</span>
            </div>
          )}

          {/* Listening Transcript */}
          {isListening && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 12,
              padding: 10,
              marginBottom: 10,
              textAlign: 'center'
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#fca5a5', margin: 0 }}>
                🎙️ AI Listening to your voice...
              </p>
              {transcript && (
                <p style={{ fontSize: 13, color: 'white', marginTop: 4, fontWeight: 600, fontStyle: 'italic' }}>
                  "{transcript}"
                </p>
              )}
            </div>
          )}

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            paddingRight: 4,
            marginBottom: 10
          }}>
            {messages.map((m, idx) => (
              <div key={idx} style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: m.sender === 'user' ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${m.sender === 'user' ? 'transparent' : 'var(--border-color)'}`,
                color: 'white',
                padding: '10px 14px',
                borderRadius: m.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                fontSize: 13,
                lineHeight: 1.5,
                boxShadow: m.sender === 'user' ? '0 4px 12px var(--glow)' : 'none'
              }}>
                {m.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Voice Command Chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {['Go to dashboard', 'Upload resume', 'Start assessment', 'Search Python jobs', 'Theme Emerald'].map((cmd) => (
              <button
                key={cmd}
                onClick={() => executeAutonomousVoiceCommand(cmd)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  fontSize: 11,
                  padding: '4px 10px',
                  borderRadius: 12,
                  cursor: 'pointer'
                }}
              >
                {cmd}
              </button>
            ))}
          </div>

          {/* Input & Mic Bar */}
          <form onSubmit={handleSubmitText} style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={toggleListening}
              style={{
                background: isListening ? '#ef4444' : 'rgba(255,255,255,0.08)',
                border: '1px solid var(--border-color)',
                color: 'white',
                width: 42,
                height: 42,
                borderRadius: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Or type voice command..."
              style={{ flex: 1, padding: '10px 14px', fontSize: 13 }}
            />

            <button
              type="submit"
              className="btn-primary"
              style={{ padding: 10, borderRadius: 12, width: 42, height: 42, justifyContent: 'center' }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
