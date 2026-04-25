import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { createRFQ } from '../services/rfqApi'

const initialForm = {
  name: '',
  description: '',
  bid_start_at: '',
  bid_close_at: '',
  forced_close_at: '',
  pickup_date: '',
  trigger_window_minutes: '',
  extension_duration_minutes: '',
  trigger_type: 'bid_received',
}

function CreateRFQ({ currentUser, onLogoutClick }) {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (new Date(form.forced_close_at) <= new Date(form.bid_close_at)) {
      return setError('Forced close time must be later than bid close time')
    }
    if (new Date(form.bid_close_at) <= new Date(form.bid_start_at)) {
      return setError('Bid close time must be later than bid start time')
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      await createRFQ({
        name: form.name,
        description: form.description,
        bid_start_at: new Date(form.bid_start_at).toISOString(),
        bid_close_at: new Date(form.bid_close_at).toISOString(),
        forced_close_at: new Date(form.forced_close_at).toISOString(),
        pickup_date: new Date(form.pickup_date).toISOString(),
        auction_config: {
          trigger_window_minutes: Number(form.trigger_window_minutes),
          extension_duration_minutes: Number(form.extension_duration_minutes),
          trigger_type: form.trigger_type,
        },
      }, token)
      navigate('/')
    } catch (err) {
      try {
        const details = JSON.parse(err.message)
        if (Array.isArray(details)) {
          return setError(`Validation Error: ${details.map(d => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join(', ')}`)
        }
      } catch {}
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar currentUser={currentUser} onLogoutClick={onLogoutClick} />

      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Create Request for Quotation</h1>
          <p className="mt-1 text-sm text-slate-500">Fill in the details below to publish a new British Auction.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Basic Details */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">Basic Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Request for Quotation Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Mumbai to Delhi Freight Q2"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-rose-500"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  required
                  placeholder="Provide additional details about the load, vehicle requirements, etc."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-rose-500"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

            </div>
          </section>

          {/* Auction Schedule */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">Auction Schedule</h2>
            <div className="grid gap-4 sm:grid-cols-2">

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Bid Start Date & Time</label>
                <input
                  name="bid_start_at"
                  type="datetime-local"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-rose-500"
                  value={form.bid_start_at}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Bid Close Date & Time</label>
                <input
                  name="bid_close_at"
                  type="datetime-local"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-rose-500"
                  value={form.bid_close_at}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Forced Close Date & Time
                  <span className="ml-1 text-xs text-slate-400">(absolute deadline)</span>
                </label>
                <input
                  name="forced_close_at"
                  type="datetime-local"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-rose-500"
                  value={form.forced_close_at}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Pickup / Service Date</label>
                <input
                  name="pickup_date"
                  type="datetime-local"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-rose-500"
                  value={form.pickup_date}
                  onChange={handleChange}
                />
              </div>

            </div>
          </section>

          {/* British Auction Config */}
          <section className="rounded-2xl border border-rose-100 bg-rose-50 p-6 shadow-sm">
            <h2 className="mb-1 text-lg font-bold text-slate-800">British Auction Configuration</h2>
            <p className="mb-4 text-sm text-slate-500">Controls how and when the auction time gets extended.</p>
            <div className="grid gap-4 sm:grid-cols-2">

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Trigger Window (X minutes)
                </label>
                <input
                  name="trigger_window_minutes"
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 10"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-rose-500"
                  value={form.trigger_window_minutes}
                  onChange={handleChange}
                />
                <p className="mt-1 text-xs text-slate-400">Watch for activity this many minutes before close</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Extension Duration (Y minutes)
                </label>
                <input
                  name="extension_duration_minutes"
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 5"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-rose-500"
                  value={form.extension_duration_minutes}
                  onChange={handleChange}
                />
                <p className="mt-1 text-xs text-slate-400">Add this many minutes when trigger fires</p>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Extension Trigger</label>
                <select
                  name="trigger_type"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-rose-500"
                  value={form.trigger_type}
                  onChange={handleChange}
                >
                  <option value="bid_received">Any bid received in last X minutes</option>
                  <option value="any_rank_change">Any supplier rank change in last X minutes</option>
                  <option value="l1_rank_change">Lowest bidder (L1) rank change in last X minutes</option>
                </select>
              </div>

            </div>
          </section>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Creating...' : 'Create Request for Quotation'}
            </button>
          </div>

        </form>
      </main>
    </div>
  )
}

export default CreateRFQ
