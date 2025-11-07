import userModel from "../models/user.model.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"


async function registerController(req,res){

    try{

        
    const{fullName:{firstName,lastName},email,password} = req.body
    const userAlreadyExist = await userModel.findOne({email})

    if(userAlreadyExist){
       return res.status(400).json({mess:"User already exist with this username"})
    }

    const hashPassword = await bcrypt.hash(password,10)

    const user = await userModel.create({
        fullName:{
            firstName,lastName
        },
        email,
        password:hashPassword
    })

    const token = jwt.sign({userId:user._id},process.env.JWT_SECRET)
    res.cookie("token",token,{
             httpOnly: true,
            sameSite: "lax", //"lax" in case of local host
            secure: false //turn it to false in case of local host
         })

         

    res.status(201).json({
        "mess":"user created succesfully",
        user:{
            emai:user.email,
            _id:user._id,
            fullname:{
                firstName:user.fullName.firstName,
                lastName:user.fullName.lastName
            }
        }
    })
    console.log("Logged in success");
    
    }catch(err){
        console.log("Error occoured while creating user, ",err);
        res.json({
            "mess":"Some error occoured while registering the user (its from our side)"
        })  
    }

}

async function loginController(req,res){
    console.log("call aa gya bhai");
    const {email,password} = req.body

    const user = await userModel.findOne({
        email
    })

    if(!user){
        return res.status(400).json({
            mess:"Invalid email or password"
        })
    }

    const  isPasswordValid  = await bcrypt.compare(password,user.password)


      if(!isPasswordValid){
        return res.status(400).json({
            mess:"Invalid email or password"
        })
        }
    
        const token = jwt.sign({userId:user._id},process.env.JWT_SECRET)

        res.cookie("token",token,{
             httpOnly: true,
            sameSite: "lax", //lax when localhost
            secure: false //turn it to false in case of local host
         })

    

        res.status(200).json({
            "mess":"user loggedIn succesfully",
            email:user.email,
            fullname:user.fullName
        })
}

export {registerController,loginController}
