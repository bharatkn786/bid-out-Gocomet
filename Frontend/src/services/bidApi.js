import { API_BASE_URL, authHeaders } from './api'

export async function placeBid(payload, token) {
  const res = await fetch(`${API_BASE_URL}/bid/place`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || 'Failed to place bid')
  return data
}

export async function listBids(rfqId) {
  const res = await fetch(`${API_BASE_URL}/bid/list/${rfqId}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch bids')
  return data
}

export async function getMyBiddedRFQs(token) {
  const res = await fetch(`${API_BASE_URL}/bid/my-rfqs`, {
    headers: authHeaders(token)
  })
  const data = await res.json().catch(() => ([]))
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch my bids')
  return data
}
