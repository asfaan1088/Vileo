import { apiRequest } from "./api"

async function getDashboardStats() {
  return apiRequest("/dashboards/stats")
}

async function getDashboardVideos() {
  return apiRequest("/dashboards/videos")
}

export { getDashboardStats, getDashboardVideos }
