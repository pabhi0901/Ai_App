import chatModel from "../models/chat.model.js";

async function createChat(req,res){

    const {title} = req.body;
    const user = req.user;
    console.log(user);
    
    const chat = await chatModel.create({
        user:user._id,
        title
    });

    res.status(201).json({
        "mess":"Chat created succesully",
        chat:{
            _id:chat._id,
            title:chat.title,
            lastActivity:chat.lastActivity,
            user:chat.user
        }
    })

}

async function getAllChatofUser(req,res){

    let user = req.user._id
    
    const allChat = await chatModel.find({
        user
    })

    let chat = allChat.map((val)=>{
       return { 
        _id:val._id,
        title:val.title
    }
    })

    chat = chat.reverse()
    console.log(chat);
    
    res.status(201).json({
        chat
    })

}

export {createChat,getAllChatofUser}