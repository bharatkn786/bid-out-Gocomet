import { useMemo, useState } from 'react'

const initialForm = {
  email: '',
  password: '',
  full_name: '',
  role: 'seller',
}

function AuthModal({ mode, onClose, onSubmit, isLoading, error }) {
  const [form, setForm] = useState(initialForm)
  const isSignup = mode === 'signup'

  const title = useMemo(() => (isSignup ? 'Create account' : 'Welcome back'), [isSignup])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <button className="text-sm font-semibold text-slate-500 hover:text-slate-800" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isSignup ? (
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
          ) : null}

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

          {isSignup ? (
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
          ) : null}

          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-rose-500 px-3 py-2.5 font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Please wait...' : isSignup ? 'Sign up' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AuthModal
