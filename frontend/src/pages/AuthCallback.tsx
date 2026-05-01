import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function AuthCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const error = params.get('error')

  useEffect(() => {
    if (error) {
      navigate('/?auth_error=' + error, { replace: true })
    }
  }, [error, navigate])

  if (error) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground text-sm animate-pulse">Signing you in…</p>
    </div>
  )
}
