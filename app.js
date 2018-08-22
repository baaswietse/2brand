var express = require("express"),
    bodyParser = require("body-parser") ,
    mongoose = require('mongoose'),
    moment = require("moment-timezone"),
    methodOverride  = require("method-override"),
    newpostmail = require("./newpostmail"),
    User = require("./models/user"),
    Post = require("./models/post"),
    Partner = require("./models/partner")


var app= express()
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(__dirname + "/public"))      //links to the css folder
app.use(methodOverride("_method"))  

mongoose.connect("mongodb://baaswietse:W942018d@ds125352.mlab.com:25352/2brand", { useNewUrlParser: true })


//================POSTS====================
app.get("/", function(req, res){
    res.redirect("/posts")  
})
//SHOW
app.get("/posts", function(req, res){
    Partner.find({}).populate("posts").exec(function(err, partners){
        if(err){
            console.log(err)
        }else{
            res.render("posts.ejs",{partners: partners})
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
    Partner.findOne({name: req.body.partner}, function(err, foundPartner){
        if(err){
            console.log(err)
        }else{
            var currentTime = moment().tz("Europe/Paris").format('DD/MM/YYYY HH:mm:ss ')
            var newPost = {instaname: req.body.instaname, partner: req.body.partner, tijdstip: currentTime, email: req.body.email, link: req.body.link, voordeel: req.body.voordeel}
            Post.create(newPost, function(err, newPost){
                if(err){
                    console.log(err)
                    res.redirect("back")
                }else{
                    foundPartner.posts.push(newPost)
                    foundPartner.save()
                    //newpostmail({instaname: req.body.instaname, partner: req.body.partner, tijdstip: currentTime, email: req.body.email, link: req.body.link, voordeel: req.body.voordeel}) //sends us a mail, see newpostmail file
                    res.redirect("/posts")
                }
            })
        }
    })
})

//UPDATE status
app.put("/posts/:id/status", function(req,res){
    Post.findById(req.params.id, function(err, foundPost) {
        if(err){
            console.log(err)
        }else{
            var newstatus;
            if(foundPost.status){
                newstatus = false
            }else{
                newstatus = true
            }
            Post.findByIdAndUpdate(req.params.id, {status: newstatus} ,function(err, updatedPartner){
                if(err){
                    console.log(err)
                }else{
                    res.redirect("/posts")
                }
            })
        }
    })
})


//DESTROY
app.delete("/posts/:id",function(req,res){
    Partner.update({},{$pull : {posts: req.params.id}}, function(){ //delete the id from the partners DB
        Post.findByIdAndRemove(req.params.id, function(err){
            if(err){
                console.log(err)
            }else{  
                console.log("deleted")
                res.redirect("/posts")
            }
        })
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


//EDIT
app.get("/partners/:id/edit", function(req, res){
    Partner.findById(req.params.id,function(err, foundPartner) {
        if(err){
            console.log(err)
        }else{
            res.render("editpartner.ejs", {partner: foundPartner})
        }
    })
    
})


//UPDATE
app.put("/partners/:id", function(req,res){
    Partner.findByIdAndUpdate(req.params.id, req.body.partner ,function(err, updatedPartner){
        if(err){
            res.redirect("back")
        }else{
            res.redirect("/partners")
        }
    })
})

//DESTROY
app.delete("/partners/:id",function(req,res){
    Partner.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err)
        }else{  
            console.log("deleted")
            res.redirect("/posts")
        }
    })
})





app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The YelpCamp Server Has Started!")
})
