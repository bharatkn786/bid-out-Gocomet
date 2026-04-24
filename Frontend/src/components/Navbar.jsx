import { Link } from 'react-router-dom'

function Nav({ currentUser, onLogoutClick }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl border border-rose-300 bg-rose-50">
            <svg
              aria-hidden="true"
              viewBox="0 0 40 40"
              className="h-7 w-7 text-rose-500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20 2L35.5885 11V29L20 38L4.41154 29V11L20 2Z" stroke="currentColor" strokeWidth="1.8" />
              <path d="M14 27V13H21C24.866 13 28 15.91 28 19.5C28 23.09 24.866 26 21 26H18" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <p className="text-4xl leading-none font-extrabold tracking-tight text-slate-800">Bid Out</p>
        </div>

        <div className="hidden items-center gap-8 text-[15px] font-semibold text-slate-600 md:flex">
          <Link className="transition-colors hover:text-rose-500" to="/">Home</Link>
          <a className="transition-colors hover:text-rose-500" href="#">Auctions</a>
          <a className="transition-colors hover:text-rose-500" href="#">Contact</a>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              <p className="hidden text-sm font-semibold text-slate-600 sm:block">
                {currentUser.full_name} ({currentUser.role})
              </p>
              <button
                type="button"
                onClick={onLogoutClick}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Nav