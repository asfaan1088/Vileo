import { apiRequest } from "./api"

async function getWatchHistory() {
  return apiRequest("/users/watch-history")
}

async function addToWatchHistory(videoId) {
  return apiRequest(`/users/watch-history/${videoId}`, {
    method: "POST",
  })
}

export { getWatchHistory, addToWatchHistory }
