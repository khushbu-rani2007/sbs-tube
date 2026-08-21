require('dotenv').config()
const Comment = require('../models/Comment')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { findById } = require('../models/User')

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
            commentBy:userId
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
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)
        const userId = tokenData._id

        const videoId = req.params.videoId

        const comments = await Comment.find({videoId:videoId})

        res.status(200).json({
            comments:comments
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


const like = async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const commentId = req.params.commentId

        const comment = await Comment.findById(commentId)

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

           return res.status(500).json({
            likes:comment.likes,
            comment:comment
           })
        }


        if(comment.dislikedBy.includes(tokenData._id))
        {
           comment.dislikes -= 1,
           comment.dislikedBy = comment.dislikedBy.filter(userId => userId != tokenData._id)
        }

           comment.likes += 1,
           comment.likedBy.push(tokenData._id)

           await video.save()

           res.status(200).json({
            likes : comment.likes,
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


const unlike = async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const commentId = req.params.commentId

        const comment = await Video.findById(commentId)

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

           return res.status(500).json({
            dislikes:comment.dislikes,
            comment:comment
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


module.exports = {addComment,
    getAllComment,
    like,
    unlike
}