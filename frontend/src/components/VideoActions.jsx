import { useEffect, useState } from "react"
import { addVideoToPlaylist, createPlaylist, getUserPlaylists } from "../services/playlistService"
import { getLikedVideos, toggleVideoLike } from "../services/likeService"

function VideoActions({ videoId, currentUser, authLoading }) {
  const [likeResult, setLikeResult] = useState(null)
  const [likeLoading, setLikeLoading] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const [playlists, setPlaylists] = useState([])
  const [playlistsLoading, setPlaylistsLoading] = useState(false)
  const [savingPlaylist, setSavingPlaylist] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [playlistName, setPlaylistName] = useState("")
  const [playlistDescription, setPlaylistDescription] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const likeKey = `${currentUser?._id || ""}:${videoId}`
  const liked = Boolean(currentUser && likeResult?.key === likeKey && likeResult.liked)
  const checkingLike = Boolean(currentUser && likeResult?.key !== likeKey)

  useEffect(() => {
    if (!currentUser) return
    let active = true

    getLikedVideos()
      .then((response) => {
        if (active) {
          setLikeResult({
            key: likeKey,
            liked: response.data.some((video) => video._id === videoId),
          })
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })

    return () => {
      active = false
    }
  }, [currentUser, videoId, likeKey])

  const handleLike = async () => {
    if (authLoading) return
    if (!currentUser) {
      setError("Login to like this video.")
      return
    }

    setError("")
    setLikeLoading(true)
    try {
      const response = await toggleVideoLike(videoId)
      setLikeResult({ key: likeKey, liked: response.data.liked })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLikeLoading(false)
    }
  }

  const openSave = async () => {
    setMessage("")
    setError("")
    if (authLoading) return
    if (!currentUser) {
      setMessage("Login to save this video.")
      return
    }

    setSaveOpen((open) => !open)
    if (playlists.length || saveOpen) return

    setPlaylistsLoading(true)
    try {
      const response = await getUserPlaylists(currentUser._id)
      setPlaylists(response.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setPlaylistsLoading(false)
    }
  }

  const saveToPlaylist = async (playlistId) => {
    setError("")
    setMessage("")
    setSavingPlaylist(true)
    try {
      await addVideoToPlaylist(playlistId, videoId)
      setMessage("Video saved to playlist.")
      setSaveOpen(false)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingPlaylist(false)
    }
  }

  const handleCreatePlaylist = async (event) => {
    event.preventDefault()
    setError("")
    setMessage("")
    setSavingPlaylist(true)
    try {
      const response = await createPlaylist(playlistName, playlistDescription)
      const playlist = response.data
      setPlaylists((currentPlaylists) => [playlist, ...currentPlaylists])
      await addVideoToPlaylist(playlist._id, videoId)
      setMessage("Playlist created and video saved.")
      setPlaylistName("")
      setPlaylistDescription("")
      setShowCreateForm(false)
      setSaveOpen(false)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingPlaylist(false)
    }
  }

  return (
    <div className="flex flex-wrap items-start gap-2">
      <button
        type="button"
        onClick={handleLike}
        disabled={authLoading || likeLoading || checkingLike}
        aria-pressed={liked}
        className={`px-4 py-2 rounded-full hover:bg-gray-200 disabled:opacity-50 ${liked ? "bg-gray-300 font-semibold" : "bg-gray-100"}`}
      >
        {likeLoading ? "Saving..." : liked ? "Liked" : "Like"}
      </button>

      <button type="button" className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200">
        Share
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={openSave}
          disabled={authLoading || savingPlaylist}
          className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          Save
        </button>

        {saveOpen && (
          <div className="absolute right-0 z-10 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
            <h3 className="font-semibold mb-3">Save to playlist</h3>
            {playlistsLoading ? (
              <p className="text-sm text-gray-500">Loading playlists...</p>
            ) : playlists.length === 0 ? (
              <p className="text-sm text-gray-500 mb-3">No playlists yet.</p>
            ) : (
              <div className="max-h-40 overflow-y-auto">
                {playlists.map((playlist) => (
                  <button
                    key={playlist._id}
                    type="button"
                    onClick={() => saveToPlaylist(playlist._id)}
                    disabled={savingPlaylist}
                    className="block w-full rounded px-2 py-2 text-left hover:bg-gray-100 disabled:opacity-50"
                  >
                    {playlist.name}
                  </button>
                ))}
              </div>
            )}

            {showCreateForm ? (
              <form onSubmit={handleCreatePlaylist} className="mt-3 space-y-2">
                <input
                  value={playlistName}
                  onChange={(event) => setPlaylistName(event.target.value)}
                  placeholder="Playlist name"
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
                <input
                  value={playlistDescription}
                  onChange={(event) => setPlaylistDescription(event.target.value)}
                  placeholder="Description"
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
                <button
                  type="submit"
                  disabled={savingPlaylist}
                  className="w-full rounded bg-black px-3 py-2 text-white disabled:opacity-50"
                >
                  {savingPlaylist ? "Creating..." : "Create and save"}
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="mt-3 w-full rounded border border-gray-300 px-3 py-2 hover:bg-gray-100"
              >
                Create playlist
              </button>
            )}
          </div>
        )}
      </div>

      {(message || error) && (
        <p className={`basis-full text-sm ${error ? "text-red-600" : "text-green-700"}`}>
          {error || message}
        </p>
      )}
    </div>
  )
}

export default VideoActions
