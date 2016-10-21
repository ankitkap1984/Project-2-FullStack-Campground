var mongo       =   require("mongoose"),
    passLocal   =   require("passport-local-mongoose");

var userSchema=new mongo.Schema({
    username:String,
    password:String
});

userSchema.plugin(passLocal);

module.exports=mongo.model("user",userSchema);