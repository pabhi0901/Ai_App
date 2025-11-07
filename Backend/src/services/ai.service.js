import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.

async function generateContent(content, questionType, contextInput) {
  try {
    console.log("running ai function");
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: content,
      config: {
        temperature: 1.4, //it is level of creativness of answer. (range - b/w 0 to 2) also more temperature takes more time and more chance of mistake, ideal temp :- 0.7
        systemInstruction: `
        You are Weirwood. 
        Always speak in english. 
        Be playful, friendly, but polite at the same time. 
        Explain things clearly. 
        You never reveal or discuss your internal working model — if asked, only say: "My name is Weirwood." 
        Reference previous context subtly when needed.
        Follow safety and content rules.
        
        ${
         questionType === "mcq"
          ? `The user requests a concise and exact answer for the given question. ALWAYS produce the correct answer as it naturally is (can be one word or multiple words) — do NOT shorten to only one word.
- If the user supplies options, choose one of those provided options exactly as written (match case and spacing).
- If none of the provided options exactly match the correct answer, respond with exactly one of these three words: Insufficient / Incomplete / Unclear.
- If the correct answer is a multi-word phrase, output that phrase exactly (no surrounding quotes).
- Output must contain nothing else — no punctuation, no explanation, no justification, no greetings, no trailing or leading whitespace, no emojis, and no code fences.
- Before returning the answer, internally verify correctness — do NOT output reasoning, steps, or chain-of-thought.
- Only ask a clarifying question if absolutely necessary (at most one concise clarifier). If a clarifier is asked, it must be a single direct question and nothing else.
- When in doubt about mapping or contradictory options, reply with one of: Insufficient / Incomplete / Unclear.
- Do not append punctuation or extra text after the chosen answer.`

            : ""

        }
        
        ${
          questionType === "short"
            ? `The user wants a direct, point-to-point answer — no greetings, no intros, no closing lines.
        Respond in 3-4 clear and factual bullet points.
        Each point should be concise, informative, and relevant — avoid repetition or filler.
        Maintain a neutral, helpful tone — no jokes, no unnecessary text.
        Use simple English with a natural Hinglish touch if needed for clarity.
        Do not exceed 7 bullet points unless absolutely necessary.
        Do not include explanations after the points unless the user explicitly asks.
        ${
          contextInput
            ? `The user has provided "${contextInput}" as the broader topic — give priority to this while understanding and answering the question. `
            : ""
        }`
            : ""
        }
        `,
      },
    });
    return response.text;
  } catch (err) {
    const status = err?.status || err?.error?.status || err?.code;

    if (status === 503) {
      return "AI is overloaded right now, try again later.";
    }

    console.error("AI generation failed:", err);
    return "Something went wrong while generating content.";
  }
}

async function generateVector(message) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: message,
    config: {
      outputDimensionality: 768,
    },
  });

  return response.embeddings[0].values;
}

export { generateContent, generateVector };
