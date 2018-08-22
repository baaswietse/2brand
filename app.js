var express = require("express"),
    bodyParser = require("body-parser") ,
    mongoose = require('mongoose'),
    moment = require("moment-timezone"),
    methodOverride  = require("method-override"),
    newpostmail = require("./newpostmail"),
    passport = require('passport'),
    LocalStrategy   = require("passport-local"),
    User = require("./models/user"),
    Post = require("./models/post"),
    Partner = require("./models/partner")


var app= express()

//PASPORT CONFIG
app.use(require("express-session")({
    secret: "wietse is de coolste",
    resave: false,
    saveUninitialized : false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
app.use(function(req, res, next){       //custom middleware, that adds the logged in users information to all our routes
    res.locals.currentUser = req.user
    next()
})




app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(__dirname + "/public"))      //links to the css folder
app.use(methodOverride("_method"))  

mongoose.connect("mongodb://baaswietse:W942018d@ds125352.mlab.com:25352/2brand", { useNewUrlParser: true })


//================POSTS====================
app.get("/", function(req, res){
    res.redirect("/posts")  
})
//SHOW
app.get("/posts", isLoggedIn, function(req, res){
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
                    newpostmail({instaname: req.body.instaname, partner: req.body.partner, tijdstip: currentTime, email: req.body.email, link: req.body.link, voordeel: req.body.voordeel}) //sends us a mail, see newpostmail file
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
    
    Post.findById(req.params.id, function(err, post){       //needed to know which partner to remove it from
        if(err){
            console.log(err)
        }else{
            Partner.update({name: post.partner},{$pull : {posts: req.params.id}}, function(){ //delete the id from the partners DB
                post.remove(function(err){  //delete the post from the posts DB
                    if(err){
                        console.log(err)
                    }else{  
                        console.log("deleted")
                        res.redirect("/posts")
                    }
                })
            })
        }
    })
})



//==============PARTNERS==================
//SHOW
app.get("/partners",isLoggedIn, function(req, res){
    Partner.find({}, function(err, allPartners){
        if(err){
            console.log(err)
        }else{
            res.render("partners.ejs",{partners: allPartners})
        }
    })    
})

//NEW
app.get("/partners/new", isLoggedIn, function(req, res){
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
app.get("/partners/:id/edit", isLoggedIn, function(req, res){
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


//==============LOGIN========================
//SHOW
app.get("/login", function(req, res) {
    res.render("login.ejs")
})

//GET
app.post("/login",   passport.authenticate("local", {successRedirect: "/posts",failureRedirect: "/login"})  ,function(req, res){
                                                                                                                                    
});  

//logout
app.get("/logout", function(req, res) {
    req.logout()
    res.redirect("/posts")
})


//============REGISTER========================
//SHOW
//=>UNCOMMENT TO ADD USERS//
/*app.get("/register", function(req,res){
    res.render("register.ejs")
})

//GET
app.post("/register", function(req,res){
    var newUser = new User({username: req.body.username})
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err)
            res.redirect("/register")
        }else{
            console.log("new user:\n", user)   //the new user
            passport.authenticate("local")(req, res, function(){    //log the new user in
                res.redirect("/posts")
            })
            
        }
    })
})*/




function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }else{
        res.redirect("/login")
    }
}

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The Server Has Started!")
})
