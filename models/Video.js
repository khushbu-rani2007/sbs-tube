const mongoose = require('mongoose')

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    videoUrl: {
        type: String,
        required: true
    },
    videoId: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String,
        required: true,
        default: ""
    },
    thumbnailId: {
        type: String,
        required: true,
        default: ""
    },
    views: {
        type: Number,
        default: 0
    },
    uploadedBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    },
    likedBy: [{
        type: mongoose.Types.ObjectId,
        ref: "User"
    }],
    dislikedBy: [{
        type: mongoose.Types.ObjectId,
        ref: "User"
    }],
    tags:[{
        type:String
    }],
    category:{
        type:String,
        required:true
    }
}, { timestamps: true })

module.exports = mongoose.model('video', videoSchema);