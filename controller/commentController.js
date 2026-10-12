require('dotenv').config()
const Comment = require('../models/Comment')
const Video = require('../models/Video')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { profilePic } = require('./userController')
// const { findById } = require('../models/User')

const addComment = async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)
        const userId = tokenData._id

        const videoId = req.params.videoId

        const comment = new Comment({
            commentText : req.body.commentText,
            videoId:videoId,
            userId:userId
        })

        await comment.save()

        res.status(200).json({
            comment:comment
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

const getAllComment = async(req,res)=>{
    try
    {
        if(req.headers.authorization)
        {
            const token = req.headers.authorization.split(" ")[1]
            if(token)
            {
                const tokenData = jwt.verify(token, process.env.SEC_KEY)
                const userId = tokenData._id

                const videoId = req.params.videoId

                const comments1 = await Comment.find({videoId:videoId}).populate('userId', 'channelName profilePicUrl')
                // const cmt = await Comment.find({commentId:commentId}).populate('userId', 'channelName profilePicUrl').select('-likedBy -dislikedBy')

                const result = comments1.map(comment =>(
                    {
                        commentId : comment._id,
                        commentText : comment.commentText,
                        channelName : comment.userId.channelName,
                        profilePicUrl : comment.userId.profilePicUrl,
                        likes : comment.likes,
                        dislikes : comment.dislikes,
                        likeStatus : comment.likedBy.some(c=> c == userId),
                        dislikeStatus : comment.dislikedBy.some(c=> c == userId),
                        commentBy : comment.userId._id
                    }
                ))

                console.log(result)

                 return res.status(200).json({
                 comments:result
        })
            }
        }
        else
        {
            const videoId = req.params.videoId

            const comments = await Comment.find({ videoId: videoId }).populate('userId', 'channelName profilePicUrl').select('-likedBy -dislikedBy')

                 const result = comments.map(comment =>(
                    {
                        commentId : comment._id,
                        commentText : comment.commentText,
                        channelName : comment.userId.channelName,
                        profilePicUrl : comment.userId.profilePicUrl,
                        likes : comment.likes,
                        dislikes : comment.dislikes,
                        likeStatus : false,
                        dislikeStatus : false
                    }
                ))

        return res.status(200).json({
            comments:result
        })
        }


    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
}


const like = async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const commentId = req.params.commentId

        const comment = await Comment.findById(commentId)
            console.log(comment)

        if(!comment)
        {
            return res.status(500).json({
                error:"comment not found"
            })
        }

        if(comment.likedBy.includes(tokenData._id))
        {
           comment.likes -= 1,
           comment.likedBy = comment.likedBy.filter(userId => userId != tokenData._id)

           await comment.save()

           return res.status(200).json({
            likes:comment.likes,
            comment:comment,
            likeStatus : false
           })
        }


        if(comment.dislikedBy.includes(tokenData._id))
        {
           comment.dislikes -= 1,
           comment.dislikedBy = comment.dislikedBy.filter(userId => userId != tokenData._id)
        }

           comment.likes += 1,
           comment.likedBy.push(tokenData._id)

           await comment.save()

           const cmt = await Comment.findById(commentId).


           res.status(200).json({
            likes : comment.likes,
            comment:comment,
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

        const commentId = req.params.commentId

        const comment = await Comment.findById(commentId)

        if(!comment)
        {
            return res.status(500).json({
                error:"Comment not found"
            })
        }

        if(comment.dislikedBy.includes(tokenData._id))
        {
           comment.dislikes -= 1,
           comment.dislikedBy = comment.dislikedBy.filter(userId => userId != tokenData._id)

           await comment.save()

           return res.status(200).json({
            dislikes:comment.dislikes,
            comment:comment,
            dislikeStatus : false
           })
        }


        if(comment.likedBy.includes(tokenData._id))
        {
           comment.likes -= 1,
           comment.likedBy = comment.likedBy.filter(userId => userId != tokenData._id)
        }

           comment.dislikes += 1,
           comment.dislikedBy.push(tokenData._id)

           await comment.save()

           res.status(200).json({
            dislikes : comment.dislikes,
            comment:comment,
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

const deleteComment = async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)
        const userId = tokenData._id

        const commentId = req.params.commentId
        // console.log(commentId)

        const comment = await Comment.findById(commentId)
        if(!comment)
        {
            return res.status(500).json({
                error:"Comment not found!"
            })
        }

        const video = await Video.findById(comment.videoId)
        if (!video) {
            return res.status(500).json({
                error: "Video not found"
            })
        }
        // console.log(video.uploadedBy._id)

        const commentUserId = comment.userId._id
        const videoUserId = video.uploadedBy._id

        if(userId == !videoUserId || userId == !commentUserId)
        {
            // console.log('inside it')
            return res.status(500).json({
                error:"You can't delete this comment!"
            })
        }


        await Comment.deleteOne({_id : commentId})
        // await Comment.findByIdAndDelete(commentId)
        res.status(200).json({
            msg:"Comment deleted!"
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



const updateComment = async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)
        const userId = tokenData._id

        const commentId = req.params.commentId

        const comment = await Comment.findById(commentId)
        if(!comment)
        {
            return res.status(500).json({
                error:"Comment not found!"
            })
        }

        const video = await Video.findById(comment.videoId)
        if (!video) {
            return res.status(500).json({
                error: "Video not found"
            })
        }

        const commentUserId = comment.userId._id

        if(userId != commentUserId)
        {
                return res.status(500).json({
                error:"You can't update this comment!"
            })
        }

        const updateComment = {
            commentText : req.body.commentText,
            videoId:comment.videoId,
            userId:userId
        }

        const respo = await Comment.findByIdAndUpdate(commentId, updateComment, {new : true})
        // console.log(respo)

        res.status(200).json({
            updatedComment : respo
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

module.exports = {addComment,getAllComment,like,unlike,deleteComment,updateComment}