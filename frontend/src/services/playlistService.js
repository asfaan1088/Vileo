import { apiRequest } from "./api"

async function getUserPlaylists(userId) {
  return apiRequest(`/playlists/user/${userId}`)
}

async function getPlaylistById(playlistId) {
  return apiRequest(`/playlists/${playlistId}`)
}

async function createPlaylist(name, description) {
  return apiRequest("/playlists", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  })
}

async function addVideoToPlaylist(playlistId, videoId) {
  return apiRequest(`/playlists/${playlistId}/videos/${videoId}`, {
    method: "PATCH",
  })
}

async function removeVideoFromPlaylist(playlistId, videoId) {
  return apiRequest(`/playlists/${playlistId}/videos/${videoId}`, {
    method: "DELETE",
  })
}

export {
  getUserPlaylists,
  getPlaylistById,
  createPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
}
