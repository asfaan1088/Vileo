import { useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { getVideoById } from "../services/videoService"
import { getCurrentUser } from "../services/userService"
import Comments from "../components/Comments"
import VideoActions from "../components/VideoActions"
import SubscribeButton from "../components/SubscribeButton"
import { addToWatchHistory } from "../services/historyService"

function VideoPage() {
  const { videoId } = useParams()
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const [descriptionNeedsCollapse, setDescriptionNeedsCollapse] = useState(false)
  const descriptionRef = useRef(null)
  const recordedVideoId = useRef(null)

  useEffect(() => {
    getVideoById(videoId)
      .then((response) => {
        setVideo(response.data)
      })
      .catch((error) => {
        setError(error.message)
      })
      .finally(() => setLoading(false))
  }, [videoId])

  useEffect(() => {
    if (!video?._id || recordedVideoId.current === video._id) return

    recordedVideoId.current = video._id
    addToWatchHistory(video._id).catch((error) => {
      console.error("Failed to record watch history:", error)
    })
  }, [video?._id])

  useEffect(() => {
    getCurrentUser()
      .then((response) => setCurrentUser(response.data))
      .catch(() => setCurrentUser(null))
      .finally(() => setAuthLoading(false))
  }, [])

  useEffect(() => {
    const measureDescription = () => {
      if (descriptionExpanded || !descriptionRef.current) return
      setDescriptionNeedsCollapse(
        descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight + 1,
      )
    }

    measureDescription()
    window.addEventListener("resize", measureDescription)
    return () => window.removeEventListener("resize", measureDescription)
  }, [video?.description, descriptionExpanded])

  if (loading) {
    return <p className="p-6">Loading video...</p>
  }

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>
  }

  const creatorUsername = video.owner?.username || "Unknown Creator"
  const creatorName = video.owner?.fullname || creatorUsername
  const channelId = video.owner?._id || video.owner
  const uploadDate = video.createdAt
    ? new Date(video.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Date unavailable"

  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-6">
      <div className="w-full max-w-5xl mx-auto flex justify-center bg-black rounded-xl overflow-hidden">
        <video
          src={video.videoFile}
          controls
          className="max-w-full max-h-[75vh] w-auto h-auto object-contain"
        />
      </div>

      <h1 className="text-2xl font-bold mt-4">
        {video.title}
      </h1>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <Link
              to={`/channel/${channelId}${video.owner?.username ? `?username=${encodeURIComponent(video.owner.username)}` : ""}`}
              className="flex items-center gap-3 rounded-lg hover:opacity-80"
            >
              {video.owner?.avatar ? (
                <img
                  src={video.owner.avatar}
                  alt={`${creatorUsername} avatar`}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium">
                  {creatorUsername.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <div>
                <p className="font-medium">{creatorName}</p>
                {video.owner?.username && (
                  <p className="text-sm text-gray-500">@{video.owner.username}</p>
                )}
              </div>
            </Link>
            <SubscribeButton
              channelId={channelId}
              currentUser={currentUser}
              authLoading={authLoading}
            />
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500 mt-1">
            {video.views} views · Uploaded {uploadDate}
          </p>
        </div>

        <VideoActions
          videoId={videoId}
          currentUser={currentUser}
          authLoading={authLoading}
        />
      </div>

      <section className="mt-5 rounded-xl bg-gray-100 p-4">
        <h2 className="font-semibold mb-2">Description</h2>
        <p
          ref={descriptionRef}
          className={`whitespace-pre-wrap ${descriptionExpanded ? "" : "max-h-24 overflow-hidden"}`}
        >
          {video.description}
        </p>
        {descriptionNeedsCollapse && (
          <button
            type="button"
            onClick={() => setDescriptionExpanded((expanded) => !expanded)}
            className="mt-2 font-medium hover:underline"
          >
            {descriptionExpanded ? "Show less" : "Show more"}
          </button>
        )}
      </section>

      <Comments videoId={videoId} />
    </main>
  )
}

export default VideoPage
