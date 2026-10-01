import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleLike = async ({ field, resourceId, owner }) => {
  const existingLike = await Like.findOne({
    [field]: resourceId,
    owner,
  });
  console.log("FIELD:", field);
  console.log("RESOURCE ID:", resourceId);
  console.log("OWNER:", owner);
  console.log("EXISTING LIKE:", existingLike);

  if (existingLike) {
    await existingLike.deleteOne();
    return false;
  }

  await Like.create({
    [field]: resourceId,
    owner,
  });

  return true;
};

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId).select("_id");

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const liked = await toggleLike({
    field: "video",
    resourceId: videoId,
    owner: req.user._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { liked },
        liked ? "Video liked successfully" : "Video unliked successfully",
      ),
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  const comment = await Comment.findById(commentId).select("_id");

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const liked = await toggleLike({
    field: "comment",
    resourceId: commentId,
    owner: req.user._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { liked },
        liked ? "Comment liked successfully" : "Comment unliked successfully",
      ),
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  const tweet = await Tweet.findById(tweetId).select("_id");

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  const liked = await toggleLike({
    field: "tweet",
    resourceId: tweetId,
    owner: req.user._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { liked },
        liked ? "Tweet liked successfully" : "Tweet unliked successfully",
      ),
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
        video: { $exists: true, $ne: null },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $unwind: "$video",
    },
    {
      $replaceRoot: {
        newRoot: "$video",
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully"),
    );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
