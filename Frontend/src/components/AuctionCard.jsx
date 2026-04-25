import { Link, useNavigate } from 'react-router-dom'

function AuctionCard({ rfq, isLive, isClosed, currentUser, setToast, hasBidded }) {
  const navigate = useNavigate()
  const startDate = new Date(rfq.bid_start_at)
  const closeDate = new Date(rfq.bid_close_at)


  function handleClick(e) {
    // Not logged in → go to login
    if (!currentUser) {
      e.preventDefault()
      navigate('/login')
      return
    }
    // Buyer cannot place bids on live auctions
    if (isLive && currentUser.role === 'buyer') {
      e.preventDefault()
      setToast({ message: 'Buyers cannot place bids. Please create a seller account to place your bids.', type: 'error' })
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
          {isClosed && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 border border-slate-200">
              Closed
            </span>
          )}
        </div>
        {hasBidded && (
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-md bg-green-50 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-green-600 border border-green-200">
            <span>✅</span> You placed a bid
          </div>
        )}

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
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium text-xs">Forced Close</span>
            <span className="font-bold text-slate-600 text-xs">{new Date(rfq.forced_close_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          
          {rfq.current_lowest_bid !== undefined && rfq.current_lowest_bid !== null && (
            <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-slate-700 font-bold">Lowest Bid</span>
              <span className="font-black text-rose-600 text-base">₹{rfq.current_lowest_bid.toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>

        <Link
          to={`/rfq/${rfq.id}`}
          onClick={handleClick}
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
