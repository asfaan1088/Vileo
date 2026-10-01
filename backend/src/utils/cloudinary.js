import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import { response } from "express";
import fs from "fs";  // node default
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})


const uploadOnCloudinary=async(localFilePath)=>{
    try{
        if(!localFilePath)return null;
        //upload the file on Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto",
        })
        //file has been uploaded successfully
        // console.log("file has been uploaded successfully",response.url);
        // return response;
        fs.unlinkSync(localFilePath)
        return response;
        
    }catch(error){
        console.log("cloudinary error",error);
        fs.unlinkSync(localFilePath)//remove the locally saved  temporay file as the upload operation got failed
        return null;    
    }
}

export {uploadOnCloudinary}