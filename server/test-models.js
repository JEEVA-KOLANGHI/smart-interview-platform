require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function checkModels() {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.log("No API Key found");
            return;
        }
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const models = await genAI.listModels();
        console.log("Available Models:");
        for (const model of models.models) {
            if (model.supportedGenerationMethods.includes("generateContent")) {
                console.log(`- ${model.name}`);
            }
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

checkModels();
