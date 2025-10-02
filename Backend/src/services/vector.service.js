import dotenv from "dotenv";
dotenv.config();

import { Pinecone } from '@pinecone-database/pinecone'

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

//iske andar hmare vectors store honge (means is folder ke andar)
const chatgptIndex = pc.Index('chatgpt-project')


async function createMemory({vector,metadata,messageId}){ //this will create a memory

    await chatgptIndex.upsert([  
        {
            id:messageId,
            values:vector,
            metadata
        }
    ])

}

async function queryMemory({queryVector, limit=5, metadata}){

    const data = await chatgptIndex.query({
        vector:queryVector,
        topK:limit, //aas paas ke kitne vectors chahiye (sbse nearest wale aayenge but kitne (not the distance))
        filter:metadata ? metadata:undefined, 
        includeMetadata:true
    })

    return data.matches

}

export  {queryMemory,createMemory}