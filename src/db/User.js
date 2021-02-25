const connection = require("./connection")

module.exports = connection.model('User', {
    firstname:String,
    lastname:String,
    email:{type:String,required:true,unique:true},
    avatar:{type:String,required:true}
})