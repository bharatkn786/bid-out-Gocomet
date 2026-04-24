import { useEffect, useState } from 'react'
import { fetchMe, login, signup, verifyOtp } from '../services/authApi'

export function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('auth_token') || '')
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    if (!token) {
      setCurrentUser(null)
      return
    }

    fetchMe(token)
      .then(setCurrentUser)
      .catch(() => {
        localStorage.removeItem('auth_token')
        setToken('')
        setCurrentUser(null)
      })
  }, [token])

  function handleAuthSuccess(response) {
    localStorage.setItem('auth_token', response.access_token)
    setToken(response.access_token)
    setCurrentUser(response.user)
  }

  function handleLogout() {
    localStorage.removeItem('auth_token')
    setToken('')
    setCurrentUser(null)
  }

  return { currentUser, login, signup, verifyOtp, handleAuthSuccess, handleLogout }
}
