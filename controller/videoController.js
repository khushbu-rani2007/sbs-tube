require('dotenv').config()
const User = require('../models/User')
const Video = require('../models/Video')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cloudinary = require('../config/cloudinary')
const { resource } = require('../app')

// const upload = async (req, res) => {
//     try {
//         const token = req.headers.authorization.split(" ")[1]
//         const tokenData = jwt.verify(token, process.env.SEC_KEY)
//         const userId = tokenData._id

//         let thumbnailId = "";
//         let thumbnailUrl = "";

//         if (req.files && req.files.thumbnail) {

//             const thumbUpload = await cloudinary.uploader.upload(
//                 req.files.thumbnail.tempFilePath,
//                 {
//                     resource_type: "image",
//                     folder: "youtube/thumbnail"
//                 }
//             );

//             thumbnailId = thumbUpload.public_id;
//             thumbnailUrl = thumbUpload.secure_url;
//         }

//         const videoUpload = await cloudinary.uploader.upload(req.files.video.tempFilePath, {
//             resource_type: 'video',
//             folder: "youtube/video"
//         }

//         )

//         const video = new Video({
//             title: req.body.title,
//             description: req.body.description,
//             videoId: videoUpload.public_id,
//             videoUrl: videoUpload.secure_url,
//             thumbnailId: thumbnailId,
//             thumbnailUrl: thumbnailUrl,
//             uploadedBy: userId,
//             tags: JSON.parse(req.body.tags),
//             category:req.body.category
//         })

//         const uploadedVideo = await video.save()

//         res.status(200).json({
//             msg: "Videouploaded",
//             video: uploadedVideo
//         })
//     }
//     catch (err) {
//         console.log(err)
//         res.status(500).json({
//             error: err
//         })
//     }
// }

const upload = async (req, res) => {
    try {
        console.log("BODY:", req.body)
        console.log("FILES:", req.files)

        // Token check
        if (!req.headers.authorization) {
            return res.status(401).json({
                message: "Authorization token missing"
            })
        }

        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)
        const userId = tokenData._id

        // File check
        if (!req.files) {
            return res.status(400).json({
                message: "No files received"
            })
        }

        if (!req.files.video) {
            return res.status(400).json({
                message: "Video file not received"
            })
        }

        if (!req.files.thumbnail) {
            return res.status(400).json({
                message: "Thumbnail file not received"
            })
        }

        // Thumbnail upload
        const thumbUpload = await cloudinary.uploader.upload(
            req.files.thumbnail.tempFilePath,
            {
                resource_type: "image",
                folder: "youtube/thumbnail"
            }
        )

        const thumbnailId = thumbUpload.public_id
        const thumbnailUrl = thumbUpload.secure_url

        // Video upload
        const videoUpload = await cloudinary.uploader.upload(
            req.files.video.tempFilePath,
            {
                resource_type: "video",
                folder: "youtube/video"
            }
        )

        // Save video
        const video = new Video({
            title: req.body.title,
            description: req.body.description,
            videoId: videoUpload.public_id,
            videoUrl: videoUpload.secure_url,
            thumbnailId: thumbnailId,
            thumbnailUrl: thumbnailUrl,
            uploadedBy: userId,
            tags: JSON.parse(req.body.tags),
            category: req.body.category
        })

        const uploadedVideo = await video.save()

        res.status(200).json({
            msg: "Video uploaded",
            video: uploadedVideo
        })

    } catch (err) {
        console.log("UPLOAD ERROR:", err)

        res.status(500).json({
            error: err.message
        })
    }
}


const like = async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const videoId = req.params.videoId

        const video = await Video.findById(videoId)

        if(!video)
        {
            return res.status(500).json({
                error:"Video not found"
            })
        }

        if(video.likedBy.includes(tokenData._id))
        {
           video.likes -= 1,
           video.likedBy = video.likedBy.filter(userId => userId != tokenData._id)

           await video.save()

           return res.status(500).json({
            likes:video.likes,
            video:video
           })
        }


        if(video.dislikedBy.includes(tokenData._id))
        {
           video.dislikes -= 1,
           video.dislikedBy = video.dislikedBy.filter(userId => userId != tokenData._id)
        }

           video.likes += 1,
           video.likedBy.push(tokenData._id)

           await video.save()

           res.status(200).json({
            likes : video.likes,
            video:video
           })

    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
}




const unlike = async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const videoId = req.params.videoid

        const video = await Video.findById(videoId)

        if(!video)
        {
            return res.status(500).json({
                error:"Video not found"
            })
        }

        if(video.dislikedBy.includes(tokenData._id))
        {
           video.dislikes -= 1,
           video.dislikedBy = video.dislikedBy.filter(userId => userId != tokenData._id)

           await video.save()

           return res.status(500).json({
            dislikes:video.dislikes,
            video:video
           })
        }


        if(video.likedBy.includes(tokenData._id))
        {
           video.likes -= 1,
           video.likedBy = video.likedBy.filter(userId => userId != tokenData._id)
        }

           video.dislikes += 1,
           video.dislikedBy.push(tokenData._id)

           await video.save()

           res.status(200).json({
            dislikes : video.dislikes,
            video:video
           })

    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
}

const videoById = async(req,res)=>{
    try
    {
       const video = await Video.findById(req.params.videoid).populate('uploadedBy','_id channelName profilePicUrl subscriber')

       if(!video)
       {
        return res.status(500).json({
            msg:"Video not found!"
        })
       }

       console.log(video.views)
       video.views += 1;

       await video.save()

       res.status(200).json({
        video:video
       })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
}

const allVideo = async(req,res)=>{
    try
    {

    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
}


// ----------allvideo---------

const allvideo = async(req,res)=>{
    try
    {
        const videos = await video.find().populate('', 'channelName','profilepic')
         console.log(videos)
        res.status(200).json({
            video:videos

        })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
}



const videosByChannelId = async(req,res)=>{
    try
    {
       const videos = await Video.findById(req.params.channelid)

       if(!videos)
       {
        return res.status(500).json({
            msg:"Videos not found!"
        })
       }

       res.status(200).json({
        videos:videos
       })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
}




module.exports = { upload, like, unlike, videoById, allVideo, videosByChannelId}