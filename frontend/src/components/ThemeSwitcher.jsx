import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { Palette, X, Check, Sparkles, Sliders } from 'lucide-react'

export default function ThemeSwitcher() {
  const {
    currentTheme,
    setCurrentTheme,
    customPrimary,
    setCustomPrimary,
    customSecondary,
    setCustomSecondary,
    themes
  } = useTheme()

  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('presets') // 'presets' | 'custom'

  return (
    <>
      {/* Floating Launcher Pill */}
      <button
        onClick={() => setIsOpen(true)}
        title="Customize Color Theme"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 999,
          background: 'var(--primary-gradient)',
          color: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: 50,
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 8px 25px var(--glow)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: 13,
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        className="pulse-glow"
      >
        <Palette size={18} />
        <span>Theme Engine</span>
      </button>

      {/* Theme Modal Overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(2, 6, 23, 0.75)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            padding: 20
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false)
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              background: '#0b0f19',
              border: '1px solid var(--border-color)',
              borderRadius: 24,
              padding: 28,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px var(--glow)',
              position: 'relative',
              animation: 'modalSlideIn 0.3s ease-out'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  background: 'var(--primary-gradient)',
                  padding: 10,
                  borderRadius: 12,
                  display: 'flex',
                  color: 'white'
                }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: 0 }}>
                    Color Mood Engine
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                    Select a curated palette or create custom chroma
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  color: 'var(--text-muted)',
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 12,
              padding: 4,
              marginBottom: 20,
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <button
                onClick={() => setActiveTab('presets')}
                style={{
                  flex: 1,
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: activeTab === 'presets' ? 'var(--primary-gradient)' : 'transparent',
                  color: activeTab === 'presets' ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Curated Palettes
              </button>

              <button
                onClick={() => {
                  setActiveTab('custom')
                  setCurrentTheme('custom')
                }}
                style={{
                  flex: 1,
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: activeTab === 'custom' ? 'var(--primary-gradient)' : 'transparent',
                  color: activeTab === 'custom' ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.2s'
                }}
              >
                <Sliders size={14} /> Custom Chroma
              </button>
            </div>

            {/* Presets Tab */}
            {activeTab === 'presets' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {themes.map((t) => {
                  const isActive = currentTheme === t.id
                  return (
                    <div
                      key={t.id}
                      onClick={() => setCurrentTheme(t.id)}
                      style={{
                        background: isActive ? `${t.primary}1a` : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${isActive ? t.primary : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: 14,
                        padding: 14,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{t.icon}</span> {t.name}
                        </span>
                        {isActive && (
                          <div style={{
                            background: t.primary,
                            borderRadius: '50%',
                            width: 18,
                            height: 18,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                          }}>
                            <Check size={12} />
                          </div>
                        )}
                      </div>

                      {/* Swatches */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: t.primary, border: '1px solid rgba(255,255,255,0.2)' }} />
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: t.secondary, border: '1px solid rgba(255,255,255,0.2)' }} />
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: t.accent, border: '1px solid rgba(255,255,255,0.2)' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Custom Chroma Generator Tab */}
            {activeTab === 'custom' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14,
                  padding: 16
                }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                    Primary Accent Color
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="color"
                      value={customPrimary}
                      onChange={(e) => setCustomPrimary(e.target.value)}
                      style={{
                        width: 48,
                        height: 48,
                        padding: 0,
                        border: 'none',
                        borderRadius: 10,
                        cursor: 'pointer',
                        background: 'none'
                      }}
                    />
                    <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'monospace', color: 'white' }}>
                      {customPrimary.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14,
                  padding: 16
                }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                    Secondary Glow Color
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="color"
                      value={customSecondary}
                      onChange={(e) => setCustomSecondary(e.target.value)}
                      style={{
                        width: 48,
                        height: 48,
                        padding: 0,
                        border: 'none',
                        borderRadius: 10,
                        cursor: 'pointer',
                        background: 'none'
                      }}
                    />
                    <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'monospace', color: 'white' }}>
                      {customSecondary.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Live Preview Bar */}
                <div style={{
                  padding: 14,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${customPrimary}, ${customSecondary})`,
                  color: 'white',
                  fontWeight: 700,
                  textAlign: 'center',
                  boxShadow: `0 4px 20px ${customPrimary}66`
                }}>
                  Live Custom Palette Active ✨
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
