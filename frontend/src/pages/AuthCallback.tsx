import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function AuthCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')
  const error = params.get('error')

  useEffect(() => {
    if (error) {
      navigate('/?auth_error=' + error, { replace: true })
      return
    }
    if (token) {
      localStorage.setItem('auth_token', token)
      navigate('/dashboard', { replace: true })
      return
    }
    navigate('/', { replace: true })
  }, [token, error, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground text-sm animate-pulse">Signing you in…</p>
    </div>
  )
}
