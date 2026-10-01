import { Router } from "express";

import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboard.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all dashboard routes
router.use(verifyJWT);

// Dashboard statistics
router.route("/stats").get(getChannelStats);

// Channel videos
router.route("/videos").get(getChannelVideos);

export default router;