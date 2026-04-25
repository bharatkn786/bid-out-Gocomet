import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import AuctionCard from '../components/AuctionCard'
import Toast from '../components/Toast'
import { listRFQs } from '../services/rfqApi'
import { getMyBiddedRFQs } from '../services/bidApi'

function Home({ currentUser, onLogoutClick }) {
  const [rfqs, setRfqs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [showOnlyMine, setShowOnlyMine] = useState(false)
  const [myBiddedIds, setMyBiddedIds] = useState([])


  useEffect(() => {
    listRFQs()
      .then(setRfqs)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  // Auto-refresh every minute to move upcoming to live
  useEffect(() => {
    const interval = setInterval(() => {
      setRfqs(prev => [...prev]) // Force re-render to recalculate live/upcoming
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch seller's bid RFQ IDs
  useEffect(() => {
    if (currentUser?.role === 'seller') {
      const token = localStorage.getItem('auth_token')
      if (token) getMyBiddedRFQs(token).then(setMyBiddedIds).catch(console.error)
    }
  }, [currentUser])

  const now = new Date()
  
  // Filter based on toggle
  const filteredRFQs = showOnlyMine
    ? rfqs.filter(r => currentUser?.role === 'buyer' ? r.created_by === currentUser.id : myBiddedIds.includes(r.id))
    : rfqs;

  const liveRFQs = filteredRFQs.filter(r => new Date(r.bid_start_at) <= now && new Date(r.bid_close_at) > now)
  const upcomingRFQs = filteredRFQs.filter(r => new Date(r.bid_start_at) > now)
  const closedRFQs = filteredRFQs.filter(r => new Date(r.bid_close_at) <= now)



  return (
    <div className="relative min-h-screen bg-slate-50 font-sans">
      <Navbar currentUser={currentUser} onLogoutClick={onLogoutClick} />
      
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Hero Section */}
      <div className="relative flex h-[70vh] min-h-[500px] w-full items-center justify-center overflow-hidden">
        <video
          className="absolute inset-0 z-0 h-full w-full object-cover"
          src="/truck-logistics.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 z-0 bg-slate-950/60" />
        
        <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8 lg:pl-90">
          <div className="max-w-2xl">
            <p className="text-sm font-bold tracking-[0.2em] text-rose-400 uppercase">Bid Out Logistics</p>
            <h1 className="mt-3 text-5xl font-extrabold text-white sm:text-6xl lg:text-7xl">Move Freight Faster</h1>
            <p className="mt-6 text-lg text-slate-300 max-w-lg leading-relaxed">
              Transparent, competitive auctions for logistics. Secure the best rates in real-time.
            </p>
          </div>
        </div>
      </div>

      {currentUser && (
        <div className="flex justify-center -mt-6 relative z-20">
          <button
            onClick={() => setShowOnlyMine(!showOnlyMine)}
            className={`rounded-full px-8 py-3 text-sm font-black tracking-wide transition-all shadow-md ${
              showOnlyMine
                ? 'bg-rose-500 text-white shadow-rose-500/40 ring-4 ring-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-rose-300 hover:text-rose-600'
            }`}
          >
            {showOnlyMine ? 'Showing My Auctions' : currentUser.role === 'buyer' ? 'Show My RFQs' : 'Show My Bids'}
          </button>
        </div>
      )}

      {/* Auctions Content */}
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {isLoading ? (
          <div className="text-slate-500 flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Live Auctions */}
            <section className="mb-20">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </span>
                    <h2 className="text-3xl font-extrabold text-slate-900">Live Auction</h2>
                  </div>
                  <p className="text-slate-600 text-sm sm:text-base">
                    Discover competitive loads in our dynamic online auction. Bid now for a chance to win freight that promises to elevate your business.
                  </p>
                </div>
                {liveRFQs.length > 0 && (
                  <button className="shrink-0 rounded-full bg-rose-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-rose-600 shadow-sm shadow-rose-500/30">
                    View all
                  </button>
                )}
              </div>
              
              {liveRFQs.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                  No live auctions right now. Check back later!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {liveRFQs.map(rfq => (
                    <AuctionCard 
                      key={rfq.id} 
                      rfq={rfq} 
                      isLive={true} 
                      currentUser={currentUser}
                      setToast={setToast}
                      hasBidded={myBiddedIds.includes(rfq.id)}
                    />
                  ))}

                </div>
              )}
            </section>

            {/* Upcoming Auctions */}
            <section className="mb-20">
              <div className="mb-10">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Upcoming Auctions</h2>
                <p className="text-slate-600 text-sm sm:text-base max-w-2xl">
                  Plan ahead and prepare your bids for these future opportunities.
                </p>
              </div>

              {upcomingRFQs.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                  No upcoming auctions scheduled.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingRFQs.map(rfq => (
                    <AuctionCard 
                      key={rfq.id} 
                      rfq={rfq} 
                      isLive={false} 
                      currentUser={currentUser}
                      setToast={setToast}
                      hasBidded={myBiddedIds.includes(rfq.id)}
                    />
                  ))}

                </div>
              )}
            </section>

            {/* Closed Auctions */}
            <section>
              <div className="mb-10">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Closed Auctions</h2>
                <p className="text-slate-600 text-sm sm:text-base max-w-2xl">
                  Review past auctions and winning bids.
                </p>
              </div>

              {closedRFQs.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                  No closed auctions yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
                  {closedRFQs.map(rfq => (
                    <AuctionCard 
                      key={rfq.id} 
                      rfq={rfq} 
                      isClosed={true}
                      isLive={false}
                      currentUser={currentUser}
                      setToast={setToast}
                      hasBidded={myBiddedIds.includes(rfq.id)}
                    />
                  ))}

                </div>
              )}
            </section>
          </>
        )}
      </main>

    </div>
  )
}

export default Home