var express = require("express"),
    bodyParser = require("body-parser") ,
    mongoose = require('mongoose'),
    moment = require("moment-timezone"),
    passport = require('passport'),
    LocalStrategy   = require("passport-local"),
    User = require("./models/user"),
    Post = require("./models/post"),
    Partner = require("./models/partner")


var app= express()
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(__dirname + "/public"))      //links to the css folder

mongoose.connect("mongodb://baaswietse:W942018d@ds125352.mlab.com:25352/2brand", { useNewUrlParser: true })


//================POSTS====================
app.get("/", function(req, res){
    res.redirect("/posts")  
})
//SHOW
app.get("/posts", function(req, res){
    Post.find({}, function(err, allPosts){
        if(err){
            console.log(err)
        }else{
            res.render("posts.ejs",{posts: allPosts})
        }
    })    
})

//NEW
app.get("/posts/new", function(req, res){
    Partner.find({}, function(err, allPartners) {
        if(err){
            console.log(err)
        }else{
            res.render("newpost.ejs", {partners: allPartners})
        }
    })
})

//CREATE
app.post("/posts", function(req, res){
    var currentTime = moment().tz("Europe/Paris").format('DD/MM/YYYY HH:mm:ss ')
    console.log(req.body)
    var newPost = {instaname: req.body.instaname, partner: req.body.partner, tijdstip: currentTime, email: req.body.email, link: req.body.link, voordeel: req.body.voordeel}
    Post.create(newPost, function(err, newPost){
        if(err){
            console.log(err)
            res.redirect("back")
        }else{
            res.redirect("/posts")
        }
    })
})

//==============PARTNERS==================
//SHOW
app.get("/partners", function(req, res){
    Partner.find({}, function(err, allPartners){
        if(err){
            console.log(err)
        }else{
            res.render("partners.ejs",{partners: allPartners})
        }
    })    
})

//NEW
app.get("/partners/new", function(req, res){
    res.render("newpartner.ejs")
})

//CREATE
app.post("/partners", function(req, res){
    var newPartner = {name: req.body.name, voordeel: req.body.voordeel, image: req.body.image}
    Partner.create(newPartner, function(err, newPartner){
        if(err){
            console.log(err)
            res.redirect("back")
        }else{
            res.redirect("/partners")
        }
    })
})







app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The YelpCamp Server Has Started!")
})
