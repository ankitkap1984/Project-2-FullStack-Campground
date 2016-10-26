var exp         =   require("express"),
    bodyParse   =   require("body-parser"),
    app         =   exp(),
    mongo       =   require("mongoose"),
    flash       =   require("connect-flash"),
    campground  =   require("./models/campground"),//Schema setup
    comment     =   require("./models/comment"),//Schema setup
    seedDB      =   require("./seed"),
    pass        =   require("passport"),
    localStra   =   require("passport-local"),
    methodOver  =   require("method-override"),
    user        =   require("./models/user");//Schema setup
    

app.set("view engine","ejs");
app.use(exp.static("public"));
app.use(bodyParse.urlencoded({extended:true}));
app.use(methodOver("_method"));
app.use(flash());

mongo.connect("mongodb://localhost/yelp_camp");
//seedDB(); //temporary removed initial camp data loads

//PASSPORT CONFIGURATION FOR AUTHENTICATION
app.use(require("express-session")({
    secret:"Rusty is cutest dog",
    resave:false,
    saveUninitialized:false
}));
app.use(pass.initialize());
app.use(pass.session());
pass.use(new localStra(user.authenticate()));
pass.serializeUser(user.serializeUser());
pass.deserializeUser(user.deserializeUser());

//this function is called in every single route to dermine the user name so as to avoid passing currentUser:user to each and every route manually
//kind of global variables
app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    res.locals.errorFlash=req.flash("errorFlash");
    res.locals.successFlash=req.flash("successFlash");
    next();
});
/*campground.create({
    name:"Granite Hill", 
    image:"http://www.photosforclass.com/download/2617191414",
    desc:"This is huge granite hill. Awesomely lovely"
},function(err,campground){if(!err){console.log(campground+"Created");} else{console.log("err");}})*/

/*var campground=[
    {name:"Salmon Creek", image:"http://www.photosforclass.com/download/7626464792"},
    {name:"Granite Hill", image:"http://www.photosforclass.com/download/2617191414"},
    {name:"Mountain Goat", image:"http://www.photosforclass.com/download/5641024448"},
    {name:"Bartons Creek", image:"http://www.photosforclass.com/download/4369518024"},
    {name:"Hill Creek", image:"http://www.photosforclass.com/download/14435096036"},
    {name:"Mountain Goat", image:"http://www.photosforclass.com/download/5641024448"},
    {name:"Bartons Creek", image:"http://www.photosforclass.com/download/4369518024"},
    {name:"Hill Creek", image:"http://www.photosforclass.com/download/14435096036"}
    ];*/

//landing page
app.get("/",function(req,res){
    res.render("landing")
});

//campground get INDEX GET route
app.get("/campground",function(req,res){
    
    campground.find({}, function(err,AllCampground){
        if(err)
        {
            console.log("read err");
            
        }
        else
        {
        res.render("index",{campground:AllCampground, currentUser:req.user});
            
        }
    })
});

//campground CREATE - post route
app.post("/campground",isLoggedIn,function(req,res){
    
    var NewCampValue=req.body.NewCamp;
    var NewCampImageVal=req.body.NewCampImage;
    var NewDescVal=req.body.NewDesc;
    var authorVal={
      id:req.user._id,
      username:req.user.username
    };
    var makeNewCampgroundObject={name: NewCampValue, image: NewCampImageVal, desc: NewDescVal, author:authorVal};
    //campground.push(makeNewCampgroundObjectTopushIntoArray);
    campground.create(makeNewCampgroundObject, function(err, makeNewCampgroundObjectVal){
        if(err)
        {
            console.log("Error creating new campground")
        }
        else
        {
            req.flash("successFlash","Campground created sucessfully!");
            res.redirect("/campground");        
        }
    })
    
});

//NEW - GET ROUTE FOR FORM campground
app.get("/campground/new",isLoggedIn,function(req,res){
    //find the campground with provided id parameters and show details about that campground
    
    res.render("newCampground");
});

//SHOW - GET ROUTE FOR SHOWING DETAILS OF SINGLE CAMP GROUNDS
app.get("/campground/:id", function(req,res){
    campground.findById(req.params.id).populate("linkcommenttocamp").exec(function(err,foundCampground){
        var idValue=req.params.id;
        //console.log("idValue > "+idValue);
        //console.log("err present is > "+err);
        if(err){
            console.log(idValue + "Err id not found");
        }
        else{
            //console.log("in show " +foundCampground);
            res.render("show",{camp:foundCampground});        
           //res.send("value is " + req.params.id + "foundcamp is " + foundCampground)
           
        }
    })
    
});

//=================================================================
//start comments route which are nested routes child of campgrounds

//new comments - show form
app.get("/campground/:id/comment/new",isLoggedIn,function(req,res){
    //find campground by id
    campground.findById(req.params.id,function(err,campground){
        if(err){console.log("error while finding id during comments form route")}
        else{console.log(campground);
            res.render("newcomment",{camp:campground});
        }
    })
    
});

