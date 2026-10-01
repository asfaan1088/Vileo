import { apiRequest } from "./api"

async function toggleSubscription(channelId) {
  return apiRequest(`/subscriptions/channel/${channelId}`, {
    method: "POST",
  })
}

async function getSubscribedChannels(subscriberId) {
  return apiRequest(`/subscriptions/user/${subscriberId}/channels`)
}

async function getChannelSubscribers(channelId) {
  return apiRequest(`/subscriptions/channel/${channelId}/subscribers`)
}

export { toggleSubscription, getSubscribedChannels, getChannelSubscribers }
