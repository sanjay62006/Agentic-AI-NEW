import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Mic, MicOff, Volume2, VolumeX, X, Bot, Sparkles, Send, Zap, Radio, CheckCircle2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [handsFree, setHandsFree] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [transcript, setTranscript] = useState('')
  const [lastExecutedAction, setLastExecutedAction] = useState('')
  const [inputVal, setInputVal] = useState('')
  const [permissionError, setPermissionError] = useState(false)

  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "🎙️ Alexa Voice AI Active! Say 'Hey Alexa' or press Alt+V to control your app hands-free without using a mouse cursor."
    }
  ])

  const { logout } = useAuth()
  const { setCurrentTheme } = useTheme()
  const navigate = useNavigate()

  // Strict useRef refs to prevent stale closure bugs in Web Speech API events
  const recognitionRef = useRef(null)
  const isListeningRef = useRef(false)
  const isSpeakingRef = useRef(false)
  const handsFreeRef = useRef(handsFree)
  const restartTimerRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Keep refs in sync with React state
  useEffect(() => { handsFreeRef.current = handsFree }, [handsFree])
  useEffect(() => { isListeningRef.current = isListening }, [isListening])
  useEffect(() => { isSpeakingRef.current = isSpeaking }, [isSpeaking])

  // Global Keyboard Shortcut (Alt + V)
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
  }, [])

  // Initialize Web Speech Recognition with robust lifecycle protection
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('Web Speech API is not supported in this browser.')
      return
    }

    const rec = new SpeechRecognition()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'

    rec.onstart = () => {
      setIsListening(true)
      isListeningRef.current = true
      setPermissionError(false)
    }

    rec.onresult = (event) => {
      // Ignore microphone input while TTS (Alexa voice output) is actively speaking (Echo Prevention)
      if (isSpeakingRef.current) return

      let interim = ''
      let finalSpeech = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalSpeech += text
        } else {
          interim += text
        }
      }

      setTranscript(interim || finalSpeech)

      if (finalSpeech.trim()) {
        executeAutonomousVoiceCommand(finalSpeech.trim())
        setTranscript('')
      }
    }

    rec.onend = () => {
      setIsListening(false)
      isListeningRef.current = false

      // Guarded auto-restart for continuous hands-free operation
      if (handsFreeRef.current && !isSpeakingRef.current) {
        clearTimeout(restartTimerRef.current)
        restartTimerRef.current = setTimeout(() => {
          if (handsFreeRef.current && !isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start()
            } catch (e) {
              // Ignore if already starting or active
            }
          }
        }, 400)
      }
    }

    rec.onerror = (err) => {
      setIsListening(false)
      isListeningRef.current = false
      if (err.error === 'not-allowed' || err.error === 'service-not-allowed') {
        setPermissionError(true)
      }
    }

    recognitionRef.current = rec

    // Try starting speech recognition cleanly
    try {
      rec.start()
    } catch (e) {
      // Browsers require initial user click gesture if mic permissions aren't pre-granted
    }

    return () => {
      clearTimeout(restartTimerRef.current)
      try { rec.stop() } catch (e) {}
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isListening])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported on this browser.')
      return
    }

    if (isListening) {
      try { recognitionRef.current.stop() } catch (e) {}
      setIsListening(false)
      isListeningRef.current = false
    } else {
      try {
        window.speechSynthesis?.cancel()
        setIsSpeaking(false)
        isSpeakingRef.current = false
        recognitionRef.current.start()
        setIsOpen(true)
        setPermissionError(false)
      } catch (err) {
        console.error(err)
      }
    }
  }

  const toggleHandsFree = () => {
    const nextVal = !handsFree
    setHandsFree(nextVal)
    handsFreeRef.current = nextVal
    if (nextVal) {
      toast.success('🟢 Alexa Continuous Hands-Free Mode ENABLED')
      speakText("Alexa hands-free mode active. Say Hey Alexa or any command anytime without using your cursor.")
      if (!isListeningRef.current) {
        try { recognitionRef.current?.start() } catch (e) {}
      }
    } else {
      toast('Hands-Free Mode Paused')
      speakText("Hands-free mode paused.")
    }
  }

  const speakText = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()

    // Temporarily pause listening while speaking to prevent self-echoing
    setIsSpeaking(true)
    isSpeakingRef.current = true

    const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = 1.05
    utterance.pitch = 1.0

    const finishSpeaking = () => {
      setIsSpeaking(false)
      isSpeakingRef.current = false
      // Resume speech recognition after speech synthesis finishes
      if (handsFreeRef.current && recognitionRef.current && !isListeningRef.current) {
        setTimeout(() => {
          try { recognitionRef.current.start() } catch (e) {}
        }, 300)
      }
    }

    utterance.onend = finishSpeaking
    utterance.onerror = finishSpeaking

    window.speechSynthesis.speak(utterance)
  }

  // Alexa Voice AI Classifier & Navigation Dispatcher
  const executeAutonomousVoiceCommand = (rawQuery) => {
    const queryText = rawQuery.trim()
    if (!queryText) return

    const lower = queryText.toLowerCase()

    // Strip wake-words ("alexa", "hey alexa", "alexa ai", "computer")
    const isAlexaWake = lower.includes('alexa') || lower.includes('hey alexa') || lower.includes('computer')
    const cleanedCommand = lower.replace(/^(hey\s+)?(alexa|computer|assistant)(\s+ai)?\s*/i, '').trim()

    // If only wake word was spoken
    if (isAlexaWake && (!cleanedCommand || ['hey', 'hi', 'hello', 'there'].includes(cleanedCommand))) {
      setIsOpen(true)
      const greeting = "Hello! Alexa Voice AI active. Which page or command would you like to open?"
      setMessages(prev => [...prev, { sender: 'user', text: queryText }, { sender: 'assistant', text: greeting }])
      speakText(greeting)
      setLastExecutedAction("Alexa Activated")
      return
    }

    setMessages((prev) => [...prev, { sender: 'user', text: queryText }])

    let reply = ''
    let actionLabel = ''
    let actionCallback = null

    // 1. Theme Color Commands
    if (cleanedCommand.includes('theme') || cleanedCommand.includes('color') || cleanedCommand.includes('mode')) {
      if (cleanedCommand.includes('emerald') || cleanedCommand.includes('green')) {
        setCurrentTheme('emerald')
        reply = "Switched color theme to Cyber Emerald."
        actionLabel = "Theme -> Cyber Emerald"
      } else if (cleanedCommand.includes('sunset') || cleanedCommand.includes('orange') || cleanedCommand.includes('red')) {
        setCurrentTheme('sunset')
        reply = "Switched color theme to Sunset Flare."
        actionLabel = "Theme -> Sunset Flare"
      } else if (cleanedCommand.includes('cyan') || cleanedCommand.includes('blue') || cleanedCommand.includes('aqua')) {
        setCurrentTheme('cyan')
        reply = "Switched color theme to Electric Cyan."
        actionLabel = "Theme -> Electric Cyan"
      } else if (cleanedCommand.includes('vapor') || cleanedCommand.includes('magenta') || cleanedCommand.includes('pink')) {
        setCurrentTheme('magenta')
        reply = "Switched color theme to Vaporwave Magenta."
        actionLabel = "Theme -> Vaporwave Magenta"
      } else if (cleanedCommand.includes('slate') || cleanedCommand.includes('nordic')) {
        setCurrentTheme('nordic')
        reply = "Switched color theme to Nordic Slate."
        actionLabel = "Theme -> Nordic Slate"
      } else {
        setCurrentTheme('cosmic')
        reply = "Switched color theme to Cosmic Neon."
        actionLabel = "Theme -> Cosmic Neon"
      }
    }

    // 2. Navigation Pages (Hands-Free Page Control)
    else if (cleanedCommand.includes('dashboard') || cleanedCommand.includes('home page') || cleanedCommand.includes('main page')) {
      reply = "Opening your Dashboard."
      actionLabel = "Opened Dashboard"
      actionCallback = () => navigate('/dashboard')
    } else if (cleanedCommand.includes('resume') || cleanedCommand.includes('upload') || cleanedCommand.includes('cv')) {
      reply = "Opening Resume Upload page."
      actionLabel = "Opened Resume Upload"
      actionCallback = () => navigate('/upload')
    } else if (cleanedCommand.includes('assessment') || cleanedCommand.includes('test') || cleanedCommand.includes('quiz') || cleanedCommand.includes('exam')) {
      reply = "Launching AI Skill Assessment."
      actionLabel = "Opened Assessment"
      actionCallback = () => navigate('/assessment')
    } else if (cleanedCommand.includes('result') || cleanedCommand.includes('score')) {
      reply = "Opening Assessment Results."
      actionLabel = "Opened Assessment Results"
      actionCallback = () => navigate('/assessment-result')
    } else if (cleanedCommand.includes('job') || cleanedCommand.includes('vacancy') || cleanedCommand.includes('career opportunity')) {
      if (cleanedCommand.includes('python')) {
        reply = "Searching Python Developer jobs."
        actionLabel = "Searched Python Jobs"
        actionCallback = () => navigate('/jobs?q=python')
      } else if (cleanedCommand.includes('react') || cleanedCommand.includes('frontend')) {
        reply = "Searching Frontend React jobs."
        actionLabel = "Searched React Jobs"
        actionCallback = () => navigate('/jobs?q=react')
      } else if (cleanedCommand.includes('backend')) {
        reply = "Searching Backend Developer jobs."
        actionLabel = "Searched Backend Jobs"
        actionCallback = () => navigate('/jobs?q=backend')
      } else {
        reply = "Opening Job Recommendations page."
        actionLabel = "Opened Job Recommendations"
        actionCallback = () => navigate('/jobs')
      }
    } else if (cleanedCommand.includes('gap') || cleanedCommand.includes('missing skill') || cleanedCommand.includes('skill gap')) {
      reply = "Opening Skill Gap Analysis."
      actionLabel = "Opened Skill Gap"
      actionCallback = () => navigate('/skill-gap')
    } else if (cleanedCommand.includes('roadmap') || cleanedCommand.includes('career plan')) {
      reply = "Opening Career Roadmap."
      actionLabel = "Opened Career Roadmap"
      actionCallback = () => navigate('/roadmap')
    } else if (cleanedCommand.includes('learn') || cleanedCommand.includes('course') || cleanedCommand.includes('resource')) {
      reply = "Opening Learning Resources."
      actionLabel = "Opened Learning"
      actionCallback = () => navigate('/learning')
    } else if (cleanedCommand.includes('interview') || cleanedCommand.includes('prep') || cleanedCommand.includes('question')) {
      reply = "Opening Interview Preparation page."
      actionLabel = "Opened Interview Prep"
      actionCallback = () => navigate('/interview')
    } else if (cleanedCommand.includes('logout') || cleanedCommand.includes('sign out')) {
      reply = "Logging out of your account."
      actionLabel = "Logged Out"
      actionCallback = () => { logout(); navigate('/') }
    } else if (cleanedCommand.includes('close') || cleanedCommand.includes('hide') || cleanedCommand.includes('stop')) {
      reply = "Closing voice assistant panel."
      actionLabel = "Closed Voice AI"
      actionCallback = () => setIsOpen(false)
    } else {
      reply = `Recognized voice command "${queryText}". Navigating...`
      actionLabel = `Alexa AI: ${queryText}`
    }

    setIsOpen(true)
    setLastExecutedAction(actionLabel || queryText)
    toast.success(`⚡ Alexa AI: ${actionLabel || queryText}`)

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: 'assistant', text: reply }])
      speakText(reply)
      if (actionCallback) actionCallback()
    }, 200)
  }

  const handleSubmitText = (e) => {
    e.preventDefault()
    if (!inputVal.trim()) return
    executeAutonomousVoiceCommand(inputVal.trim())
    setInputVal('')
  }

  return (
    <>
      {/* Top Hands-Free Action Executed HUD Toast Banner */}
      {lastExecutedAction && (
        <div style={{
          position: 'fixed',
          top: 76,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 997,
          background: 'rgba(11, 15, 25, 0.92)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--primary)',
          borderRadius: 50,
          padding: '8px 24px',
          color: 'white',
          fontSize: 13,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 8px 30px var(--glow)',
          animation: 'fadeInDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <Zap size={16} color="var(--primary)" className="spin" />
          <span>Alexa Voice Executed:</span>
          <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{lastExecutedAction}</span>
          <button
            onClick={() => setLastExecutedAction('')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 8 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Floating Alexa Voice Launcher Button */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 998,
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}>
        <button
          onClick={() => {
            if (permissionError) {
              toggleListening()
            } else {
              setIsOpen(!isOpen)
              if (!isOpen && !isListening) toggleListening()
            }
          }}
          title="Alexa Voice AI (Say 'Hey Alexa' or press Alt+V)"
          style={{
            background: isListening
              ? 'linear-gradient(135deg, #ef4444, #f43f5e)'
              : permissionError
              ? 'linear-gradient(135deg, #f59e0b, #d97706)'
              : 'var(--primary-gradient)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 50,
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: isListening ? '0 0 35px #ef4444' : '0 8px 30px var(--glow)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 13,
            backdropFilter: 'blur(12px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {permissionError ? <AlertCircle size={18} /> : <Mic size={18} />}
            {isListening && (
              <>
                <span style={{
                  position: 'absolute',
                  inset: -6,
                  border: '2px solid white',
                  borderRadius: '50%',
                  animation: 'ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite'
                }} />
                <span style={{
                  position: 'absolute',
                  inset: -12,
                  border: '1px solid rgba(255,255,255,0.5)',
                  borderRadius: '50%',
                  animation: 'ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite'
                }} />
              </>
            )}
          </div>
          <span>
            {permissionError
              ? 'Click to Enable Mic'
              : isListening
              ? 'Alexa Listening...'
              : 'Alexa Voice AI'}
          </span>
          <span style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '2px 8px',
            borderRadius: 8,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.5
          }}>Alt+V</span>
        </button>

        {/* Hands-Free Mode Status Pill */}
        <button
          onClick={toggleHandsFree}
          title="Toggle Continuous Hands-Free Listening"
          style={{
            background: handsFree ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.06)',
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

      {/* Voice Assistant Floating Dialog Modal */}
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
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85), 0 0 35px var(--glow)',
          display: 'flex',
          flexDirection: 'column',
          height: 510,
          animation: 'slideUp 0.3s ease-out'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                background: 'var(--primary-gradient)',
                padding: 9,
                borderRadius: 12,
                color: 'white',
                display: 'flex',
                boxShadow: '0 4px 15px var(--glow)'
              }}>
                <Bot size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Alexa Voice AI <Zap size={14} color="var(--primary)" />
                </h4>
                <span style={{ fontSize: 11, color: isListening ? '#ef4444' : handsFree ? '#10b981' : 'var(--text-muted)', fontWeight: 700 }}>
                  ● {isListening ? 'Listening live...' : handsFree ? 'Continuous Hands-Free Active' : 'Ready'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                title={voiceEnabled ? 'Mute Voice Output' : 'Enable Voice Output'}
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

          {/* Mic Permission Helper Banner */}
          {permissionError && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 12,
              padding: '10px 14px',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={15} /> Microphone Access Required
              </span>
              <button
                onClick={toggleListening}
                style={{
                  background: '#f59e0b',
                  color: '#000',
                  border: 'none',
                  borderRadius: 8,
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Allow Mic
              </button>
            </div>
          )}

          {/* Hands-Free Indicator Banner */}
          {handsFree && !permissionError && (
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

          {/* Live Audio Visualizer / Transcript */}
          {isListening && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 12,
              padding: '10px 14px',
              marginBottom: 10,
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{ width: 4, height: 16, background: '#ef4444', borderRadius: 2, animation: 'ping 0.8s infinite' }} />
                <div style={{ width: 4, height: 22, background: '#ef4444', borderRadius: 2, animation: 'ping 0.6s infinite 0.2s' }} />
                <div style={{ width: 4, height: 12, background: '#ef4444', borderRadius: 2, animation: 'ping 1s infinite 0.4s' }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: '#fca5a5', marginLeft: 4 }}>
                  Alexa Listening Live...
                </span>
              </div>
              {transcript && (
                <p style={{ fontSize: 13, color: 'white', margin: 0, fontWeight: 600, fontStyle: 'italic' }}>
                  "{transcript}"
                </p>
              )}
            </div>
          )}

          {/* Messages Feed */}
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

          {/* Sample Voice Chips */}
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
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {cmd}
              </button>
            ))}
          </div>

          {/* Input Form */}
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
