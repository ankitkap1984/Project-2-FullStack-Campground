var mongo    =   require("mongoose"),
    campground  =   require("./models/campground"),
    comment  =   require("./models/comment");

var initialData=[
    {
    name:"Awesome Camp",
    image:"http://www.photosforclass.com/download/9586943706",
    desc:"There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc."
    },
    {
    name:"Fall Camp",
    image:"http://www.photosforclass.com/download/5518252117",
    desc:"There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc."
    },
    {
    name:"Plain Camp",
    image:"http://www.photosforclass.com/download/4475243824",
    desc:"There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc."
    },
    {
    name:"Rabbit Camp",
    image:"http://www.photosforclass.com/download/3557463725",
    desc:"There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc."
    }
    ];

function seedDB(){
    //remove all campgrounds and comments
    comment.remove({},function(err){
        if(err){console.log("errorwhile removing comments")};
    });
    
campground.remove({},function(err){
        if(err){console.log(err);}
        else{console.log("removed camp");};
             //add new campgrounds for initial dada load
            initialData.forEach(function(initialDataValue){
            campground.create(initialDataValue,function(err,campground){
                if(err){console.log("err");}
                else{console.log(campground);};
                        //add comments here
                        comment.create({
                           text: "This is really a great place",
                           author:"Anki"
                        },function(err,comment){
                            comment.save();
                            if(err){console.log("Err while creating comments");}
                            else{
                                campground.linkcommenttocamp.push(comment);
                                campground.save();
                                //console.log(comment);
                                }
                        });
            });
    });
    });
    
};

module.exports=seedDB;