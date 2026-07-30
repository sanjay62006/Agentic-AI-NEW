import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Mic, MicOff, Volume2, VolumeX, X, Bot, Sparkles, Send, Zap, Radio, CheckCircle2, Command } from 'lucide-react'
import toast from 'react-hot-toast'

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [handsFree, setHandsFree] = useState(true) // Enabled by default for hands-free Alexa voice access
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [transcript, setTranscript] = useState('')
  const [lastExecutedAction, setLastExecutedAction] = useState('')
  const [inputVal, setInputVal] = useState('')
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "🎙️ Alexa Voice AI Active! Say 'Hey Alexa' or press Alt+V to control your app hands-free without using a mouse cursor."
    }
  ])

  const { logout } = useAuth()
  const { setCurrentTheme } = useTheme()
  const navigate = useNavigate()

  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)
  const handsFreeRef = useRef(handsFree)

  useEffect(() => {
    handsFreeRef.current = handsFree
  }, [handsFree])

  // Setup Global Keyboard Shortcut (Alt + V) to activate Alexa Voice without mouse cursor
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.altKey && (e.key === 'v' || e.key === 'V')) || (e.ctrlKey && e.shiftKey && (e.key === 'V' || e.key === 'v'))) {
        e.preventDefault()
        toggleListening()
        toast('🎙️ Alexa Voice Toggled via Alt+V Hotkey', { icon: '⚡' })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isListening])

  // Setup Web Speech Recognition
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
        // Auto-restart recognition if hands-free continuous mode is active
        if (handsFreeRef.current) {
          setTimeout(() => {
            try {
              rec.start()
            } catch (e) {
              // Ignore already started errors
            }
          }, 300)
        }
      }

      rec.onerror = (err) => {
        setIsListening(false)
        if (err.error !== 'no-speech' && err.error !== 'aborted') {
          console.warn('Speech recognition status:', err.error)
        }
      }

      recognitionRef.current = rec

      // Auto-start listening on mount if permitted
      try {
        rec.start()
      } catch (e) {
        // User gesture may be needed initially
      }
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isListening])

  // Process Speech Output when User finishes speaking
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
      try { recognitionRef.current.stop() } catch (e) {}
      setIsListening(false)
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
      toast.success('🟢 Alexa Continuous Hands-Free Mode ENABLED')
      speakText("Alexa hands-free mode enabled. Say Hey Alexa or any command anytime without using your cursor.")
      if (!isListening) {
        try { recognitionRef.current?.start() } catch (e) {}
      }
    } else {
      toast('Hands-Free Mode Disabled')
      speakText("Hands-free mode paused.")
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

  // Alexa Voice AI Classifier & Navigation Dispatcher
  const executeAutonomousVoiceCommand = (rawQuery) => {
    const queryText = rawQuery.trim()
    const lower = queryText.toLowerCase()

    // Strip wake-words ("alexa", "hey alexa", "alexa ai", "computer")
    const isAlexaWake = lower.includes('alexa') || lower.includes('hey alexa') || lower.includes('computer')
    const cleanedCommand = lower.replace(/^(hey\s+)?(alexa|computer|assistant)(\s+ai)?\s*/i, '').trim()

    // If only wake word was spoken, greet and open panel
    if (isAlexaWake && (!cleanedCommand || cleanedCommand === 'hey' || cleanedCommand === 'hi' || cleanedCommand === 'hello')) {
      setIsOpen(true)
      const greeting = "Hello! Alexa Voice AI active. What page or action would you like to access?"
      setMessages(prev => [...prev, { sender: 'user', text: queryText }, { sender: 'assistant', text: greeting }])
      speakText(greeting)
      setLastExecutedAction("Alexa Activated")
      return
    }

    const userMsg = { sender: 'user', text: queryText }
    setMessages((prev) => [...prev, userMsg])

    let reply = ''
    let actionLabel = ''
    let actionCallback = null

    // 1. Theme Commands
    if (cleanedCommand.includes('theme') || cleanedCommand.includes('color') || cleanedCommand.includes('mode')) {
      if (cleanedCommand.includes('emerald') || cleanedCommand.includes('green')) {
        setCurrentTheme('emerald')
        reply = "Alexa Voice: Switched color theme to Cyber Emerald."
        actionLabel = "Theme -> Cyber Emerald"
      } else if (cleanedCommand.includes('sunset') || cleanedCommand.includes('orange') || cleanedCommand.includes('red')) {
        setCurrentTheme('sunset')
        reply = "Alexa Voice: Switched color theme to Sunset Flare."
        actionLabel = "Theme -> Sunset Flare"
      } else if (cleanedCommand.includes('cyan') || cleanedCommand.includes('blue') || cleanedCommand.includes('aqua')) {
        setCurrentTheme('cyan')
        reply = "Alexa Voice: Switched color theme to Electric Cyan."
        actionLabel = "Theme -> Electric Cyan"
      } else if (cleanedCommand.includes('vapor') || cleanedCommand.includes('magenta') || cleanedCommand.includes('pink')) {
        setCurrentTheme('magenta')
        reply = "Alexa Voice: Switched color theme to Vaporwave Magenta."
        actionLabel = "Theme -> Vaporwave Magenta"
      } else if (cleanedCommand.includes('slate') || cleanedCommand.includes('nordic')) {
        setCurrentTheme('nordic')
        reply = "Alexa Voice: Switched color theme to Nordic Slate."
        actionLabel = "Theme -> Nordic Slate"
      } else {
        setCurrentTheme('cosmic')
        reply = "Alexa Voice: Switched color theme to Cosmic Neon."
        actionLabel = "Theme -> Cosmic Neon"
      }
    }

    // 2. Navigation Pages (Hands-Free Access without Cursor)
    else if (cleanedCommand.includes('dashboard') || cleanedCommand.includes('home page') || cleanedCommand.includes('main page')) {
      reply = "Alexa Voice: Opening your Dashboard."
      actionLabel = "Opened Dashboard"
      actionCallback = () => navigate('/dashboard')
    } else if (cleanedCommand.includes('resume') || cleanedCommand.includes('upload') || cleanedCommand.includes('cv')) {
      reply = "Alexa Voice: Opening Resume Upload page."
      actionLabel = "Opened Resume Upload"
      actionCallback = () => navigate('/upload')
    } else if (cleanedCommand.includes('assessment') || cleanedCommand.includes('test') || cleanedCommand.includes('quiz') || cleanedCommand.includes('exam')) {
      reply = "Alexa Voice: Launching AI Skill Assessment."
      actionLabel = "Opened Assessment"
      actionCallback = () => navigate('/assessment')
    } else if (cleanedCommand.includes('result') || cleanedCommand.includes('score')) {
      reply = "Alexa Voice: Opening Assessment Results."
      actionLabel = "Opened Assessment Results"
      actionCallback = () => navigate('/assessment-result')
    } else if (cleanedCommand.includes('job') || cleanedCommand.includes('vacancy') || cleanedCommand.includes('career opportunity')) {
      if (cleanedCommand.includes('python')) {
        reply = "Alexa Voice: Searching Python Developer jobs."
        actionLabel = "Searched Python Jobs"
        actionCallback = () => navigate('/jobs?q=python')
      } else if (cleanedCommand.includes('react') || cleanedCommand.includes('frontend')) {
        reply = "Alexa Voice: Searching Frontend React jobs."
        actionLabel = "Searched React Jobs"
        actionCallback = () => navigate('/jobs?q=react')
      } else if (cleanedCommand.includes('backend')) {
        reply = "Alexa Voice: Searching Backend Developer jobs."
        actionLabel = "Searched Backend Jobs"
        actionCallback = () => navigate('/jobs?q=backend')
      } else {
        reply = "Alexa Voice: Opening Job Recommendations page."
        actionLabel = "Opened Job Recommendations"
        actionCallback = () => navigate('/jobs')
      }
    } else if (cleanedCommand.includes('gap') || cleanedCommand.includes('missing skill') || cleanedCommand.includes('skill gap')) {
      reply = "Alexa Voice: Opening Skill Gap Analysis."
      actionLabel = "Opened Skill Gap"
      actionCallback = () => navigate('/skill-gap')
    } else if (cleanedCommand.includes('roadmap') || cleanedCommand.includes('career plan')) {
      reply = "Alexa Voice: Opening Career Roadmap."
      actionLabel = "Opened Career Roadmap"
      actionCallback = () => navigate('/roadmap')
    } else if (cleanedCommand.includes('learn') || cleanedCommand.includes('course') || cleanedCommand.includes('resource')) {
      reply = "Alexa Voice: Opening Learning Resources."
      actionLabel = "Opened Learning"
      actionCallback = () => navigate('/learning')
    } else if (cleanedCommand.includes('interview') || cleanedCommand.includes('prep') || cleanedCommand.includes('question')) {
      reply = "Alexa Voice: Opening Interview Preparation page."
      actionLabel = "Opened Interview Prep"
      actionCallback = () => navigate('/interview')
    } else if (cleanedCommand.includes('logout') || cleanedCommand.includes('sign out')) {
      reply = "Alexa Voice: Logging out of your account."
      actionLabel = "Logged Out"
      actionCallback = () => { logout(); navigate('/') }
    } else if (cleanedCommand.includes('close') || cleanedCommand.includes('hide') || cleanedCommand.includes('stop')) {
      reply = "Alexa Voice: Closing voice assistant."
      actionLabel = "Closed Voice AI"
      actionCallback = () => setIsOpen(false)
    } else {
      reply = `Alexa Voice: Executed "${queryText}". Navigating now.`
      actionLabel = `Alexa Executed: ${queryText}`
    }

    // Auto open modal on voice execution so user sees visual feedback hands-free
    setIsOpen(true)
    setLastExecutedAction(actionLabel || queryText)
    toast.success(`⚡ Alexa AI: ${actionLabel || queryText}`)

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: 'assistant', text: reply }])
      speakText(reply)
      if (actionCallback) actionCallback()
    }, 250)
  }

  const handleSubmitText = (e) => {
    e.preventDefault()
    if (!inputVal.trim()) return
    executeAutonomousVoiceCommand(inputVal.trim())
    setInputVal('')
  }

  return (
    <>
      {/* Top Hands-Free Alexa Voice Toast Banner */}
      {lastExecutedAction && (
        <div style={{
          position: 'fixed',
          top: 76,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 997,
          background: 'rgba(11, 15, 25, 0.88)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--primary)',
          borderRadius: 50,
          padding: '8px 22px',
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
          <span>Alexa Voice AI Executed:</span>
          <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{lastExecutedAction}</span>
          <button
            onClick={() => setLastExecutedAction('')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 6 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Floating Autonomous Alexa Voice Launcher */}
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
          title="Alexa Voice AI (Say 'Hey Alexa' or press Alt+V)"
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
          <span>{isListening ? 'Alexa Listening...' : 'Alexa Voice AI'}</span>
          <span style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '2px 6px',
            borderRadius: 6,
            fontSize: 10,
            letterSpacing: 0.5
          }}>Alt+V</span>
        </button>

        {/* Hands-Free Autonomous Mode Toggle Button */}
        <button
          onClick={toggleHandsFree}
          title="Toggle Cursor-less Hands-Free Continuous Mode"
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
                  Alexa Voice AI <Zap size={14} color="var(--primary)" />
                </h4>
                <span style={{ fontSize: 11, color: isListening ? '#ef4444' : handsFree ? '#10b981' : 'var(--text-muted)', fontWeight: 700 }}>
                  ● {isListening ? 'Listening for speech...' : handsFree ? 'Hands-Free Continuous Listening' : 'Ready'}
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
                <CheckCircle2 size={14} /> Cursorless Hands-Free Active
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Say "Hey Alexa" or press Alt+V</span>
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
                🎙️ Alexa is listening to your voice...
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

          {/* Hands-Free Voice Commands Sample Chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {['Alexa go to dashboard', 'Alexa upload resume', 'Alexa start assessment', 'Alexa search jobs', 'Alexa interview prep'].map((cmd) => (
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
              placeholder="Or type Alexa voice command..."
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
