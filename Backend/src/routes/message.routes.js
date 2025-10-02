import  express  from 'express';
import { getAllMessages } from '../controllers/message.controller.js';
let router = express.Router()

router.post("/",getAllMessages)

export default router