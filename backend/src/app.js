import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";


const app=express();

// app.use(cors())                        //'use' method is used for configuration and middlewares
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
}))  

app.use(express.json({limit:"10kb"}))
app.use(express.urlencoded({extended:true,limit:"10kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import healthRouter from "./routes/healthcheck.routes.js"

app.use((req,res,next)=>{
    console.log("URL:", req.url)
    console.log("METHOD:", req.method)
    next()
})


//routes declaration
app.use("/api/v1/users",userRouter)
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/comments",commentRouter)
app.use("/api/v1/likes",likeRouter)
app.use("/api/v1/subscriptions",subscriptionRouter)
app.use("/api/v1/playlists",playlistRouter)
app.use("/api/v1/tweets",tweetRouter)
app.use("/api/v1/dashboards",dashboardRouter)
app.use("/api/v1/health",healthRouter)
//url-> http://localhost:8000/api/v1/users/login

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        statusCode,
        data: null,
        message: err.message || "Internal Server Error",
        success: false,
        errors: err.errors || []
    });
})

export {app}
