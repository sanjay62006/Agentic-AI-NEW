import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ThemeSwitcher from './components/ThemeSwitcher'
import VoiceAssistant from './components/VoiceAssistant'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ResumeUpload from './pages/ResumeUpload'
import Assessment from './pages/Assessment'
import AssessmentResult from './pages/AssessmentResult'
import JobRecommendation from './pages/JobRecommendation'
import SkillGap from './pages/SkillGap'
import CareerRoadmap from './pages/CareerRoadmap'
import Learning from './pages/Learning'
import InterviewPrep from './pages/InterviewPrep'

function AppLayout() {
  const location = useLocation()
  const hideNav = ['/', '/login', '/register'].includes(location.pathname)
  return (
    <>
      {!hideNav && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
        <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
        <Route path="/assessment-result" element={<ProtectedRoute><AssessmentResult /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><JobRecommendation /></ProtectedRoute>} />
        <Route path="/skill-gap" element={<ProtectedRoute><SkillGap /></ProtectedRoute>} />
        <Route path="/roadmap" element={<ProtectedRoute><CareerRoadmap /></ProtectedRoute>} />
        <Route path="/learning" element={<ProtectedRoute><Learning /></ProtectedRoute>} />
        <Route path="/interview" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
      </Routes>
      <ThemeSwitcher />
      <VoiceAssistant />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-right" toastOptions={{ style: { background: '#0f172a', color: 'white', border: '1px solid var(--border-color)' } }} />
          <AppLayout />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
