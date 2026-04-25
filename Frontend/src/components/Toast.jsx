import { useEffect } from 'react'

function Toast({ message, type = 'error', onClose, duration = 5000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const bgClass = type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
  const textClass = type === 'error' ? 'text-red-800' : 'text-green-800'
  const iconClass = type === 'error' ? 'bg-red-500' : 'bg-green-500'

  return (
    <div className={`fixed top-5 right-5 z-[100] flex max-w-sm items-start gap-3 rounded-xl border p-4 shadow-xl animate-in slide-in-from-right duration-300 ${bgClass}`}>
      <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ${iconClass}`}>
        {type === 'error' ? (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-semibold ${textClass}`}>{message}</p>
      </div>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600 transition">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default Toast
