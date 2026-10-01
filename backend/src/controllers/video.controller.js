import mongoose, { isValidObjectId } from "mongoose"

import { Video } from "../models/video.model.js"

import { User } from "../models/user.model.js"

import { ApiError } from "../utils/ApiError.js"

import { ApiResponse } from "../utils/ApiResponse.js"

import { asyncHandler } from "../utils/asyncHandler.js"

import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1)

    const limitNumber = Math.max(Number.parseInt(limit, 10) || 10, 1)

    const filter = {}

    if (query?.trim()) {

        filter.$or = [
            { title: { $regex: query.trim(), $options: "i" } },
            { description: { $regex: query.trim(), $options: "i" } }
        ]
    }

    if (userId) {

        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid user id")
        }

        filter.owner = new mongoose.Types.ObjectId(userId)
    }

    const allowedSortFields = new Set([
        "createdAt",
        "updatedAt",
        "title",
        "views",
        "duration"
    ])

    const sortField = allowedSortFields.has(sortBy)
        ? sortBy
        : "createdAt"

    const sortDirection = sortType === "asc" ? 1 : -1

    const [videos, totalVideos] = await Promise.all([

        Video.find(filter)
            .sort({ [sortField]: sortDirection })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .populate("owner", "username fullname avatar")
            .lean(),

        Video.countDocuments(filter)
    ])

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos,
                pagination: {
                    page: pageNumber,
                    limit: limitNumber,
                    totalVideos,
                    totalPages: Math.ceil(totalVideos / limitNumber)
                }
            },
            "Videos fetched successfully"
        )
    )
})


const publishAVideo = asyncHandler(async (req, res) => {

    const { title, description } = req.body

    if (!title?.trim() || !description?.trim()) {
        throw new ApiError(400, "Title and description are required")
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path

    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if (!videoFileLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video file and thumbnail are required")
    }

    const [videoFile, thumbnail] = await Promise.all([
        uploadOnCloudinary(videoFileLocalPath),
        uploadOnCloudinary(thumbnailLocalPath)
    ])

    if (!videoFile?.url || !thumbnail?.url) {
        throw new ApiError(400, "Video upload failed")
    }

    const video = await Video.create({

        videoFile: videoFile.url,

        thumbnail: thumbnail.url,

        title: title.trim(),

        description: description.trim(),

        duration: videoFile.duration || 0,

        owner: req.user?._id
    })

    return res.status(201).json(
        new ApiResponse(
            201,
            video,
            "Video published successfully"
        )
    )
})


const getVideoById = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)
        .populate("owner", "username fullname avatar")
        .lean()

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video fetched successfully"
            )
        )
})


const updateVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    const { title, description } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const updateFields = {}

    if (title?.trim()) {
        updateFields.title = title.trim()
    }

    if (description?.trim()) {
        updateFields.description = description.trim()
    }

    if (req.file?.path) {

        const thumbnail = await uploadOnCloudinary(req.file.path)

        if (!thumbnail?.url) {
            throw new ApiError(500, "Failed to upload thumbnail")
        }

        updateFields.thumbnail = thumbnail.url
    }

    if (!Object.keys(updateFields).length) {
        throw new ApiError(
            400,
            "At least one field is required to update"
        )
    }

    const video = await Video.findOneAndUpdate(
        {
            _id: videoId,
            owner: req.user?._id
        },
        {
            $set: updateFields
        },
        {
            new: true
        }
    )

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video updated successfully"
            )
        )
})


const deleteVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findOneAndDelete({
        _id: videoId,
        owner: req.user?._id
    })

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video deleted successfully"
            )
        )
})


const togglePublishStatus = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    const { publish } = req.body||{}

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    if (typeof publish !== "boolean") {
        throw new ApiError(
            400,
            "Publish status must be a boolean"
        )
    }

    const video = await Video.findOneAndUpdate(
        {
            _id: videoId,
            owner: req.user?._id
        },
        {
            $set: {
                isPublished: publish
            }
        },
        {
            new: true
        }
    )

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video publish status updated successfully"
            )
        )
})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
