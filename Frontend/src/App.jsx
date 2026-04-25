import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import CreateRFQ from './pages/CreateRFQ'
import RFQAuction from './pages/RFQAuction'

function App() {
  const { currentUser, isLoading, login, signup, verifyOtp, handleAuthSuccess, handleLogout } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Home currentUser={currentUser} onLogoutClick={handleLogout} />
          }
        />
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
        <Route
          path="/rfq/create"
          element={
            !currentUser ? (
              <Navigate to="/login" replace />
            ) : currentUser.role === 'buyer' ? (
              <CreateRFQ currentUser={currentUser} onLogoutClick={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/rfq/:id"
          element={
            currentUser
              ? <RFQAuction currentUser={currentUser} onLogoutClick={handleLogout} />
              : <Navigate to="/login" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App