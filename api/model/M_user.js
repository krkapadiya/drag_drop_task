const mongoose=require('mongoose');

const userschema=new mongoose.Schema({
    user_name:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    order:{
        type:Number,
        default:0
    },
    user_order:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    }
},{timestamps:true})

module.exports=mongoose.model('users',userschema);