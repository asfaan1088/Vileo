import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import VideoCard from "../components/VideoCard"
import { getCurrentUser } from "../services/userService"
import { getSubscribedChannels } from "../services/subscriptionService"
import { getVideosByUserId } from "../services/videoService"

async function getAllChannelVideos(channelId) {
  const videos = []
  let page = 1
  let totalPages

  do {
    const response = await getVideosByUserId(channelId, page, 50)
    videos.push(...(response.data.videos || []))
    totalPages = response.data.pagination?.totalPages || 0
    page += 1
  } while (page <= totalPages)

  return videos
}

function Subscriptions() {
  const [result, setResult] = useState(null)
  const navigate = useNavigate()
  const loading = !result
  const channels = result?.channels || []
  const videos = result?.videos || []
  const error = result?.error || ""

  useEffect(() => {
    let active = true

    async function loadSubscriptions() {
      let userId
      try {
        const userResponse = await getCurrentUser()
        userId = userResponse.data._id
      } catch {
        if (active) navigate("/login", { replace: true })
        return
      }

      try {
        if (!active) return
        const channelsResponse = await getSubscribedChannels(userId)
        const subscribedChannels = channelsResponse.data || []
        if (!active) return

        if (subscribedChannels.length === 0) {
          setResult({ channels: subscribedChannels, videos: [], error: "" })
          return
        }

        const channelVideos = await Promise.all(
          subscribedChannels.map((channel) => getAllChannelVideos(channel._id)),
        )
        const allVideos = channelVideos.flat().sort(
          (first, second) => new Date(second.createdAt) - new Date(first.createdAt),
        )
        if (active) setResult({ channels: subscribedChannels, videos: allVideos, error: "" })
      } catch (requestError) {
        if (active) setResult({ channels: [], videos: [], error: requestError.message })
      }
    }

    loadSubscriptions()

    return () => {
      active = false
    }
  }, [navigate])

  if (loading) {
    return <main className="max-w-6xl mx-auto p-4 sm:p-6">Loading subscriptions...</main>
  }

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6">Subscriptions</h1>

      {error ? (
        <p className="text-red-600">Unable to load subscriptions: {error}</p>
      ) : channels.length === 0 ? (
        <div>
          <p className="text-gray-600">No subscriptions yet.</p>
          <Link to="/" className="mt-3 inline-block text-blue-700 hover:underline">
            Explore Videos
          </Link>
        </div>
      ) : videos.length === 0 ? (
        <p className="text-gray-600">No videos from your subscriptions yet.</p>
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

export default Subscriptions
