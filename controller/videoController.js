require('dotenv').config()
const User = require('../models/User')
const Video = require('../models/Video')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cloudinary = require('../config/cloudinary')
const { resource } = require('../app')

const upload = async (req, res) => {
    try {
       console.log("video upload token : ",req.headers.authorization)
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)
        const userId = tokenData._id

        let thumbnailId = "";
        let thumbnailUrl = "";

        if (req.files && req.files.thumbnail) {

            const thumbUpload = await cloudinary.uploader.upload(
                req.files.thumbnail.tempFilePath,
                {
                    resource_type: "image",
                    folder: "youtube/thumbnail"
                }
            );

            thumbnailId = thumbUpload.public_id;
            thumbnailUrl = thumbUpload.secure_url;
        }

        const videoUpload = await cloudinary.uploader.upload(req.files.video.tempFilePath, {
            resource_type: 'video',
            folder: "youtube/video"
        }

        )

        const video = new Video({
            title: req.body.title,
            description: req.body.description,
            videoId: videoUpload.public_id,
            videoUrl: videoUpload.secure_url,
            thumbnailId: thumbnailId,
            thumbnailUrl: thumbnailUrl,
            uploadedBy: userId,
            tags: JSON.parse(req.body.tags),
            category:req.body.category
        })

        const uploadedVideo = await video.save()

        res.status(200).json({
            msg: "Videouploaded",
            video: uploadedVideo
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
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

           return res.status(200).json({
            totalLikes:video.likes,
            video:video,
            likeStatus : false
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
            totalLikes : video.likes,
            video:video,
            likeStatus : true
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

        const videoId = req.params.videoId

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
            video:video,
            dislikeStatus : false
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
            video:video,
            dislikeStatus : true
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
       const video = await Video.findById(req.params.videoId).populate('uploadedBy','_id channelName profilePicUrl subscriber')

       if(!video)
       {
        return res.status(500).json({
            msg:"Video not found!"
        })
       }


       var likedStatus = false;
       var dislikedStatus = false;
       var SubscribedStatus = false;

       
       if(req.headers.authorization)
       {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        if(video.likedBy.includes(tokenData._id))
        {
            likedStatus = true
        }
        else if (video.dislikedBy.includes(tokenData._id))
        {
            dislikedStatus = true
        }

        if(video.uploadedBy.subscriber.includes(tokenData._id))
        {
            SubscribedStatus = true
        }
       }

       console.log(video.views)
       video.views += 1;

       await video.save()

       res.status(200).json({
        video:video,
        likedStatus : likedStatus,
        dislikedStatus : dislikedStatus,
        SubscribedStatus : SubscribedStatus
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
        console.log("hello")
        const videos = await Video.find().populate('uploadedBy','channelName profilePicUrl')
        console.log(videos)
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

const deleteVideo = async(req,res)=>{
    try
    {

        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const videoId = req.params.videoId  
        const video = await Video.findById(req.params.videoId)

        if(!video)
        {
            return res.status(200).json({
                msg:"Video not found!"
            })
        }

        if(video.uploadedBy != tokenData._id)
        {
            return res.status(200).json({
                error:"Invalid user",
                msg:"You can't delete this video"
            })
        }

        await cloudinary.uploader.destroy(video.videoId)
        await cloudinary.uploader.destroy(video.thumbnailId)

        await Video.deleteOne({_id:video._id})
        res.status(200).json({
            msg:"Video Deleted.."
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


module.exports = { upload, like, unlike, videoById, allVideo, videosByChannelId, deleteVideo}