var mongoose = require("mongoose")
var passportLocalMongoose = require('passport-local-mongoose')

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    admin: {
            type: Boolean,
            default: false
        },
    partner: 
      {
         type: mongoose.Schema.Types.ObjectId,      //just embed the reference to the comment
         ref: "Partner"                             //name of the model
      }
})

UserSchema.plugin(passportLocalMongoose)            //adds the methods to our user

module.exports = mongoose.model("user", UserSchema)