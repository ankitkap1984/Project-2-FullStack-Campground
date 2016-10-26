
var mongo    =   require("mongoose");
    
//Schema setup
var commentSchema=new mongo.Schema({
     text: String,
     author:{
          id:{
               type:mongo.Schema.Types.ObjectId,
               ref:"user"
          },
          username:String
     }
});

module.exports=mongo.model("comment",commentSchema);