import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = req.user?._id

    if (!channelId || !mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id")
    }

    const ownerId = new mongoose.Types.ObjectId(channelId)

    const [videoStats, totalSubscribers] = await Promise.all([
        Video.aggregate([
            {
                $match: {
                    owner: ownerId
                }
            },
            {
                $group: {
                    _id: null,
                    totalVideos: { $sum: 1 },
                    totalViews: { $sum: "$views" },
                    videoIds: { $push: "$_id" }
                }
            }
        ]),
        Subscription.countDocuments({ channel: ownerId })
    ])

    const stats = videoStats[0] || {
        totalVideos: 0,
        totalViews: 0,
        videoIds: []
    }

    const totalLikes = stats.videoIds.length
        ? await Like.countDocuments({ video: { $in: stats.videoIds } })
        : 0

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalViews: stats.totalViews,
                totalSubscribers,
                totalVideos: stats.totalVideos,
                totalLikes
            },
            "Channel stats fetched successfully"
        )
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find({ owner: req.user?._id })
        .sort({ createdAt: -1 })
        .lean()

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Channel videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
    }
