const express = require('express')
const Router = express.Router()
const { upload,like,unlike,videoById,allVideo,videosByChannelId } = require('../controller/videoController')

Router.post('/upload',upload)
Router.put('/like/:videoId',like)
Router.put('/dislike/:videoid',unlike)
Router.get('/videobyid/:videoid',videoById)
Router.get('/allvideo',allVideo)
Router.get('/allvideo/channelid',videosByChannelId)

module.exports = Router;