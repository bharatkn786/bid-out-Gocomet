import { Link, useNavigate } from 'react-router-dom'

function AuctionCard({ rfq, isLive, currentUser, setToast }) {
  const navigate = useNavigate()
  const startDate = new Date(rfq.bid_start_at)
  const closeDate = new Date(rfq.bid_close_at)

  function handleBidClick(e) {
    if (isLive && currentUser?.role === 'buyer') {
      e.preventDefault()
      setToast({
        message: 'buyer himself cannot place bid for placing bid make a slller accounnt and place your bids',
        type: 'error'
      })
    }
  }

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
            {rfq.reference_id || `RFQ #${rfq.id}`}
          </span>
          {isLive && (
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 border border-rose-200">
              Accepting Bids
            </span>
          )}
        </div>
        <h3 className="mb-2 text-lg font-bold text-slate-900 line-clamp-2">{rfq.name}</h3>
        {rfq.description && (
          <p className="mb-6 text-sm text-slate-600 line-clamp-2">{rfq.description}</p>
        )}
      </div>

      <div className="mt-auto">
        <div className="mb-5 flex flex-col gap-1.5 text-sm bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Start</span>
            <span className="font-bold text-slate-700">{startDate.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Close</span>
            <span className="font-bold text-slate-700">{closeDate.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        <Link
          to={`/rfq/${rfq.id}`}
          onClick={handleBidClick}
          className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition-all ${
            isLive
              ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {isLive ? 'Place Bid' : 'View Details'}
        </Link>
      </div>
    </div>
  )
}

export default AuctionCard
