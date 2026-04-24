import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Navbar from '../components/Navbar'

function Login({ onLogin, onVerifyOtp, onAuthSuccess }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleLoginSubmit(event) {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await onLogin(form)
      setStep(2)
      setError('') // clear errors for next step
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleOtpSubmit(event) {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await onVerifyOtp({ email: form.email, otp })
      onAuthSuccess(response)
      navigate('/')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-100">
      <Navbar />

      <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Login</h1>
          <p className="mt-2 text-sm text-slate-600">Access your buyer or seller account.</p>

          {step === 1 ? (
            <form className="mt-6 space-y-4" onSubmit={handleLoginSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-rose-500"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-rose-500"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-rose-500 px-3 py-2.5 font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Please wait...' : 'Login'}
              </button>
            </form>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleOtpSubmit}>
              <p className="text-sm text-green-600 font-medium mb-4">OTP sent to your email! </p>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="otp">
                  Enter 6-digit OTP
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  maxLength={6}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-rose-500 text-center tracking-widest text-lg"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-rose-500 px-3 py-2.5 font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          )}

          <p className="mt-4 text-sm text-slate-600">
            New user?{' '}
            <Link className="font-semibold text-rose-600 hover:text-rose-700" to="/signup">
              Create an account
            </Link>
          </p>
        </section>
      </main>
    </div>
  )
}

export default Login