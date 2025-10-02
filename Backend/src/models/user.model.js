import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    fullName:{
        firstName:{
            type:String,
            required:true
        },
         lastName:{
            type:String,
            required:true
        }
    },

    password:{
        type:String
    }

},
{
    timestamps:true //it keeps the record of time when the user was created or updated last time
})

const userModel = mongoose.model("users",userSchema)

export default userModel