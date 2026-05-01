import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { User } from '@/lib/types'

interface AuthState {
  user: User | null
  loading: boolean
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ user: null, loading: true })

  useEffect(() => {
    api
      .get<User>('/auth/me')
      .then((res) => setState({ user: res.data, loading: false }))
      .catch(() => setState({ user: null, loading: false }))
  }, [])

  return state
}
