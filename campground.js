
var mongo    =   require("mongoose");
    
//Schema setup
var campgroundSchema=new mongo.Schema({
    name:String,
    image:String,
    desc:String,
    author:{
          id:{
               type:mongo.Schema.Types.ObjectId,
               ref:"user"
          },
          username:String
     },
    linkcommenttocamp:[{type: mongo.Schema.Types.ObjectId, ref:"comment"}]
});

module.exports=mongo.model("Campground",campgroundSchema);