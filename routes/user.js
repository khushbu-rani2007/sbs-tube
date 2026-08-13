const express = require('express')
const Router = express.Router()
const { signup,login,subscriber,unsubscribe,profilePic,coverPic,findChannel } = require('../controller/userController')

Router.post('/signup',signup)
Router.post('/login',login)
Router.put('/subscribe/:channelId',subscriber)
Router.put('/unsubscribe/:channelId',unsubscribe)
Router.put('/profilepic',profilePic)
Router.put('/coverpic',coverPic)
Router.get('/findchannel/:channelId',findChannel)

module.exports = Router;