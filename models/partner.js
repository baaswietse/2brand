var mongoose = require('mongoose')


//Template SETUP FOR DB
var partnerSchema = new mongoose.Schema({
    name: String,
    voordeel: String,
    image: String,
    
})

var Partner = mongoose.model("Partner", partnerSchema)         //DB object, creates collection "campgrounds" in the the "yelp_camp" database, name is refractored

module.exports = Partner