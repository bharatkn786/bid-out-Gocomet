export const API_BASE_URL = 'http://localhost:8000/api'

export function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}
