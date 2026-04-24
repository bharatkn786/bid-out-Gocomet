const API_BASE_URL = 'http://localhost:8000/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.detail || 'Request failed')
  }

  return data
}

export async function signup(payload) {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function login(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function verifyOtp(payload) {
  return request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchMe(token) {
  return request('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
