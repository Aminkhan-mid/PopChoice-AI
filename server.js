import "dotenv/config"
import express from "express"
import { GoogleGenerativeAI } from "@google/generative-ai"

const server = express()
const PORT = 4000
server.use(express.json())
server.use(express.static("public"))



server.post("/generate", async (req, res)=>{

const { prompt } = req.body
console.log("✅ Prompt Received:", prompt)

const editedPrompt = `
    You are a master movie recommender.
    The user said: "${prompt}"
    Return the answer in **pure JSON only** (no markdown, no backticks, no code block). In this exact format:
    {
        "name": string,
        "description": string,
        "genre": [string],
        "IMDB": number,
        "releaseDate": string,
        Release Date should be only year, for example "2018".
        Description should be only 30-35 words only.
    }`

    const key = new GoogleGenerativeAI(process.env.POPKEY)
    const model = key.getGenerativeModel({model: "gemini-2.5-flash"})
    console.log("✅ Model Name:", model)
    try {
         const results = await model.generateContent({
            contents: [{
                role: "user",
                parts: [{text: editedPrompt}]
            }]
         })  
        if(!results){
            throw new error("❌ Results came back negative.")
        }
        const rawText =  results.response.text()
        const data = JSON.parse(rawText)
        console.log("🧠 AI Response:", data)
        res.json({data: [data]})
    } catch (err) {
        console.error(err)
    }
})

server.listen(PORT, () => {
    console.log(`🟣🟣🟣 Server running at http://localhost:${PORT}`)
})

