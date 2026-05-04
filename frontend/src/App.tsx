import { Routes, Route, Navigate } from 'react-router-dom'
import { type ReactNode } from 'react'
import { AuthProvider, useAuthContext } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import PublicProfile from './pages/PublicProfile'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthContext()
  if (loading) return null
  if (!user) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/u/:username" element={<PublicProfile />} />
      <Route path="*" element={null} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
