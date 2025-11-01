import cookieParser from "cookie-parser"
import express from "express"
import cors from "cors"
import path from "path"
/* ROUTES */
import authRoute from "./routes/auth.routes.js"
import chatRoute from "./routes/chat.routes.js"
import messageRoute from "./routes/message.routes.js"
const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({

        origin:["http://localhost:5173",
               process.env.frontendLink
        ],
        credentials:true

}))

app.options("*", cors()); 

/* USING ROUTES */
app.use("/auth",authRoute)
app.use("/chat",chatRoute)
app.use("/messages",messageRoute)


export default app