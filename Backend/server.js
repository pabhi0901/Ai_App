import dotenv from "dotenv"
dotenv.config()
import app from "./src/app.js"
import connectToDb from "./src/db/db.js"

// setting up express and socket.io server
import { createServer } from "http";
import initSocketServer from "./src/sockets/socket.server.js"
const httpServer = createServer(app);

initSocketServer(httpServer)
httpServer.listen(5000,()=>{
    console.log("Server is running at 5000 port");
});


connectToDb()

