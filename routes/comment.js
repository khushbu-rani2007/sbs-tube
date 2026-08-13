const express = require('express')
const Router = express.Router()
const { addComment,getAllComment,like,unlike } = require('../controller/commentController')

Router.post('/addcomment/:videoId',addComment)
Router.get('/getallcomment/:videoId',getAllComment)
Router.put('/like/:commentId',like)
Router.put('/dislike/:commentId',unlike)

module.exports = Router;