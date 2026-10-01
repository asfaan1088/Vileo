import { Router } from "express";

import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all playlist routes
router.use(verifyJWT);

// Create a playlist
router.route("/").post(createPlaylist);

// Get, update, or delete a playlist
router
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist);

// Add or remove a video from a playlist
router.route("/:playlistId/videos/:videoId").patch(addVideoToPlaylist);
router.route("/:playlistId/videos/:videoId").delete(removeVideoFromPlaylist);

// Get all playlists of a user
router.route("/user/:userId").get(getUserPlaylists);

export default router;