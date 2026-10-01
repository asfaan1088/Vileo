import { apiRequest } from "./api"

async function getAllVideos(query = "") {
  const params = new URLSearchParams()
  if (query.trim()) {
    params.set("query", query.trim())
  }

  const queryString = params.toString()
  return apiRequest(`/videos${queryString ? `?${queryString}` : ""}`)
}

async function getVideosByUserId(userId, page = 1, limit = 10) {
  const params = new URLSearchParams({ userId, page, limit })
  return apiRequest(`/videos?${params.toString()}`)
}

async function getVideoById(videoId) {
  return apiRequest(`/videos/${videoId}`)
}

async function uploadVideo(formData) {
  return apiRequest("/videos", {
    method: "POST",
    body: formData,
  })
}

async function updateVideoPublishStatus(videoId, publish) {
  return apiRequest(`/videos/toggle/publish/${videoId}`, {
    method: "PATCH",
    body: JSON.stringify({ publish }),
  })
}

export {
  getAllVideos,
  getVideosByUserId,
  getVideoById,
  uploadVideo,
  updateVideoPublishStatus,
}
