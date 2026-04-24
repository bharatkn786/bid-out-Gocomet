import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Navbar from '../components/Navbar'

const initialForm = {
  full_name: '',
  email: '',
  password: '',
  role: 'seller',
}

function Signup({ onSignup, onAuthSuccess }) {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await onSignup(form)
      navigate('/login')
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
          <h1 className="text-3xl font-extrabold text-slate-900">Sign up</h1>
          <p className="mt-2 text-sm text-slate-600">Create your buyer or seller account.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="full_name">
                Full name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                minLength={2}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-rose-500"
                value={form.full_name}
                onChange={handleChange}
              />
            </div>

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

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="role">
                Account type
              </label>
              <select
                id="role"
                name="role"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-rose-500"
                value={form.role}
                onChange={handleChange}
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </div>

            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-rose-500 px-3 py-2.5 font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Please wait...' : 'Create account'}
            </button>
          </form>

          <p className="mt-4 text-sm text-slate-600">
            Already have an account?{' '}
            <Link className="font-semibold text-rose-600 hover:text-rose-700" to="/login">
              Login
            </Link>
          </p>
        </section>
      </main>
    </div>
  )
}

export default Signup