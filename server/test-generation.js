require("dotenv").config();
const Groq = require("groq-sdk");

async function checkModels() {
    if (!process.env.GROQ_API_KEY) {
        console.log("No GROQ_API_KEY found in .env");
        return;
    }

    console.log("Initializing Groq...");
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    try {
        console.log("Testing generation with llama3-8b-8192...");
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Say 'Hello from Groq' if you work!" }],
            model: "llama-3.3-70b-versatile",
        });

        console.log("SUCCESS:", completion.choices[0]?.message?.content);
    } catch (error) {
        console.log("FAILED:", error.message);
    }
}

checkModels();
