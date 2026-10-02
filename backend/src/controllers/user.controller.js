import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import {uploadOnCloudinary}from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessandRefreshTokens = async(userId)=>{
  try{
    const user = await User.findById(userId)  
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken=refreshToken;
  
    await user.save({validateBeforeSave:false});
    return {accessToken,refreshToken}

  }catch(error){
     throw new ApiError(500,"Token generation failed,something went wrong")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  //steps to register user
  //get user details from frontend
  //validation-not empty
  //check if user already exist:username,email
  //check for images ,check for avatar
  //upload them to cloudinary,avatar
  //create user object
  //create user object-create entry in DB
  //remove Password and refreh token field from response
  //check for user creation
  //return response
  const { fullname, email, username, password } = req.body;
  console.log("email:", email);
  //    if(fullname===""){
  //     throw new ApiError(400,"fullname is required")
  //    }

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser=  await User.findOne({ $or: [{ email }, { username }] })
    
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }
   console.log("REQ BODY:", req.body);
   console.log("REQ FILES:", req.files);

 const avatarLocalPath= req.files?.avatar?.[0]?.path;
const coverImageLocalPath= req.files?.coverImage?.[0]?.path;

if(!avatarLocalPath){
    throw new ApiError(400,"Avatar is required")

}
const avatar=  await uploadOnCloudinary(avatarLocalPath)

const coverImage = coverImageLocalPath
  ? await uploadOnCloudinary(coverImageLocalPath)
  : null;

if(!avatar){
    throw new ApiError(400,"Avatar upload failed")

}

const user= await User.create({
    fullname,
    avatar:avatar.url,
    coverImage:coverImage?.url||"",
    email,
    username:username.toLowerCase(),
    password,
})

const createdUser=await User.findById(user._id).select(
  "-password -refreshToken"
   )

   if(!createdUser){
    throw new ApiError(500,"User creation failed")

   }

   return res.status(200).json(
    new ApiResponse(200,createdUser,"User created successfully")
   )

})

const loginUser=asyncHandler(async(req,res)=>{
  //req body->data
  //username or email
  //find the user
  //password check
  //access and refresh token
  //send cookies
  //return response
  try {
    
    const {email,username,password}=req.body;
  
   if(!(username || email) || !password){
      throw new ApiError(400,"Credentials required")
  }
    const user=await User.findOne({$or:[{username},{email}]})//this will return the user if either username or email matches
    
    if(!user){
      throw new ApiError(404,"User not found")
    }
    if(!password){
      throw new ApiError(400,"Password is required")
    }
    const isPasswordValid=await user.isPasswordCorrect(password);
    if(!isPasswordValid){
      throw new ApiError(401,"Invalid credentials")
    }
    const {accessToken, refreshToken} = await generateAccessandRefreshTokens(user._id);
  
   const loggedInUser=await User.findById(user._id).select("-password -refreshToken")
   console.log("LOGGED IN USER:", loggedInUser);
    //cookies
     const options={
      httpOnly:true,
      secure:true,
      sameSite:"none",
     }
     return res.status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", refreshToken, options)
     .json(
      new ApiResponse(
        200,
        {
          user:loggedInUser,
          accessToken,
          refreshToken
        },
        "Login successful"
     )  )
  
  
    
  } catch (error) {
    console.log("Login error:", error);
    throw new ApiError(error.code||502,error.message||"Login failed")
  }
})

const logoutUser=asyncHandler(async(req,res)=>{
   //clear cookies
   //clear refresh token from DB
   //clear access token from DB or blacklist it
   //return response
   await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: 1 //this removes the field from DB, we can also set it to null or empty string 

    } 
  },
    { new: true }
   )

   const options={
    httpOnly:true,
    secure:true,
    sameSite:"none",
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
      new ApiResponse(200,{},"Logout successful")
    )
     
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
  //get refresh token from cookies
  try {
     const incomingRefreshToken= req.cookies.refreshToken||req.body.refreshToken;//validate refresh token,body is used when we want to send refresh token in body instead of cookies ,like in mobile apps
    //validate refresh token
    //generate new access token
    //send new access token in response and cookies
      if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
        }
  
      const decodedRefreshToken=jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        )
      const user =await User.findById(decodedRefreshToken?._id); 
       if(!user){
        throw new ApiError(401,"invalid refresh token");
       }
       if(incomingRefreshToken!==user?.refreshToken){
        throw new ApiError(401," refresh token is expired or used");
       }
   
       const options={
        httpOnly:true,
        secure:true,
        sameSite:"none",
       }
  
       const {accessToken, refreshToken} = await generateAccessandRefreshTokens(user._id);
       return res
       .status(200)
       .cookie("accessToken", accessToken, options)
       .cookie("refreshToken", refreshToken, options)
       .json(
        new ApiResponse(200,
          {
            accessToken,
            refreshToken
          },
          "Access token refreshed successfully"
        ))
  } catch (error) {
    throw new ApiError(401,error.message||"unauthorized request")
  }
  

  })

