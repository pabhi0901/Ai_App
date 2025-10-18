import { Server } from "socket.io";
import cookie from "cookie"
import jwt from "jsonwebtoken"
import userModel from "../models/user.model.js";
import {generateContent,generateVector} from "../services/ai.service.js"
import messageModel from "../models/message.model.js";
import {createMemory,queryMemory} from "../services/vector.service.js"
import cors from "cors"
import mongoose from "mongoose";
function initSocketServer(httpServer){

const io = new Server(httpServer,{
      cors: {
    origin: "http://localhost:5173", // your frontend URL
    credentials: true,              // allow cookies/auth headers
  }
});

//here making a middleware to check first wheather user is logged in or not, after that we will we will decide wheather to make a connection or not

io.use(async(socket,next)=>{

    

    const cookies = cookie.parse(socket.handshake.headers?.cookie || "")

    if(cookies.isPrivate=="true"){
        socket.a=0
        return next() 
    }
    console.log("normal hai");
    

    if(!cookies.token){
        next(new Error('Authentication error: no token provided'))
    }

    try{

        const decoded = jwt.verify(cookies.token,process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.userId)
        socket.user = user
        
        
        next()

    }catch(err){

        next(new Error('Authentication err: No tokens provided'))
    }


})

io.on("connection",async(socket)=>{
        
        socket.on("ai-message",async(messagePayload)=>{

            console.log(socket.user);
            
            //saving userMessage in DB and getting vector for it at same time
            const [userMessage,vector] = await Promise.all([

            //saving usermessage in database
            messageModel.create({
            user:socket?.user?._id,
            chat:messagePayload.chat,
            content:messagePayload.content,
            role:"user"
            }),

            //generating vector from gemini (for user message)
            generateVector(messagePayload.content)

            ])

            
            //first we will reterive the messages user have asked (or ai responded) earlier related to the current questions then we will save our new message
            const memory = await queryMemory({
                queryVector: vector,
                limit:5,
                metadata:{
                    user: socket.user._id.toString()
                }
            })

        

         
         //saving userMessage in pinecone and also for short term memory, getting history from db   
            let [userMessageVector,chatHistory] = await Promise.all([

                   //saving the userMessage (vector form) in pinecone database
             createMemory({vector,
                messageId:userMessage._id,
                metadata:{
                    chat:messagePayload.chat,
                    user:socket.user._id,
                    text:messagePayload.content
                }
            }),


            //for short term memory, getting all the chat history on basis of chatId
             messageModel.find({
                chat:messagePayload.chat
            })
            .sort({createdAt:-1})
            .limit(20)
            .lean()
            
        ])

        chatHistory = chatHistory.reverse()
            

            //for short term memory we have to send the chats everytime and gemini takes it in certain format only so we have to make it in a modify chatHistory array in that way, because it also contains some details which is not required here
            let stm = chatHistory.map((item)=>{
                return ({
                    role:item.role,
                    parts:[{text:item.content}]
                })
            }) //stm:- short term memory


            
            
            let ltm = [{
                role:"user",
                parts:[
                    {
                        text:`
                        these are some previous messages from the chat, use them to generate response
                        
                        ${memory.map(item=>item.metadata.text).join("\n")}
                        
                        ` //the .join() convert an array into the string 
                    }
                ]
            }]

            //     let a = [...ltm,...stm].forEach((val)=>{
            //     console.log(val);
                
            //   })
            

            //generating response from gemini
            const response = await generateContent([...ltm,...stm],messagePayload.questionType,messagePayload.contextInput)
            console.log(response);

            socket.emit("aiResponse",{
                "response":response
            })


            //gettig the vector of gemini response  
            let responseVector = await generateVector(response)
            
           
          const randomId = new mongoose.Types.ObjectId()

            const [aiMessage,aiMessagePinecone] = await Promise.all([

            //saving the gemini response in mongodb
             messageModel.create({
            user:socket.user._id,
            chat:messagePayload.chat,
            content:response,
            role:"model"
            }),



             createMemory({
                vector:responseVector,
                messageId:randomId,
                metadata:{
                    chat:messagePayload.chat,
                    user:socket.user._id,
                    text:response
                }
            })

            ])



            

        })

        socket.on("ai-temp-message",async(messagePayload)=>{
            console.log('Secret message received:', messagePayload);
            
            // Allow up to 3 messages in secret mode without login
            if(socket.a < 3){

                const question = [
                    {
                        role:"user",
                        parts:[{text:messagePayload.content}]
                    }
                ]
                
                try {
                    const response = await generateContent(question, false, false)
                    socket.emit("tempResponse", response)
                    console.log('Secret response sent:', response);
                    socket.a++
                    console.log('Message count:', socket.a);
                } catch (error) {
                    console.error('Error generating secret response:', error);
                    socket.emit("tempResponse", "Sorry, I'm having trouble processing your message right now.");
                }
                
            } else {
                socket.emit("limitReached", {
                    "message": "Login to continue chatting"
                })
            }

        })
})


}

export default initSocketServer