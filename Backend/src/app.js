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
        "https://ai-app-1fql-fgs68r23v-abhishek-pandeys-projects-2158b081.vercel.app"],
        credentials:true

}))

/* USING ROUTES */
app.use("/auth",authRoute)
app.use("/chat",chatRoute)
app.use("/messages",messageRoute)


export default app