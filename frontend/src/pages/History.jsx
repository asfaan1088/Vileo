import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import VideoCard from "../components/VideoCard"
import { getCurrentUser } from "../services/userService"
import { getWatchHistory } from "../services/historyService"

function History() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    let active = true

    async function loadHistory() {
      try {
        await getCurrentUser()
      } catch {
        if (active) navigate("/login", { replace: true })
        return
      }
      if (!active) return

      try {
        const response = await getWatchHistory()
        if (active) setVideos(response.data || [])
      } catch (requestError) {
        if (active) setError(requestError.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadHistory()
    return () => {
      active = false
    }
  }, [navigate])

  if (loading) {
    return <main className="max-w-6xl mx-auto p-4 sm:p-6">Loading watch history...</main>
  }

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6">Watch History</h1>

      {error ? (
        <p className="text-red-600">Unable to load watch history: {error}</p>
      ) : videos.length === 0 ? (
        <p className="text-gray-600">Your watch history is empty.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </main>
  )
}

export default History
