var express = require("express"),
    bodyParser = require("body-parser") ,
    mongoose = require('mongoose'),
    moment = require("moment-timezone"),
    methodOverride  = require("method-override"),
    flash = require("connect-flash"),
    sendmail = require("./sendmail"),
    passport = require('passport'),
    LocalStrategy   = require("passport-local"),
    User = require("./models/user"),
    Post = require("./models/post"),
    Partner = require("./models/partner")


var app= express()
app.use(flash())


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
    res.locals.succes= req.flash("succes")
    res.locals.error= req.flash("error")
    next()
})




app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(__dirname + "/public"))      //links to the css folder
app.use(methodOverride("_method"))  

//console.log(process.env.DATABASEURL)
mongoose.connect("mongodb://baaswietse:W942018d@ds125422.mlab.com:25422/2branddev", { useNewUrlParser: true })     //DEPLOYMENT DB: "mongodb://baaswietse:W942018d@ds125352.mlab.com:25352/2brand"
                                                                        //DEVELOPMENT DB: "mongodb://baaswietse:W942018d@ds125422.mlab.com:25422/2branddev"

//================POSTS====================
app.get("/", function(req, res){
    res.redirect("/posts")  
})
//SHOW
app.get("/posts", isLoggedIn, function(req, res){
    Partner.find({}).populate("posts").exec(function(err, allPartners){
        if(err){
            req.flash("error", "ERROR - ask your boy Wietse")
            console.log(err)
            res.redirect("back")
        }else{
            res.render("posts.ejs",{partners: allPartners})
        }
    })
})

//NEW
app.get("/posts/new", function(req, res){
    Partner.find({}, function(err, allPartners) {
        if(err){
            req.flash("error", "Er is iets fout gegaan! neem aub contact op met ons.")
            console.log(err)
            res.redirect("https://www.2brand.be")
        }else{
            res.render("newpost.ejs", {partners: allPartners})
        }
    })
})

//CREATE
app.post("/posts", function(req, res){
    Partner.findOne({name: req.body.partner}, function(err, foundPartner){
        if(err){
            req.flash("error", "Er is iets fout gegaan! neem aub contact op met ons.")
            console.log(err)
            res.redirect("back")
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
                    sendmail.notification(newPost) //sends us a mail, see sendmail file
                    sendmail.confirm(newPost)
                    req.flash("succes", "Je post is succesvol opgestuurd! Houd je mailbox zeker in het oog, en vergeet niet bij spam te checken. Binnen de 24u ontvangt u het voordeel van ons!")
                    res.redirect("/posts/new")
                }
            })
        }
    })
})

//UPDATE status
app.put("/posts/:id/status", function(req,res){
    Post.findById(req.params.id, function(err, foundPost) {
        if(err){
            req.flash("error", "ERROR - ask your boy Wietse")
            console.log(err)
            res.redirect("back")
        }else{
            if(!foundPost.status){  //als er nog geen mail gestuurd is => iupdate de status
                Partner.findOne({voordeel: foundPost.voordeel}, function(err, foundPartner) {//selecteer de partner op basis van gekozen voordeel
                    if(err){
                        req.flash("error", "ERROR - ask your boy Wietse")
                        console.log(err)
                        res.redirect("back")
                    }else{
                        var code = foundPartner.codes.ongeclaimd[0] //Neem de eerste code
                        if(code == null){   //als de code niet bestaat, er dus geen zijn
                            req.flash("error", "Er zijn geen codes meer beschikbaar voor " + foundPartner.name)
                        }else{
                            
                            
                            foundPartner.codes.geclaimd.push(code)      //Verplaats de code van geclaimd naar ongeclaimd
                            foundPartner.codes.ongeclaimd.pull(code)
                            foundPartner.save()
                            
                            foundPost.status= true
                            foundPost.code = code
                            foundPost.save()
      
                            sendmail.code(foundPost)
                            
                            req.flash("succes", 'De code "'+ code +'" is verzonden naar ' + foundPost.email)
                        }
                        res.redirect("back")
                    }
                })
            }
        }
    })
})


//UPDATE likes
app.put("/posts/:id/likes", function(req, res) {
    Post.findById(req.params.id, function(err, foundPost) {
        if(err){
            console.log(err)
        }else{
            foundPost.likes = req.body.likes
            foundPost.save()
            res.redirect("back")
        }
    })
})

//UPDATE followers
app.put("/posts/:id/followers", function(req, res) {
    Post.findById(req.params.id, function(err, foundPost) {
        if(err){
            console.log(err)
        }else{
            foundPost.followers = req.body.followers
            foundPost.save()
            res.redirect("back")
        }
    })
})

//UPDATE image
app.put("/posts/:id/image", function(req, res) {
    Post.findById(req.params.id, function(err, foundPost) {
        if(err){
            console.log(err)
        }else{
            foundPost.image = req.body.image
            foundPost.save()
            res.redirect("back")
        }
    })
})


