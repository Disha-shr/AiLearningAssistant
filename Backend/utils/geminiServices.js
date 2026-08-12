import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
    console.error(
        "FATAL ERROR: GEMINI_API_KEY is not set in the environment variables."
    );
    process.exit(1);
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// Gemini model available for your API key
const MODEL = "gemini-3.6-flash";

/**
 * Generate flashcards from text
 */
export const generateFlashcards = async (text, count = 10) => {
    const prompt = `
Generate exactly ${count} educational flashcards from the following text.

Format each flashcard exactly like this:

Q: [Clear, specific question]
A: [Concise, accurate answer]
D: [Difficulty level: easy, medium, or hard]

Separate each flashcard with:
---

Text:
${(text || "").substring(0, 15000)}
`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL,
            contents: prompt,
        });

        const generatedText = response.text || "";

        const flashcards = [];

        const cards = generatedText
            .split("---")
            .filter((card) => card.trim());

        for (const card of cards) {
            const lines = card.trim().split("\n");

            let question = "";
            let answer = "";
            let difficulty = "medium";

            for (const line of lines) {
                const trimmed = line.trim();

                if (trimmed.startsWith("Q:")) {
                    question = trimmed.substring(2).trim();
                } else if (trimmed.startsWith("A:")) {
                    answer = trimmed.substring(2).trim();
                } else if (trimmed.startsWith("D:")) {
                    const diff = trimmed
                        .substring(2)
                        .trim()
                        .toLowerCase();

                    if (["easy", "medium", "hard"].includes(diff)) {
                        difficulty = diff;
                    }
                }
            }

            if (question && answer) {
                flashcards.push({
                    question,
                    answer,
                    difficulty,
                });
            }
        }

        return flashcards.slice(0, count);
    } catch (error) {
        console.error(
            "Gemini API error in generateFlashcards:",
            error
        );

        throw new Error("Failed to generate flashcards");
    }
};

/**
 * Generate quiz questions
 */
export const generateQuiz = async (text, numQuestions = 5) => {
    const prompt = `
Generate exactly ${numQuestions} multiple choice questions from the following text.

Format each question exactly like this:

Q: [Question]
O1: [Option 1]
O2: [Option 2]
O3: [Option 3]
O4: [Option 4]
C: [Correct option exactly as written above]
E: [Brief explanation]
D: [Difficulty: easy, medium, or hard]

Separate each question with:
---

Text:
${(text || "").substring(0, 15000)}
`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL,
            contents: prompt,
        });

        const generatedText = response.text || "";

        const questions = [];

        const questionBlocks = generatedText
            .split("---")
            .filter((q) => q.trim());

        for (const block of questionBlocks) {
            const lines = block.trim().split("\n");

            let question = "";
            const options = [];
            let correctAnswer = "";
            let explanation = "";
            let difficulty = "medium";

            for (const line of lines) {
                const trimmed = line.trim();

                if (trimmed.startsWith("Q:")) {
                    question = trimmed.substring(2).trim();
                } else if (/^O\d:/.test(trimmed)) {
                    options.push(trimmed.substring(3).trim());
                } else if (trimmed.startsWith("C:")) {
                    correctAnswer = trimmed.substring(2).trim();
                } else if (trimmed.startsWith("E:")) {
                    explanation = trimmed.substring(2).trim();
                } else if (trimmed.startsWith("D:")) {
                    const diff = trimmed
                        .substring(2)
                        .trim()
                        .toLowerCase();

                    if (["easy", "medium", "hard"].includes(diff)) {
                        difficulty = diff;
                    }
                }
            }

            if (
                question &&
                options.length === 4 &&
                correctAnswer
            ) {
                questions.push({
                    question,
                    options,
                    correctAnswer,
                    explanation,
                    difficulty,
                });
            }
        }

        return questions.slice(0, numQuestions);
    } catch (error) {
        console.error(
            "Gemini API error in generateQuiz:",
            error
        );

        throw new Error("Failed to generate quiz");
    }
};

/**
 * Generate document summary
 */
export const generateSummary = async (text) => {
    const prompt = `
Provide a concise summary of the following text.

Highlight:

- Key concepts
- Main ideas
- Important points

Keep the summary clear and structured.

Text:
${(text || "").substring(0, 20000)}
`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL,
            contents: prompt,
        });

        const generatedText = response.text || "";

        return generatedText;
    } catch (error) {
        console.error(
            "Gemini API error in generateSummary:",
            error
        );

        throw new Error("Failed to generate summary");
    }
};

/**
 * Chat with document context
 */
export const chatWithContext = async (question, chunks) => {
    const context = (chunks || [])
        .map(
            (chunk, index) =>
                `[Chunk ${index + 1}]\n${chunk?.content || ""}`
        )
        .join("\n\n");

    const prompt = `
You are an AI learning assistant.

Answer the user's question using the document context provided below.

Rules:
- Use the document context to answer.
- If the answer is not available in the document context, clearly say that the answer is not found in the provided document.
- Do not invent information.
- Keep the answer clear and educational.
- Explain difficult concepts in simple language.
- Use examples when helpful.

Document Context:
${context || "No document context was provided."}

Question:
${question || ""}

Answer:
`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL,
            contents: prompt,
        });

        const generatedText = response.text || "";

        return generatedText;
    } catch (error) {
        console.error(
            "Gemini API error in chatWithContext:",
            error
        );

        throw new Error("Failed to process chat request");
    }
};

/**
 * Explain a specific concept
 */
export const explainConcept = async (concept, context) => {
    const prompt = `
Explain the concept of "${concept}" based on the following context.

Provide:

- A clear explanation
- Important points
- Examples if relevant
- Simple language suitable for a student

Context:
${(context || "").substring(0, 10000)}
`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL,
            contents: prompt,
        });

        const generatedText = response.text || "";

        return generatedText;
    } catch (error) {
        console.error(
            "Gemini API error in explainConcept:",
            error
        );

        throw new Error("Failed to explain concept");
    }
};