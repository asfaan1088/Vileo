import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getCurrentUser } from "../services/userService"
import { getDashboardStats, getDashboardVideos } from "../services/dashboardService"
import { updateVideoPublishStatus } from "../services/videoService"

function formatDate(date) {
  if (!date) return "Date unavailable"
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function Dashboard() {
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [stats, setStats] = useState(null)
  const [videos, setVideos] = useState([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [videosLoading, setVideosLoading] = useState(true)
  const [statsError, setStatsError] = useState("")
  const [videosError, setVideosError] = useState("")
  const [updatingVideoId, setUpdatingVideoId] = useState("")
  const [actionError, setActionError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      try {
        const response = await getCurrentUser()
        if (!active) return
        setUser(response.data)
        setCheckingAuth(false)

        getDashboardStats()
          .then((statsResponse) => {
            if (active) setStats(statsResponse.data)
          })
          .catch((error) => {
            if (active) setStatsError(error.message)
          })
          .finally(() => {
            if (active) setStatsLoading(false)
          })

        getDashboardVideos()
          .then((videosResponse) => {
            if (active) setVideos(videosResponse.data || [])
          })
          .catch((error) => {
            if (active) setVideosError(error.message)
          })
          .finally(() => {
            if (active) setVideosLoading(false)
          })
      } catch {
        if (active) navigate("/login", { replace: true })
      }
    }

    loadDashboard()
    return () => {
      active = false
    }
  }, [navigate])

  const handlePublishToggle = async (video) => {
    setActionError("")
    setUpdatingVideoId(video._id)
    try {
      const response = await updateVideoPublishStatus(video._id, !video.isPublished)
      setVideos((currentVideos) => currentVideos.map((currentVideo) => (
        currentVideo._id === video._id ? response.data : currentVideo
      )))
    } catch (error) {
      setActionError(error.message)
    } finally {
      setUpdatingVideoId("")
    }
  }

  if (checkingAuth) {
    return <main className="max-w-6xl mx-auto p-4 sm:p-6">Checking sign-in...</main>
  }

  const statCards = stats ? [
    { label: "Total Videos", value: stats.totalVideos },
    { label: "Total Views", value: stats.totalViews },
    { label: "Subscribers", value: stats.totalSubscribers },
    { label: "Total Likes", value: stats.totalLikes },
  ] : []

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt=""
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : null}
          <div>
            <h1 className="text-2xl font-bold">Creator Dashboard</h1>
            {user?.username && <p className="text-sm text-gray-500">@{user.username}</p>}
          </div>
        </div>
        <Link to="/upload" className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800">
          Upload Video
        </Link>
      </header>

      <section>
        <h2 className="text-xl font-bold mb-4">Channel statistics</h2>
        {statsLoading ? (
          <p>Loading statistics...</p>
        ) : statsError ? (
          <p className="text-red-600">Unable to load dashboard statistics: {statsError}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold">{stat.value ?? 0}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-4">Your videos</h2>
        {videosLoading ? (
          <p>Loading videos...</p>
        ) : videosError ? (
          <p className="text-red-600">Unable to load videos: {videosError}</p>
        ) : videos.length === 0 ? (
          <div className="rounded-xl border border-gray-200 p-6">
            <p className="text-gray-600">No videos uploaded yet.</p>
            <Link to="/upload" className="mt-3 inline-block text-blue-700 hover:underline">
              Upload Video
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {actionError && <p className="text-red-600">{actionError}</p>}
            {videos.map((video) => (
              <article key={video._id} className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center">
                <Link to={`/video/${video._id}`} className="flex min-w-0 items-center gap-4">
                  <img
                    src={video.thumbnail}
                    alt=""
                    className="h-20 w-36 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <h3 className="font-semibold line-clamp-2">{video.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{video.views ?? 0} views</p>
                    <p className="text-sm text-gray-500">Created {formatDate(video.createdAt)}</p>
                  </div>
                </Link>

                <div className="sm:ml-auto flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-sm ${video.isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                    {video.isPublished ? "Published" : "Unpublished"}
                  </span>
                  <Link to={`/video/${video._id}`} className="px-3 py-2 rounded-lg hover:bg-gray-100">
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => handlePublishToggle(video)}
                    disabled={updatingVideoId === video._id}
                    className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {updatingVideoId === video._id
                      ? "Updating..."
                      : video.isPublished ? "Unpublish" : "Publish"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Dashboard
