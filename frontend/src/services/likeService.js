import { apiRequest } from "./api"

async function toggleVideoLike(videoId) {
  return apiRequest(`/likes/toggle/v/${videoId}`, {
    method: "POST",
  })
}

async function getLikedVideos() {
  return apiRequest("/likes/videos")
}

export { toggleVideoLike, getLikedVideos }
