import mongoose from "mongoose"

async function connectToDb(){

    try{

        await mongoose.connect(process.env.MONGO_URI)
        console.log("Succesfully connected to DB")

    }catch(err){
        console.log("Error connecting to DB, ",err);
        
    }

}

export default  connectToDb