import { Router } from "express";

import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all tweet routes
router.use(verifyJWT);

// Create a new tweet
router.route("/").post(createTweet);

// Get all tweets of a user
router.route("/user/:userId").get(getUserTweets);

// Update or delete a tweet
router
    .route("/:tweetId")
    .patch(updateTweet)
    .delete(deleteTweet);

export default router;