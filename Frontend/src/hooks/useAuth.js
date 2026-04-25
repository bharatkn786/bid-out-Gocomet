import { useEffect, useState } from 'react'
import { fetchMe, login, signup, verifyOtp } from '../services/authApi'

export function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('auth_token') || '')
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setCurrentUser(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    fetchMe(token)
      .then(setCurrentUser)
      .catch(() => {
        localStorage.removeItem('auth_token')
        setToken('')
        setCurrentUser(null)
      })
      .finally(() => {
        setIsLoading(false)
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

  return { currentUser, isLoading, login, signup, verifyOtp, handleAuthSuccess, handleLogout }
}
