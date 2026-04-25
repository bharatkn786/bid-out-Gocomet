import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Toast from '../components/Toast'
import { placeBid } from '../services/bidApi'
import { getRFQDetail } from '../services/rfqApi'
import { API_BASE_URL } from '../services/api'

const emptyForm = {
  carrier_name: '',
  freight_charges: '',
  origin_charges: '',
  destination_charges: '',
  transit_time: '',
  quote_validity: '',
}

function buildWsUrl(rfqId) {
  const wsBaseUrl = API_BASE_URL.replace('http', 'ws')
  return `${wsBaseUrl}/rfq/ws/${rfqId}`
}

function buildBidPayload(form, rfqId) {
  return {
    rfq_id: parseInt(rfqId),
    carrier_name: form.carrier_name,
    freight_charges: parseFloat(form.freight_charges),
    origin_charges: parseFloat(form.origin_charges),
    destination_charges: parseFloat(form.destination_charges),
    transit_time: parseInt(form.transit_time),
    quote_validity: parseInt(form.quote_validity),
  }
}

function isAuctionClosed(detail, timeLeft) {
  return timeLeft === 'CLOSED' || (detail && new Date(detail.rfq.bid_close_at) <= new Date())
}

function isClosingSoon(detail, isClosed) {
  return !isClosed && detail && (new Date(detail.rfq.bid_close_at) - new Date()) < 120000
}

