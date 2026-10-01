import mongoose ,{Schema} from "mongoose";


const likeSchema=new Schema(
    {
        video:{
            type:Schema.Types.ObjectId,
            ref:"Video",
            required:false,
        },
        comment:{
            type:Schema.Types.ObjectId,
            ref:"Comment",
            required:false,
        },
        tweet:{
            type:Schema.Types.ObjectId,
            ref:"Tweet",
            required:false,
            },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        // likedBY:{
        //     type:String,
        //     required:false,
        // },
    },{
        timestamps:true
    }
)
export const Like=mongoose.model("Like",likeSchema)