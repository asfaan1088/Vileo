import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import VideoCard from "../components/VideoCard"
import { getCurrentUser, getUserChannelProfile } from "../services/userService"
import { getVideosByUserId } from "../services/videoService"
import { toggleSubscription } from "../services/subscriptionService"

function Channel() {
  const { userId } = useParams()
  const [searchParams] = useSearchParams()
  const usernameParam = searchParams.get("username") || ""
  const [channelResult, setChannelResult] = useState(null)
  const [currentUserResult, setCurrentUserResult] = useState(null)
  const [subscribeLoading, setSubscribeLoading] = useState(false)
  const [subscribeError, setSubscribeError] = useState("")
  const pageKey = `${userId || ""}:${usernameParam}`
  const pageResult = channelResult?.key === pageKey ? channelResult : null
  const channel = pageResult?.channel || null
  const videos = pageResult?.videos || []
  const profileLoading = !pageResult || pageResult.profileLoading
  const videosLoading = !pageResult || pageResult.videosLoading
  const profileError = pageResult?.profileError || ""
  const videosError = pageResult?.videosError || ""
  const subscribed = pageResult?.subscribed || false
  const subscriberCount = pageResult?.subscriberCount ?? null
  const currentUser = currentUserResult?.settled ? currentUserResult.user : null
  const currentUserLoading = !currentUserResult?.settled

  useEffect(() => {
    let active = true
    getCurrentUser()
      .then((response) => {
        if (active) setCurrentUserResult({ settled: true, user: response.data })
      })
      .catch(() => {
        if (active) setCurrentUserResult({ settled: true, user: null })
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadChannel() {
      let videosResponse = null

      const updateResult = (update) => {
        setChannelResult((current) => ({
          ...(current?.key === pageKey ? current : {
            channel: null,
            videos: [],
            profileLoading: true,
            videosLoading: true,
            profileError: "",
            videosError: "",
            subscribed: false,
            subscriberCount: null,
          }),
          ...update,
          key: pageKey,
        }))
      }

      try {
        if (!userId) throw new Error("A user ID is required to view this channel.")
        videosResponse = await getVideosByUserId(userId)
        if (active) updateResult({ videos: videosResponse.data.videos || [], videosLoading: false })
      } catch (error) {
        if (active) updateResult({ videosError: error.message, videosLoading: false })
      }

      try {
        let username = usernameParam
        if (!username) {
          username = videosResponse?.data?.videos?.[0]?.owner?.username || ""
        }
        if (!username) {
          throw new Error("Creator information is unavailable for this channel.")
        }

        const profileResponse = await getUserChannelProfile(username)
        const profile = profileResponse.data
        if (String(profile._id) !== String(userId)) {
          throw new Error("Channel not found.")
        }
        if (active) {
          updateResult({
            channel: profile,
            subscribed: Boolean(profile.isSubscribed),
            subscriberCount: profile.subscribersCount ?? 0,
            profileLoading: false,
          })
        }
      } catch (error) {
        if (active) updateResult({ profileError: error.message, profileLoading: false })
      }
    }

    loadChannel()
    return () => {
      active = false
    }
  }, [userId, usernameParam, pageKey])

  const handleSubscribe = async () => {
    if (!currentUser) {
      setSubscribeError("Login to subscribe.")
      return
    }

    setSubscribeError("")
    setSubscribeLoading(true)
    try {
      const response = await toggleSubscription(userId)
      const nextSubscribed = response.data.subscribed
      setChannelResult((current) => current?.key === pageKey ? {
        ...current,
        subscribed: nextSubscribed,
        subscriberCount: current.subscriberCount === null
          ? null
          : Math.max(0, current.subscriberCount + (nextSubscribed ? 1 : -1)),
      } : current)
    } catch (error) {
      setSubscribeError(error.message)
    } finally {
      setSubscribeLoading(false)
    }
  }

  const displayedChannel = channel || videos[0]?.owner
  const isOwnChannel = currentUser && String(currentUser._id) === String(userId)

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-6">
      {profileLoading ? (
        <p>Loading channel...</p>
      ) : displayedChannel ? (
        <section className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center">
          {displayedChannel.avatar ? (
            <img
              src={displayedChannel.avatar}
              alt={`${displayedChannel.username || "Creator"} avatar`}
              className="w-20 h-20 sm:w-24 sm:h-24 aspect-square shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 aspect-square shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-semibold">
              {(displayedChannel.username || "?").charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <h1 className="text-2xl font-bold">
              {displayedChannel.fullname || displayedChannel.username || "Creator"}
            </h1>
            {displayedChannel.username && (
              <p className="text-gray-500">@{displayedChannel.username}</p>
            )}
            {subscriberCount !== null && (
              <p className="text-sm text-gray-500 mt-1">
                {subscriberCount} subscribers
              </p>
            )}
            {isOwnChannel ? (
              <p className="mt-3 text-sm text-gray-500">Your channel</p>
            ) : (
              <button
                type="button"
                onClick={handleSubscribe}
                disabled={subscribeLoading || profileLoading || currentUserLoading}
                className={`mt-3 px-4 py-2 rounded-full disabled:opacity-50 ${subscribed ? "bg-gray-200 hover:bg-gray-300" : "bg-black text-white hover:bg-gray-800"}`}
              >
                {subscribeLoading ? "Please wait..." : subscribed ? "Subscribed" : "Subscribe"}
              </button>
            )}
            {subscribeError && <p className="mt-2 text-sm text-red-600">{subscribeError}</p>}
          </div>
        </section>
      ) : (
        <p className="text-red-600">{profileError || "Channel not found."}</p>
      )}

      {profileError && displayedChannel && (
        <p className="mt-3 text-red-600">{profileError}</p>
      )}

      <section className="mt-6">
        <h2 className="text-xl font-bold mb-4">Videos</h2>
        {videosLoading ? (
          <p>Loading videos...</p>
        ) : videosError ? (
          <p className="text-red-600">{videosError}</p>
        ) : videos.length === 0 ? (
          <p className="text-gray-600">No videos uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Channel
