import { Router } from "express";

import {
    changeCurrentPassword,
    deleteUserAccount,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    addToWatchHistory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
            format: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
        },
        {
            name: "coverImage",
            maxCount: 1,
            format: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
        },
    ]),
    registerUser
);

router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Protect all routes below
router.use(verifyJWT);

// Authentication
router.route("/logout").post(logoutUser);
router.route("/change-password").post(changeCurrentPassword);

// User profile
router.route("/current-user").get(getCurrentUser);
router.route("/update-profile").put(updateAccountDetails);
router.route("/update-avatar").patch(
    upload.single("avatar"),
    updateUserAvatar
);
router.route("/cover-image").patch(
    upload.single("coverImage"),
    updateUserCoverImage
);
router.route("/c/:username").get(getUserChannelProfile);

// User activity
router.route("/watch-history").get(getWatchHistory);
router.route("/watch-history/:videoId").post(addToWatchHistory);

// Account management
router.route("/delete-account").delete(deleteUserAccount);

export default router;
