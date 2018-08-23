var mongoose = require('mongoose')


//Template SETUP FOR DB
var partnerSchema = new mongoose.Schema({
    name: String,
    voordeel: String,
    image: String,
    codes: {
        voorstuk: String,
        geclaimd: [String],
        ongeclaimd: [String]
    },
    posts: [
      {
         type: mongoose.Schema.Types.ObjectId,      //just embed the reference to the comment
         ref: "Post"                             //name of the model
      }]
})

var Partner = mongoose.model("Partner", partnerSchema)         //DB object, creates collection "campgrounds" in the the "yelp_camp" database, name is refractored

module.exports = Partner