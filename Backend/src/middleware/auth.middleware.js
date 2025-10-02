import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken"

async function authMiddleware(req,res,next){

    const token = req.cookies.token

    if(!token){
       return res.status(401).json({
            mess:"Unauthorised"
        })
    }

    try{

        const decoded = jwt.verify(token,process.env.JWT_SECRET) //it will give the data which was given while making the token (ie:id here) and if wrong token then will throw and error

        const user = await userModel.findById(decoded.userId)

         if (!user) {
         return res.status(401).json({ mess: "User not found" });
        }
        // console.log(user);
        req.user = user
        next()
        
    }catch(err){
        res.status(401).json({
            "mess":"unauthorised, login first"
        })
    }

}

export {authMiddleware}