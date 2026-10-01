const API_URL = import.meta.env.VITE_API_URL

async function apiRequest(endpoint, options = {}) {
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(!isFormData && { "Content-Type": "application/json" }),
      ...options.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.message || "Request failed")
  }

  return data
}

export { API_URL, apiRequest }