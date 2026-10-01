import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import VideoCard from "../components/VideoCard"
import { getCurrentUser } from "../services/userService"
import { getVideoById } from "../services/videoService"
import { getPlaylistById, removeVideoFromPlaylist } from "../services/playlistService"

function Playlist() {
  const { playlistId } = useParams()
  const [playlist, setPlaylist] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentUser, setCurrentUser] = useState(null)
  const [currentUserLoading, setCurrentUserLoading] = useState(true)
  const [removingVideoId, setRemovingVideoId] = useState("")
  const [removeError, setRemoveError] = useState("")

  useEffect(() => {
    let active = true

    getCurrentUser()
      .then((response) => {
        if (active) setCurrentUser(response.data)
      })
      .catch(() => {
        if (active) setCurrentUser(null)
      })
      .finally(() => {
        if (active) setCurrentUserLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadPlaylist() {
      setLoading(true)
      setError("")
      try {
        const response = await getPlaylistById(playlistId)
        const playlistData = response.data
        const videoIds = playlistData.videos || []
        const videoResponses = await Promise.all(videoIds.map((id) => getVideoById(id)))

        if (active) {
          setPlaylist(playlistData)
          setVideos(videoResponses.map((videoResponse) => videoResponse.data))
        }
      } catch (requestError) {
        if (active) setError(requestError.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadPlaylist()
    return () => {
      active = false
    }
  }, [playlistId])

  const isOwner = currentUser && String(currentUser._id) === String(playlist?.owner?._id || playlist?.owner)

  const handleRemove = async (videoId) => {
    setRemoveError("")
    setRemovingVideoId(videoId)
    try {
      const response = await removeVideoFromPlaylist(playlistId, videoId)
      setPlaylist(response.data)
      setVideos((currentVideos) => currentVideos.filter((video) => video._id !== videoId))
    } catch (requestError) {
      setRemoveError(requestError.message)
    } finally {
      setRemovingVideoId("")
    }
  }

  if (loading) {
    return <main className="max-w-6xl mx-auto p-4 sm:p-6">Loading playlist...</main>
  }

  if (error) {
    return (
      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        <p className="text-red-600">{error}</p>
        {!currentUserLoading && !currentUser && (
          <Link to="/login" className="mt-3 inline-block underline">Log in</Link>
        )}
      </main>
    )
  }

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-6">
      <Link to="/playlists" className="text-sm text-gray-600 hover:text-black">
        ← Back to Playlists
      </Link>

      <h1 className="mt-4 text-2xl font-bold">{playlist.name}</h1>
      {playlist.description && <p className="mt-2 text-gray-600">{playlist.description}</p>}
      <p className="mt-2 text-sm text-gray-500">{videos.length} videos</p>

      {removeError && <p className="mt-4 text-red-600">{removeError}</p>}

      <section className="mt-6">
        <h2 className="text-xl font-bold mb-4">Videos</h2>
        {videos.length === 0 ? (
          <p className="text-gray-600">No videos in this playlist yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video._id}>
                <VideoCard video={video} />
                {isOwner && !currentUserLoading && (
                  <button
                    type="button"
                    onClick={() => handleRemove(video._id)}
                    disabled={removingVideoId === video._id}
                    className="mt-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {removingVideoId === video._id ? "Removing..." : "Remove from playlist"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Playlist
