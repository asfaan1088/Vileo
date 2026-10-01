import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { createPlaylist, getUserPlaylists } from "../services/playlistService"
import { getCurrentUser } from "../services/userService"
import { getVideoById } from "../services/videoService"

function Playlists() {
  const [playlists, setPlaylists] = useState([])
  const [previews, setPreviews] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [user, setUser] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [creating, setCreating] = useState(false)
  const [success, setSuccess] = useState("")

  useEffect(() => {
    let active = true

    async function loadPlaylists() {
      setLoading(true)
      try {
        const userResponse = await getCurrentUser()
        if (!active) return
        setUser(userResponse.data)

        const playlistsResponse = await getUserPlaylists(userResponse.data._id)
        const userPlaylists = playlistsResponse.data || []
        if (active) setPlaylists(userPlaylists)

        const previewEntries = await Promise.all(userPlaylists.map(async (playlist) => {
          const firstVideoId = playlist.videos?.[0]
          if (!firstVideoId) return [playlist._id, ""]

          try {
            const videoResponse = await getVideoById(firstVideoId)
            return [playlist._id, videoResponse.data.thumbnail || ""]
          } catch {
            return [playlist._id, ""]
          }
        }))
        if (active) setPreviews(Object.fromEntries(previewEntries))
      } catch (requestError) {
        if (active) setError(requestError.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadPlaylists()
    return () => {
      active = false
    }
  }, [])

  const handleCreate = async (event) => {
    event.preventDefault()
    if (!name.trim() || !description.trim()) {
      setError("Playlist name and description are required.")
      return
    }
    if (!user) {
      setError("Log in to create a playlist.")
      return
    }

    setError("")
    setSuccess("")
    setCreating(true)
    try {
      const response = await createPlaylist(name.trim(), description.trim())
      setPlaylists((current) => [response.data, ...current])
      setPreviews((current) => ({ ...current, [response.data._id]: "" }))
      setName("")
      setDescription("")
      setShowCreateForm(false)
      setSuccess("Playlist created successfully.")
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">My Playlists</h1>
        <button
          type="button"
          onClick={() => setShowCreateForm((show) => !show)}
          disabled={!user}
          className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Create Playlist
        </button>
      </div>

      {!user && !loading && (
        <p className="mb-4 text-gray-600">
          Log in to manage playlists. <Link to="/login" className="underline">Login</Link>
        </p>
      )}

      {showCreateForm && user && (
        <form onSubmit={handleCreate} className="mb-6 max-w-xl space-y-3 rounded-xl border border-gray-200 p-4">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Playlist name"
            required
            disabled={creating}
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Description"
            required
            disabled={creating}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Playlist"}
          </button>
        </form>
      )}

      {error && <p className="mb-4 text-red-600">{error}</p>}
      {success && <p className="mb-4 text-green-700">{success}</p>}

      {loading ? (
        <p>Loading playlists...</p>
      ) : error ? (
        null
      ) : !user ? (
        <p className="text-gray-600">Log in to view your playlists.</p>
      ) : playlists.length === 0 ? (
        <p className="text-gray-600">No playlists yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {playlists.map((playlist) => (
            <Link
              key={playlist._id}
              to={`/playlist/${playlist._id}`}
              className="rounded-xl border border-gray-200 p-5 hover:bg-gray-50"
            >
              {previews[playlist._id] ? (
                <img
                  src={previews[playlist._id]}
                  alt=""
                  className="mb-4 aspect-video w-full rounded-lg object-cover"
                />
              ) : (
                <div className="mb-4 flex aspect-video items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                  Playlist
                </div>
              )}
              <h2 className="font-semibold">{playlist.name}</h2>
              {playlist.description && (
                <p className="mt-1 text-sm text-gray-600 line-clamp-3">{playlist.description}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                {playlist.videos?.length || 0} videos
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}

export default Playlists