app.post("/campground/:id/comment",isLoggedIn,function(req,res){
    //lookup campground using id
    campground.findById(req.params.id,function(err,campground){
        if(err){console.log("error while finding id during comments post route")}
        else{
             //create new comment
             comment.create(req.body.comment,function(err,comment){
                 if(err){console.log("error while creating comment during comments post route")}
                 else{
                      //link comment to tha tcampground id
                      //console.log("New comment user name is " + req.user.username);
                      comment.author.id=req.user._id;
                      comment.author.username=req.user.username;
                      comment.save();
                      campground.linkcommenttocamp.push(comment);
                      campground.save();
                        //redirect to campground showpage
                        req.flash("successFlash","Sucessfully posted comment!");
                        res.redirect("/campground/"+campground._id);
                 }
             });
           
        };
    });
   
});
//=================================================================

//auth-routes
app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register",function(req,res){
    var newUser=new user({username:req.body.username});
    user.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("errorFlash",err.message);
            
            res.redirect("/register");
        }
        else{
            pass.authenticate("local")(req,res,function(){
                req.flash("successFlash","Welcome " +req.body.username +"! You are sucessfully registered!");
               res.redirect("/campground");
            });
        }
    });
});

//login form
app.get("/login",function(req,res){
    res.render("login");
});

app.post("/login",
        pass.authenticate("local",{successRedirect:"/campground", failureRedirect:"/login"}),
        function(req,res){
            
});

//logout route
app.get("/logout",function(req,res){
    req.flash("successFlash","You are logged out!");
    req.logout();
    res.redirect("/");
});

//edit campground route
app.get("/campground/:id/edit", checkCampgroundOwnership, function(req,res){
             campground.findById(req.params.id, function(err, campground){
             res.render("editCampground",{camp:campground});
    });
});


//update campground route
app.put("/campground/:id",checkCampgroundOwnership, function(req,res){
   //find and update correct campground

   var updatedValues={ name:req.body.name,image:req.body.image, desc:req.body.desc}
   //console.log("Passed updatedValues" + updatedValues);
   campground.findByIdAndUpdate(req.params.id, updatedValues, function(err, campground){
       if(err){console.log("Error in post request for Edit")}
       else{
           //redirect
           //console.log("Updated camp " + campground);
           req.flash("successFlash","Campground Updated!");
           res.redirect("/campground/"+req.params.id);
       }
   })
   
});

//delete campground
app.delete("/campground/:id",checkCampgroundOwnership, function(req,res){
    campground.findByIdAndRemove(req.params.id,function(err){
       if(err){console.log("Unable to Delete campground");}
       else{
           req.flash("successFlash","Campground Deleted!");
           res.redirect("/campground");}
    });
});



// COMMENT EDIT ROUTE
app.get("/campground/:id/comment/:comment_id/edit",checkCommentOwnership, function(req, res){
   comment.findById(req.params.comment_id, function(err, foundComment){
      if(err){
          
          res.redirect("back");
      } else {
        res.render("editComment", {campground_id: req.params.id, comment: foundComment});
      }
   });
});

// COMMENT UPDATE
app.put("/campground/:id/comment/:comment_id",checkCommentOwnership,  function(req, res){
   comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err){
          res.redirect("back");
      } else {
          req.flash("successFlash","Comments Updated!");
          res.redirect("/campground/" + req.params.id );
      }
   });
});

// COMMENT DESTROY ROUTE
app.delete("/campground/:id/comment/:comment_id", checkCommentOwnership , function(req, res){
    //findByIdAndRemove
    comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           console.log("Error deleting comments");
       } else {
           req.flash("successFlash","Comments Deleted!");
           res.redirect("/campground/" + req.params.id);
       }
    });
});


//middlewares
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        req.flash("errorFlash","You need to be logged in to do that!");
        res.redirect("/login");
    }
};

function checkCampgroundOwnership(req,res,next){
     if(req.isAuthenticated()){
             campground.findById(req.params.id, function(err, campground){
               if(err){console.log("Error while finding/deleting/updating campground")}
               else{
                           //does the user own the campground ?
                           //console.log(campground.author.id);
                           //console.log(req.user._id);
                           if(campground.author.id.equals(req.user._id)){
                               next();
                           }
                           else{
                               req.flash("errorFlash","Permission denied!");
                               res.redirect("back");
                           }
                    }
                });
    }
    else{
        req.flash("errorFlash","You need to log in first!");
        res.redirect("/login");
        
    }
};

function checkCommentOwnership(req, res, next){
 if(req.isAuthenticated()){
        comment.findById(req.params.comment_id, function(err, foundComment){
           if(err){
               res.redirect("back");
           }  else {
               // does user own the comment?
            if(foundComment.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash("errorFlash","Permission denied!");
                res.redirect("back");
            }
           }
        });
    } else {
        req.flash("errorFlash","You need to log in first!");
        res.redirect("/login");
    }
};

//listen
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Yelpcamp server has started");
});