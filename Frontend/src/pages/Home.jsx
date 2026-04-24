import Navbar from '../components/Navbar'

function Home({ currentUser, onLogoutClick }) {
  return (
    <div className="relative min-h-screen">
      <video
        className="fixed inset-0 z-0 h-screen w-screen object-cover"
        src="/truck-logistics.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      <div className="fixed inset-0 z-0 bg-slate-950/45" />

      <div className="relative z-10">
        <Navbar currentUser={currentUser} onLogoutClick={onLogoutClick} />

        <main className="mx-auto flex h-[calc(100vh-80px)] w-full max-w-7xl items-end p-8 lg:p-16">
          <section className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.24em] text-white/80">Bid Out Logistics</p>
            <h1 className="mt-2 text-4xl font-extrabold text-white lg:text-6xl">Move Freight Faster</h1>
            
          </section>
        </main>
      </div>
    </div>
  )
}

export default Home