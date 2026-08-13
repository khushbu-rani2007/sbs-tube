require('dotenv').config()
const User = require('../models/User')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cloudinary = require('../config/cloudinary')

const signup = async (req, res) => {
    try {
        const user = await User.find({ email: req.body.email })
        if (await user.length > 0) {
            return res.status(404).json({
                error: "Email already registered"
            })
        }

        const hash = await bcrypt.hash(req.body.password, 10)

        const newUser = new User({
            channelName: req.body.channelName,
            email: req.body.email,
            description: req.body.description,
            password: hash,

        })

        const result = await newUser.save()
        res.status(200).json({
            success: "Account Created",
            data: {
                _id: result._id,
                channelName: result.channelName
            }
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}


const login = async (req, res) => {
    try {
        const user = await User.find({ email: req.body.email })
        if (user.length == 0) {
            return res.status(400).json({
                error: "Channel doesn't exist, signup now!"
            })
        }

        const isMatch = await bcrypt.compare(req.body.password, user[0].password)
        if (!isMatch) {
            return res.status(500).json({
                error: "Invalid Password"
            })
        }

        const token = await jwt.sign({
            _id: user[0]._id,
            email: user[0].email,
            channelName: user[0].channelName
        },
            process.env.SEC_KEY,
            {
                expiresIn: '365d'
            })

        res.status(200).json({
            channelName: user[0].channelName,
            channelId: user[0]._id,
            token: token
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

const subscriber = async (req, res) => {
    try {
        const channelId = req.params.channelId
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)
        console.log(tokenData)

        const user = await User.findById(tokenData._id)

        if (channelId == tokenData._id) {
            res.status(500).json({
                error: "You can't subscribe yourself!"
            })
        }

        const channel = await User.findById(channelId)
        if (!channel) {
            return res.status(500).json({
                error: "Channel not found!"
            })
        }

        if (channel.subscriber.includes(tokenData._id)) {
            return res.status(500).json({
                error: "Already Subscribed..."
            })
        }


        channel.subscriber.push(user._id)
        user.subscribedTo.push(channel._id)

        await channel.save()
        await user.save()

        res.status(200).json({
            success: "Subscribed"
        })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}



//-----------------------unSubscribe-------------------------

const unsubscribe = async (req, res) => {
    try {
        const channelId = req.params.channelId
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const user = await User.findById(tokenData._id)

        if (channelId == tokenData._id) {
            res.status(500).json({
                error: "You can't unsubscribe yourself!"
            })
        }

        const channel = await User.findById(channelId)
        if (!channel) {
            return res.status(500).json({
                error: "Channel not found!"
            })
        }

        if (!channel.subscriber.includes(tokenData._id)) {
            return res.status(500).json({
                error: "Already Unsubscribed..."
            })
        }

        channel.subscriber = channel.subscriber.filter(userId => { userId != user._id })
        user.subscribedTo = user.subscribedTo.filter(userId => { userId != channel._id })

        await channel.save()
        await user.save()

        res.status(200).json({
            success: "Unubscribed"
        })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

const profilePic = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const user = await User.findById(tokenData._id)

        if(user.profilPicUrl)
        {
            const dest = await cloudinary.uploader.destroy(user.profilPicId)
            console.log("Last image deleted..")
        }

        if (!req.files || !req.files.profilePic) {
            return res.status(500).json({
                error: "File not found!"
            })
        }

        const uploadedResult = await cloudinary.uploader.upload(req.files.profilePic.tempFilePath, {
            folder: '/youtube/profilePics'
        })

        console.log(uploadedResult)

        user.profilePicId = uploadedResult.public_id,
        user.profilePicUrl = uploadedResult.secure_url

        const result = await user.save()

        res.status(200).json({
            success: "Profile image uploaded successfully...",
            user: user
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}


const coverPic = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const user = await User.findById(tokenData._id)

        if(user.coverPicUrl)
        {
            const dest = await cloudinary.uploader.destroy(user.coverPicId)
        }

        if (!req.files || !req.files.coverPic) {
            return res.status(500).json({
                error: "File not found!"
            })
        }

        const uploadedResult = await cloudinary.uploader.upload(req.files.coverPic.tempFilePath, {
            folder: '/youtube/coverPics'
        })

            user.coverPicId = uploadedResult.public_id,
            user.coverPicUrl = uploadedResult.secure_url

        const result = await user.save()

        res.status(200).json({
            success: "Profile image uploaded successfully...",
            user: user
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}


const findChannel = async(req,res)=>{
    try
    {
        console.log(req.params.channelId)
        const channelId = req.params.channelId

        const channel = await User.findById(channelId)

        if(!channel)
        {
            return res.status(500).json({
                errorMsg:"Channel not foud"
            })
        }

        res.status(200).json({
            channelDetails:channel
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




module.exports = { signup, login, subscriber, unsubscribe, profilePic, coverPic, findChannel };