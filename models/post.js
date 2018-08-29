var mongoose = require('mongoose')


//Template SETUP FOR DB
var postSchema = new mongoose.Schema({
    instaname: String,
    link: String,
    email: String,
    voordeel: String,
    tijdstip: String,
    partner: String,
    likes: {
        type: String,
        default: ""
    },
    followers: {
        type: String,
        default: ""
    },
    image: String,
    code: {
        type: String,
        default: ""
    },
    status: {
        type: Boolean,
        default: false
    }
})

var Post = mongoose.model("Post", postSchema)         //DB object, creates collection "campgrounds" in the the "yelp_camp" database, name is refractored

module.exports = Post