import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.


async function generateContent(content) {
    
 try{
  console.log("running ai function")
     const ai = new GoogleGenAI({
    apiKey:process.env.GEMINI_API_KEY
    });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents:content,
    config:{
      temperature:1.4, //it is level of creativness of answer. (range - b/w 0 to 2) also more temperature takes more time and more chance of mistake, ideal temp :- 0.7
      systemInstruction:`You are Weirwood. Always speak in Hinglish with a little Bhojpuri. 
Be playful, cheeky, friendly. 
Explain things clearly. 
Reference previous context subtly when needed.
`
    }
  });
  return response.text

 }
 catch(err){

   const status = err?.status || err?.error?.status || err?.code;

    if (status === 503) {
      return "AI is overloaded right now, try again later.";
    }

    console.error("AI generation failed:", err);
    return "Something went wrong while generating content.";

 }
}

async function generateVector(message){

     const ai = new GoogleGenAI({
    apiKey:process.env.GEMINI_API_KEY
    });

   const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: message,
        config:{
          outputDimensionality:768
        }
    });

    return response.embeddings[0].values
}

export  {generateContent,generateVector}