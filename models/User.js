const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    channelName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    profilePicUrl: {
        type: String,
        default:""
    },
    profilePicId: {
        type: String,
        default:""
    },
    coverPicUrl: {
        type: String,
        default:""
    },
    coverPicId: {
        type: String,
        default:""
    },
    subscriber: [{
        type: mongoose.Types.ObjectId,
        ref: "User"
    }],
    subscribedTo: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User"
        }
    ]
}, { timeStamp: true })


module.exports = mongoose.model("User", userSchema);