// Countdown timer: counts down to bid_close_at
function useCountdown(bid_close_at) {
  const [timeLeft, setTimeLeft] = useState('')
  useEffect(() => {
    const tick = () => {
      const diff = new Date(bid_close_at) - new Date()
      if (diff <= 0) return setTimeLeft('CLOSED')
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [bid_close_at])
  return timeLeft
}

function RFQAuction({ currentUser, onLogoutClick }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState(null)
  const [toast, setToast] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const wsRef = useRef(null)

  const isBuyer = currentUser?.role === 'buyer'

  // Load auction detail
  async function fetchDetail() {
    try {
      const data = await getRFQDetail(id)
      setDetail(data)
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    }
  }

  // Initial load
  useEffect(() => {
    fetchDetail()
  }, [id])

  // WebSocket — reconnects when id changes
  useEffect(() => {
    // Construct ws://localhost:8000/api/rfq/ws/8
    const ws = new WebSocket(buildWsUrl(id))

    wsRef.current = ws
    ws.onmessage = () => fetchDetail()
    ws.onerror = () => console.warn('WebSocket error connection to:', ws.url)

    return () => {
      if (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [id])

  const timeLeft = useCountdown(detail?.rfq?.bid_close_at)
  // Check synchronously so it doesn't wait for the useEffect tick
  const isClosed = isAuctionClosed(detail, timeLeft)
  const isRed = isClosingSoon(detail, isClosed)

  // Show buyer restriction toast on load, only if auction is active
  useEffect(() => {
    if (detail && isBuyer && !isClosed) {
      setToast({ message: 'Buyers cannot place bids. Please create a seller account.', type: 'error' })
    }
  }, [detail, isBuyer, isClosed])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (isBuyer) return
    setIsLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      await placeBid(buildBidPayload(form, id), token)
      setToast({ message: 'Bid placed successfully!', type: 'success' })
      setForm(emptyForm)
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const inputCls = `w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all ${isBuyer || isClosed ? 'bg-slate-50 cursor-not-allowed' : ''}`

  if (!detail) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
    </div>
  )

  const { rfq, config, bids, logs } = detail
  const rankEmoji = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar currentUser={currentUser} onLogoutClick={onLogoutClick} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{rfq.reference_id || `RFQ #${rfq.id}`}</p>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-900">{rfq.name}</h1>
              {rfq.description && <p className="mt-1 text-sm text-slate-500">{rfq.description}</p>}
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Closes in</p>
              <p className={`text-4xl font-black tabular-nums ${isClosed ? 'text-slate-400' : isRed ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
                {timeLeft || '—'}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Forced close: {new Date(rfq.forced_close_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          {config && (
            <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Trigger window: {config.trigger_window_minutes} min
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Extension: +{config.extension_duration_minutes} min
              </span>
              <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 border border-rose-100">
                {config.trigger_type.replace(/_/g, ' ')}
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Rankings */}
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
                <span className="relative flex h-2.5 w-2.5">
                  {!isClosed && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isClosed ? 'bg-slate-300' : 'bg-rose-500'}`} />
                </span>
                <h2 className="font-bold text-slate-900">Supplier Rankings</h2>
                <span className="ml-auto text-xs text-slate-400">{bids.length} supplier{bids.length !== 1 ? 's' : ''}</span>
              </div>

              {bids.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-slate-400">No bids yet. Be the first!</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {bids.map((bid, i) => (
                    <div key={i} className={`flex items-center gap-4 px-6 py-4 ${i === 0 ? (isClosed ? 'bg-green-50/50' : 'bg-rose-50/50') : ''}`}>
                      <div className="flex flex-col items-center justify-center w-12 shrink-0">
                        <span className="text-2xl">{rankEmoji[i] || `#${bid.rank}`}</span>
                        {isClosed && i === 0 && <span className="mt-1 text-[9px] font-black tracking-widest text-green-600 uppercase">Winner</span>}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{bid.supplier_name}</p>
                        <p className="text-xs text-slate-500">{bid.carrier_name} · {bid.transit_time}d transit · {bid.quote_validity}d validity</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-extrabold ${i === 0 ? (isClosed ? 'text-green-600 text-lg' : 'text-rose-600 text-lg') : 'text-slate-700'}`}>
                          ₹{bid.total_charges.toLocaleString('en-IN')}
                        </p>

                        <p className="text-[11px] text-slate-400">
                          {bid.freight_charges.toLocaleString()} + {bid.origin_charges.toLocaleString()} + {bid.destination_charges.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Log */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-6 py-4">
                <h2 className="font-bold text-slate-900">Activity Log</h2>
              </div>
              {logs.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-slate-400">No activity yet.</div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {[...logs].reverse().map((log, i) => (
                    <div key={i} className="flex items-start gap-3 px-6 py-3">
                      <span className="mt-0.5 text-base">{log.event_type === 'time_extended' ? '⏱' : '●'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700">{log.message}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(log.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bid Form / Winner Announcement */}
          <div className="lg:col-span-2">
            {isClosed ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                  🏆
                </div>
                <h2 className="mb-1 text-2xl font-black text-green-800">Auction Closed</h2>
                {bids.length > 0 ? (
                  <>
                    <p className="mb-6 text-sm text-green-600">
                      The winning bid goes to:
                    </p>
                    <div className="w-full rounded-xl bg-white p-4 shadow-sm border border-green-100">
                      <p className="font-bold text-slate-900 text-lg">{bids[0].supplier_name}</p>
                      <p className="text-sm text-slate-500 mb-2">{bids[0].carrier_name}</p>
                      <p className="text-xl font-extrabold text-green-600">₹{bids[0].total_charges.toLocaleString('en-IN')}</p>
                    </div>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-green-600">No bids were placed during this auction.</p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-slate-900">Place Your Bid</h2>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Carrier Name</label>
                  <input name="carrier_name" type="text" required disabled={isBuyer || isClosed} placeholder="e.g. Blue Dart" className={inputCls} value={form.carrier_name} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">Freight ($)</label>
                    <input name="freight_charges" type="number" step="0.01" required disabled={isBuyer || isClosed} placeholder="0.00" className={inputCls} value={form.freight_charges} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">Origin ($)</label>
                    <input name="origin_charges" type="number" step="0.01" required disabled={isBuyer || isClosed} placeholder="0.00" className={inputCls} value={form.origin_charges} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">Destination ($)</label>
                    <input name="destination_charges" type="number" step="0.01" required disabled={isBuyer || isClosed} placeholder="0.00" className={inputCls} value={form.destination_charges} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">Transit (days)</label>
                    <input name="transit_time" type="number" required disabled={isBuyer || isClosed} placeholder="e.g. 5" className={inputCls} value={form.transit_time} onChange={handleChange} />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Quote Validity (days)</label>
                  <input name="quote_validity" type="number" required disabled={isBuyer || isClosed} placeholder="e.g. 30" className={inputCls} value={form.quote_validity} onChange={handleChange} />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isBuyer}
                  className="w-full rounded-xl bg-rose-500 py-3.5 font-bold text-white shadow-lg shadow-rose-500/30 transition hover:bg-rose-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBuyer ? 'Bidding Restricted for Buyers' : isLoading ? 'Submitting...' : 'Submit Bid'}
                </button>
              </form>
            )}
          </div>

        </div>

        <button onClick={() => navigate(-1)} className="mt-6 text-sm font-medium text-slate-400 hover:text-slate-600">
          ← Back to Auctions
        </button>
      </main>
    </div>
  )
}

export default RFQAuction
