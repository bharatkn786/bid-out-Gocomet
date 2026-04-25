import { API_BASE_URL, authHeaders } from './api'

export async function createRFQ(payload, token) {
  const res = await fetch(`${API_BASE_URL}/rfq/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const errorDetail = typeof data.detail === 'object'
      ? JSON.stringify(data.detail)
      : data.detail || 'Failed to create RFQ'
    throw new Error(errorDetail)
  }
  return data
}

export async function listRFQs() {
  const res = await fetch(`${API_BASE_URL}/rfq/list`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch RFQs')
  return data
}
