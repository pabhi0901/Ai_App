import express from "express"
import {authMiddleware} from "../middleware/auth.middleware.js"
import {createChat,getAllChatofUser} from "../controllers/chat.controller.js"

const router = express.Router()


router.post("/",authMiddleware,createChat)
router.post("/getChats",authMiddleware,getAllChatofUser)


export default router