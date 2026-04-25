import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Toast from '../components/Toast'
import { placeBid } from '../services/bidApi'

function RFQAuction({ currentUser }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    carrier_name: '',
    freight_charges: '',
    origin_charges: '',
    destination_charges: '',
    transit_time: '',
    quote_validity: '',
  })

  useEffect(() => {
    if (currentUser?.role === 'buyer') {
      setToast({
        message: 'buyer himself cannot place bid for placing bid make a slller accounnt and place your bids',
        type: 'error'
      })
    }
  }, [currentUser])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    // Check role before even sending to backend (UX improvement)
    if (currentUser.role === 'buyer') {
      setToast({
        message: 'buyer himself cannot place bid for placing bid make a slller accounnt and place your bids',
        type: 'error'
      })
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      const payload = {
        rfq_id: parseInt(id),
        carrier_name: form.carrier_name,
        freight_charges: parseFloat(form.freight_charges),
        origin_charges: parseFloat(form.origin_charges),
        destination_charges: parseFloat(form.destination_charges),
        transit_time: parseInt(form.transit_time),
        quote_validity: parseInt(form.quote_validity),
      }
      
      await placeBid(payload, token)
      setToast({ message: 'Bid placed successfully!', type: 'success' })
      // Reset form or navigate
      setForm({
        carrier_name: '',
        freight_charges: '',
        origin_charges: '',
        destination_charges: '',
        transit_time: '',
        quote_validity: '',
      })
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar currentUser={currentUser} />
      
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Place Your Bid</h1>
            <p className="mt-1 text-sm text-slate-500">RFQ ID: {id} • Submit your most competitive rates.</p>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            ← Back to Auctions
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Bidding Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Carrier Name</label>
                  <input
                    name="carrier_name"
                    type="text"
                    required
                    disabled={currentUser?.role === 'buyer'}
                    placeholder="e.g. Blue Dart Logistics"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
                    value={form.carrier_name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Freight Charges ($)</label>
                  <input
                    name="freight_charges"
                    type="number"
                    step="0.01"
                    required
                    disabled={currentUser?.role === 'buyer'}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
                    value={form.freight_charges}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Origin Charges ($)</label>
                  <input
                    name="origin_charges"
                    type="number"
                    step="0.01"
                    required
                    disabled={currentUser?.role === 'buyer'}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
                    value={form.origin_charges}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Destination Charges ($)</label>
                  <input
                    name="destination_charges"
                    type="number"
                    step="0.01"
                    required
                    disabled={currentUser?.role === 'buyer'}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
                    value={form.destination_charges}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Transit Time (Days)</label>
                  <input
                    name="transit_time"
                    type="number"
                    required
                    disabled={currentUser?.role === 'buyer'}
                    placeholder="e.g. 5"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
                    value={form.transit_time}
                    onChange={handleChange}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Quote Validity (Days)</label>
                  <input
                    name="quote_validity"
                    type="number"
                    required
                    disabled={currentUser?.role === 'buyer'}
                    placeholder="e.g. 30"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
                    value={form.quote_validity}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || currentUser?.role === 'buyer'}
                  className="w-full rounded-xl bg-rose-500 py-4 text-center font-bold text-white shadow-lg shadow-rose-500/30 transition-all hover:bg-rose-600 hover:shadow-rose-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentUser?.role === 'buyer' ? 'Bidding Restricted for Buyers' : (isLoading ? 'Submitting...' : 'Submit Bid')}
                </button>
              </div>
            </form>
          </div>

          {/* Guidelines / Info */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Bidding Rules</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  Bids are binding and cannot be retracted.
                </li>
                <li className="flex gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  Lowest total charges will rank highest (L1).
                </li>
                <li className="flex gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  Extensions may apply if bids are received near closing.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default RFQAuction
