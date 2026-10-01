import { useEffect, useState } from "react"
import {
  getChannelSubscribers,
  getSubscribedChannels,
  toggleSubscription,
} from "../services/subscriptionService"

function SubscribeButton({ channelId, currentUser, authLoading }) {
  const [subscriptionResult, setSubscriptionResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const requestKey = `${channelId}:${currentUser?._id || ""}`

  useEffect(() => {
    if (!channelId || authLoading || !currentUser) return
    let active = true

    Promise.all([
      getSubscribedChannels(currentUser._id),
      getChannelSubscribers(channelId),
    ])
      .then(([channelsResponse, subscribersResponse]) => {
        if (active) {
          setSubscriptionResult({
            key: requestKey,
            subscribed: channelsResponse.data.some((channel) => channel._id === channelId),
            subscriberCount: subscribersResponse.data.length,
            error: "",
          })
        }
      })
      .catch((error) => {
        if (active) {
          setSubscriptionResult({ key: requestKey, error: error.message })
          setMessage(error.message)
        }
      })

    return () => {
      active = false
    }
  }, [channelId, currentUser, authLoading, requestKey])

  const currentResult = subscriptionResult?.key === requestKey ? subscriptionResult : null
  const subscribed = currentResult?.subscribed || false
  const subscriberCount = currentResult?.subscriberCount ?? null
  const checkingState = Boolean(channelId && currentUser && !currentResult) || authLoading

  const handleToggle = async () => {
    if (authLoading) return
    if (!currentUser) {
      setMessage("Login to subscribe.")
      return
    }
    if (String(currentUser._id) === String(channelId)) return

    setMessage("")
    setLoading(true)
    try {
      const response = await toggleSubscription(channelId)
      const nextSubscribed = response.data.subscribed
      setSubscriptionResult((current) => ({
        key: requestKey,
        subscribed: nextSubscribed,
        subscriberCount: current?.key === requestKey && current.subscriberCount !== null
          ? Math.max(0, current.subscriberCount + (nextSubscribed ? 1 : -1))
          : current?.key === requestKey ? current.subscriberCount : null,
      }))
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!channelId) return null

  return (
    <div className="flex flex-wrap items-center gap-3 mt-2">
      {currentUser && String(currentUser._id) === String(channelId) ? (
        <span className="text-sm text-gray-500">Your channel</span>
      ) : (
        <button
          type="button"
          onClick={handleToggle}
          disabled={authLoading || checkingState || loading}
          className={`px-4 py-2 rounded-full hover:bg-gray-800 disabled:opacity-50 ${subscribed ? "bg-gray-200 text-black hover:bg-gray-300" : "bg-black text-white"}`}
        >
          {loading || checkingState ? "Please wait..." : subscribed ? "Subscribed" : "Subscribe"}
        </button>
      )}
      {subscriberCount !== null && (
        <span className="text-sm text-gray-500">{subscriberCount} subscribers</span>
      )}
      {message && <span className="basis-full text-sm text-red-600">{message}</span>}
    </div>
  )
}

export default SubscribeButton