//DESTROY
app.delete("/posts/:id",function(req,res){
    Post.findById(req.params.id, function(err, post){       //needed to know which partner to remove it from
        if(err){
            req.flash("error", "ERROR - ask your boy Wietse")
            console.log(err)
            res.redirect("back")
        }else{
            Partner.update({name: post.partner},{$pull : {posts: req.params.id}}, function(){ //delete the id from the partners DB
                post.remove(function(err){  //delete the post from the posts DB
                    if(err){
                        req.flash("error", "ERROR - ask your boy Wietse")
                        console.log(err)
                    }else{  
                        req.flash("error", "Post is succesvol verwijderd!")
                        res.redirect("/posts")
                    }
                })
            })
        }
    })
})



//==============PARTNERS==================
//SHOW ALL
app.get("/partners",isLoggedIn, function(req, res){
    Partner.find({}, function(err, allPartners){
        if(err){
            req.flash("error", "ERROR - ask your boy Wietse")
            console.log(err)
            res.redirect("back")
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
    Partner.create(req.body.partner, function(err, newPartner){
        if(err){
            req.flash("error", "ERROR - ask your boy Wietse")
            console.log(err)
            res.redirect("back")
        }else{
            req.flash("succes", newPartner.name +" is toegevoegd!")
            res.redirect("/partners")
        }
    })
})


//SHOW SINGLE
app.get("/partners/:id", function(req, res) {
    Partner.findById(req.params.id).populate("posts").exec(function(err, foundPartner){
        //console.log(foundPartner)
        if(err){
            req.flash("error", "ERROR - ask your boy Wietse")
            console.log(err)
            res.redirect("back")
        }else{
            var berijk = {totalFollowers: 0 , totalLikes: 0}
            //sum of the followers of a user that made a post
            for(var i = 0; i < foundPartner.posts.length; i ++){
                if(foundPartner.posts[i].followers){
                   console.log(foundPartner.posts[i].followers)
                    berijk.totalFollowers += parseInt(foundPartner.posts[i].followers) 
                }
                if(foundPartner.posts[i].likes){
                    berijk.totalLikes += parseInt(foundPartner.posts[i].likes)
                }
            }
            //Satistic 'berijk'
            berijk.berijkEquivalent = Math.floor(berijk.totalLikes *5 + berijk.totalFollowers *0.5)
            console.log(berijk)
            res.render("partner.ejs", {partner: foundPartner, berijk: berijk})
        }
    })
})




//EDIT
app.get("/partners/:id/edit", isLoggedIn, function(req, res){
    Partner.findById(req.params.id,function(err, foundPartner) {
        if(err){
            req.flash("error", "ERROR - ask your boy Wietse")
            console.log(err)
            res.redirect("back")
        }else{
            res.render("editpartner.ejs", {partner: foundPartner})
        }
    })
    
})


//UPDATE - partner zelf
app.put("/partners/:id", function(req,res){
    Partner.findByIdAndUpdate(req.params.id, req.body.partner ,function(err, updatedPartner){
        if(err){
            req.flash("error", "ERROR - ask your boy Wietse")
            console.log(err)
            res.redirect("back")
        }else{
            req.flash("succes", updatedPartner.name + " is updated!")
            res.redirect("/partners")
        }
    })
})

//DESTROY
app.delete("/partners/:id",function(req,res){
    Partner.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash("error", "ERROR - ask your boy Wietse")
            console.log(err)
            res.redirect("back")
        }else{  
            req.flash("error", "Partner deleted!")
            res.redirect("/posts")
        }
    })
})

//UPDATE - codes toevoegen
app.put("/partners/:id/addcodes", function(req, res) {
    Partner.findById(req.params.id, function(err, foundPartner){
        if(err){
            req.flash("error", "ERROR - ask your boy Wietse")
            console.log(err)
            res.redirect("back")
        }else{
            var aantalCodes = parseInt(req.body.aantalCodes)
            var possible = "123456789AZERTYUOPMLKHGFDSQWXCVBN";
            for(var i = 0; i < aantalCodes; i ++){
                var code = ""
                for(var j = 0; j < 4; j ++){
                    code += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                foundPartner.codes.ongeclaimd.push(foundPartner.codes.voorstuk + code)
            }
            foundPartner.save()
            req.flash("succes", "Er zijn " + aantalCodes + " codes gegenereerd voor " + foundPartner.name)
            res.redirect("back")
        }
    })
})

//UPDATE - status aanpassen
app.put("/partners/:id/status", function(req, res) {
    console.log(req.body.status)
    Partner.findById(req.params.id, function(err, foundPartner) {
        if(err){
            console.log(err)
        }else{
            if(req.body.status === "NIET ACTIEF"){
                foundPartner.status = true
                foundPartner.save()
            }else if(req.body.status === "ACTIEF"){
                foundPartner.status = false
                foundPartner.save()
            }
            res.redirect("back")
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
    req.flash("succes", "Logged out")
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


app.route('/*').get(function(req, res) {
    req.flash("error","Unknown Url")
    res.redirect("/");
});

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
