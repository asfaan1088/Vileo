import { apiRequest } from "./api"

async function getVideoComments(videoId) {
  return apiRequest(`/comments/${videoId}`)
}

async function addComment(videoId, content) {
  return apiRequest(`/comments/${videoId}`, {
    method: "POST",
    body: JSON.stringify({ content }),
  })
}

export { getVideoComments, addComment }
