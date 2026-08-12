import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

try {
    const response = await ai.models.list();

    for await (const model of response) {
        console.log(model.name);
    }
} catch (error) {
    console.error("Gemini model list error:", error);
}