const changeCurrentPassword=asyncHandler(async(req,res)=>{
  //get current password and new password from req body
  //validate current password
  //update with new password
  //clear refresh token and access token
  //send response
  
  const {oldPassword,newPassword}=req.body;
  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if(!isPasswordCorrect){
    throw new ApiError(401,"Current password is incorrect")
  }
  user.password=newPassword;
  await user.save({validateBeforeSave:false});
  
  return res
  .status(200)
  .json(
    new ApiResponse(200,{},"Password changed successfully")
  )

}) 

const getCurrentUser=asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(
    new ApiResponse(200,req.user,"Current user fetched successfully")
  )
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
  //get details from req body
  //validate details
  //update details in DB
  //return response

  const {fullname,username,email}=req.body;
  if(!fullname || !email){
    throw new ApiError(400,"All fields are required")
  }

  const user=await User.findByIdAndUpdate(
    req.user._id,
     {
      $set:{
        fullname,
        email
      }

     },{
      new:true
     }

  ).select("-password")
  
  return res
  .status(200)
  .json(
    new ApiResponse(200,user,"Account details updated successfully"))
  
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
  //get avatar from req body
  //validate avatar
  //upload avatar to cloudinary
  //update avatar in DB
  //return responseww

  const avatarLocalPath= req.file?.path
  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar is required")
  }
   const avatar=  await uploadOnCloudinary(avatarLocalPath)

   if(!avatar.url){
    throw new ApiError(400,"Avatar upload failed")
   }
   
    const user=await User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
          avatar:avatar.url
        }
      },
      {
        new:true
      }
    ).select("-password")
    return res
    .status(200)
    .json(
      new ApiResponse(200,user,"Avatar updated successfully")
    )

})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
  //get cover image from req body
  //validate cover image
  //upload cover image to cloudinary
  //update cover image in DB
  //return response

  const coverImageLocalPath= req.file?.path
  if(!coverImageLocalPath){
    throw new ApiError(400,"Cover image is required")
  }
   const coverImage=  await uploadOnCloudinary(coverImageLocalPath)

   if(!coverImage.url){
    throw new ApiError(400,"Cover image upload failed")
   }
   
    const user=await User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
          coverImage:coverImage.url
        }
      },
      {
        new:true
      }
    ).select("-password")
    return res
    .status(200)
    .json(
      new ApiResponse(200,user,"Cover image updated successfully")
    )

})

const getUserChannelProfile=asyncHandler(async(req,res)=>{
  //get user id from req params
  //find user by id
  //return user details along with videos and playlists created by the user
  const {username}=req.params;

  if(!username?.trim()){
    throw new ApiError(400,"Username is missing")
  }

  //aggregation pipeline to get user details along with videos and playlists created by the user
  const channel= await User.aggregate([
    {
      $match:{
        username:username?.toLowerCase()
      }
    },
    {
      $lookup:{
        from:"subscriptions",
        localField:"_id",
        foreignField:"channel",
        as:"subscribers"
      }
    },
    {
      $lookup:{
         from:"subscriptions",
        localField:"_id",
        foreignField:"subscriber",
        as:"subscribedTo"
      }
    },
    {
      $addFields:{
        subscribersCount:{
          $size:"$subscribers"
        },
        channelsSubscribedToCount:{
          $size:"$subscribedTo"
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,

          }
        
        }
      
      }
    },
    {
      $project:{
        fullname:1,
        username:1,
        subscribersCount:1,
        channelsSubscribedToCount:1,
        isSubscribed:1,
        avatar:1,
        coverImage:1,
        createdAt:1,
        email:1

      }
    
    }

  ])

  

  if(!channel?.length){
    throw new ApiError(404,"Channel not found")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200,channel[0],"Channel profile fetched successfully")
  )
})

const getWatchHistory=asyncHandler(async(req,res)=>{
  const user =await User.aggregate([
  
    {
      $match:{
        _id:new mongoose.Types.ObjectId(req.user._id)

      }
    },
    
    {
      $lookup:{
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
        pipeline:[
          {
            $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {
                  $project:{
                    fullname:1,
                    username:1,
                    avatar:1
                  }
                }
              ]
            
              
            }
          },
          {
            $addFields:{
              owner:{
                $first:"$owner"
              }
            }
          }
        ]
      }
    }
    
  ])

  return res
  .status(200)
  .json(  
    new ApiResponse(200,user[0].watchHistory,"Watch history fetched successfully")
  )
  
})

const addToWatchHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id")
  }

  const video = await Video.findById(videoId).select("_id")

  if (!video) {
    throw new ApiError(404, "Video not found")
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { watchHistory: video._id } },
    { new: true },
  ).select("_id")

  if (!user) {
    throw new ApiError(404, "User not found")
  }

  return res.status(200).json(
    new ApiResponse(200, { videoId: video._id }, "Watch history updated successfully"),
  )
})

const deleteUserAccount=asyncHandler(async(req,res)=>{
  //delete user account from DB
  //also delete all the videos and playlists created by the user
  //clear cookies
  //return response
  await User.findByIdAndDelete(req.user._id);
    const options={
    httpOnly:true,
    secure:true,
    sameSite:"none",
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
      new ApiResponse(200,{},"Account deleted successfully")
    )
})


export { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  addToWatchHistory,
  deleteUserAccount
 };
