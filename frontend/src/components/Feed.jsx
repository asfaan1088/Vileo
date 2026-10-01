import { useEffect, useState } from "react"
import VideoCard from "./VideoCard"
import { getAllVideos } from "../services/videoService"

function Feed({ query = "" }) {
  const [result, setResult] = useState(null)

  useEffect(() => {
    let active = true

    getAllVideos(query)
      .then((response) => {
        if (active) setResult({ query, videos: response.data.videos, error: "" })
      })
      .catch((error) => {
        if (active) setResult({ query, videos: [], error: error.message })
      })

    return () => {
      active = false
    }
  }, [query])

  const currentResult = result?.query === query ? result : null
  const videos = currentResult?.videos || []
  const loading = !currentResult
  const error = currentResult?.error || ""

  if (loading) {
    return <p>Loading videos...</p>
  }

  if (error) {
    return <p className="text-red-600">{error}</p>
  }

  if (videos.length === 0) {
    return <p>No videos found.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <VideoCard
          key={video._id}
          video={video}
        />
      ))}
    </div>
  )
}

export default Feed
