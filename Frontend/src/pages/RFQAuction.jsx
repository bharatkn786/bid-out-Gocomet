import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Toast from '../components/Toast'
import { placeBid } from '../services/bidApi'

const emptyForm = {
  carrier_name: '',
  freight_charges: '',
  origin_charges: '',
  destination_charges: '',
  transit_time: '',
  quote_validity: '',
}

function RFQAuction({ currentUser }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const isBuyer = currentUser?.role === 'buyer'

  useEffect(() => {
    if (isBuyer) {
      setToast({ message: 'Buyers cannot place bids. Please create a seller account to place your bids.', type: 'error' })
    }
  }, [isBuyer])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (isBuyer) return

    setIsLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      await placeBid({
        rfq_id: parseInt(id),
        carrier_name: form.carrier_name,
        freight_charges: parseFloat(form.freight_charges),
        origin_charges: parseFloat(form.origin_charges),
        destination_charges: parseFloat(form.destination_charges),
        transit_time: parseInt(form.transit_time),
        quote_validity: parseInt(form.quote_validity),
      }, token)
      setToast({ message: 'Bid placed successfully!', type: 'success' })
      setForm(emptyForm)
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = `w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all ${isBuyer ? 'bg-slate-50 cursor-not-allowed' : ''}`

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar currentUser={currentUser} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Place Your Bid</h1>
            <p className="mt-1 text-sm text-slate-500">RFQ ID: {id} • Submit your most competitive rates.</p>
          </div>
          <button onClick={() => navigate(-1)} className="text-sm font-medium text-slate-500 hover:text-slate-700">
            ← Back to Auctions
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Carrier Name</label>
                  <input name="carrier_name" type="text" required disabled={isBuyer} placeholder="e.g. Blue Dart Logistics" className={inputClass} value={form.carrier_name} onChange={handleChange} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Freight Charges ($)</label>
                  <input name="freight_charges" type="number" step="0.01" required disabled={isBuyer} placeholder="0.00" className={inputClass} value={form.freight_charges} onChange={handleChange} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Origin Charges ($)</label>
                  <input name="origin_charges" type="number" step="0.01" required disabled={isBuyer} placeholder="0.00" className={inputClass} value={form.origin_charges} onChange={handleChange} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Destination Charges ($)</label>
                  <input name="destination_charges" type="number" step="0.01" required disabled={isBuyer} placeholder="0.00" className={inputClass} value={form.destination_charges} onChange={handleChange} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Transit Time (Days)</label>
                  <input name="transit_time" type="number" required disabled={isBuyer} placeholder="e.g. 5" className={inputClass} value={form.transit_time} onChange={handleChange} />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Quote Validity (Days)</label>
                  <input name="quote_validity" type="number" required disabled={isBuyer} placeholder="e.g. 30" className={inputClass} value={form.quote_validity} onChange={handleChange} />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || isBuyer}
                  className="w-full rounded-xl bg-rose-500 py-4 text-center font-bold text-white shadow-lg shadow-rose-500/30 transition-all hover:bg-rose-600 hover:shadow-rose-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBuyer ? 'Bidding Restricted for Buyers' : isLoading ? 'Submitting...' : 'Submit Bid'}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Bidding Rules</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-2"><span className="text-rose-500 font-bold">•</span>Bids are binding and cannot be retracted.</li>
                <li className="flex gap-2"><span className="text-rose-500 font-bold">•</span>Lowest total charges will rank highest (L1).</li>
                <li className="flex gap-2"><span className="text-rose-500 font-bold">•</span>Extensions may apply if bids are received near closing.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default RFQAuction
