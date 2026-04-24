import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {
  const { currentUser, login, signup, verifyOtp, handleAuthSuccess, handleLogout } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home currentUser={currentUser} onLogoutClick={handleLogout} />} />
        <Route
          path="/login"
          element={
            currentUser
              ? <Navigate to="/" replace />
              : <Login onLogin={login} onVerifyOtp={verifyOtp} onAuthSuccess={handleAuthSuccess} />
          }
        />
        <Route
          path="/signup"
          element={
            currentUser
              ? <Navigate to="/" replace />
              : <Signup onSignup={signup} />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App