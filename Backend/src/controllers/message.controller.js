import messageModel from './../models/message.model.js';


async function getAllMessages(req,res){
    const {chatId}  = req.body
    const messages =   await messageModel.find({
        chat:chatId
    })

    const data = messages.map((val)=>{
        return {
            text:val.content,
            role:val.role
        }
    })
    
    res.status(201).json({
        data
    })
} 

export {getAllMessages}