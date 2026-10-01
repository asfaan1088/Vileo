import { apiRequest } from "./api"

async function loginUser(identifier, password) {
  const credentials = identifier.includes("@")
    ? { email: identifier, password }
    : { username: identifier, password }

  return apiRequest("/users/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  })
}

async function getCurrentUser() {
  return apiRequest("/users/current-user")
}

async function getUserChannelProfile(username) {
  return apiRequest(`/users/c/${encodeURIComponent(username)}`)
}

export { loginUser, getCurrentUser, getUserChannelProfile }
