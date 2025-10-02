import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    chat:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"chats"
    },
    content:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["user","model","system"], //it creates a limitation that role can only be "user" or "model" or "system"
        default:"user"
    }
},{
    timestamps:true
})

const messageModel = mongoose.model("message",messageSchema)

export default messageModel