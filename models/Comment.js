const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    commentText:{
        type:String,
        required:true
    },
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
    videoId:{
        type:mongoose.Types.ObjectId,
        ref:"Video"
    },
    likes:{
        type:Number,
        default:0
    },
    likedBy:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
    dislikes:{
        type:Number,
        default:0
    },
    dislikedBy:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    }
},
{timestamps:true}
)

module.exports = mongoose.model('Comment',commentSchema)