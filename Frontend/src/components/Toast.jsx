import { useEffect } from 'react'

function Toast({ message, type = 'error', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  const isError = type === 'error'

  return (
    <div className={`fixed top-5 right-5 z-[100] flex max-w-sm items-start gap-3 rounded-xl border p-4 shadow-xl ${isError ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
      <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ${isError ? 'bg-red-500' : 'bg-green-500'}`}>
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={isError ? 'M6 18L18 6M6 6l12 12' : 'M5 13l4 4L19 7'} />
        </svg>
      </div>
      <p className={`flex-1 text-sm font-semibold ${isError ? 'text-red-800' : 'text-green-800'}`}>{message}</p>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600 transition">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default Toast
