const Groq = require("groq-sdk");
const logger = require("../utils/logger");

class AIService {
    constructor() {
        this.groq = null;
    }

    _initGroq() {
        if (!process.env.GROQ_API_KEY) {
            logger.error("GROQ_API_KEY is not defined in environment variables");
            throw new Error("AI Service configuration invalid");
        }
        if (!this.groq) {
            this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        }
        return this.groq;
    }

    async generateQuestion(topic, difficulty) {
        try {
            const groq = this._initGroq();
            const prompt = `Generate a unique, "challenge-mode" multiple-choice interview question for the topic "${topic}" at "${difficulty}" difficulty.
            
            Strictly format the response as a single valid JSON object with the following fields:
            - title: The question text (be clear and concise).
            - options: An array of exactly 4 string options.
            - correctAnswer: The string value of the correct option (must match one of the options exactly).
            - explanation: A detailed explanation of why the answer is correct and why others are wrong.
            
            RETURN ONLY RAW JSON. NO MARKDOWN. NO PREAMBLE.`;

            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0]?.message?.content || "{}";
            const parsed = JSON.parse(content);

            // Defensive check for options array
            if (parsed.options && Array.isArray(parsed.options)) {
                parsed.options = parsed.options.map(opt => typeof opt === 'object' ? (opt.text || opt.value || JSON.stringify(opt)) : String(opt));
            }

            return parsed;

        } catch (error) {
            logger.error("Error generating question with Groq:", error);

            // Fallback
            return {
                title: `(Fallback) Analysis of ${topic}`,
                options: ["A", "B", "C", "D"],
                correctAnswer: "D",
                explanation: "Service temporarily unavailable."
            };
        }
    }

    async analyzePerformance(history) {
        try {
            const groq = this._initGroq();
            const prompt = `Analyze this user's interview practice history and provide 3 specific actionable tips.
            History: ${JSON.stringify(history)}
            
            Strictly format the response as a single valid JSON object with the following field:
            - tips: An array of strings (each string should be a concise, actionable piece of advice).
            
            DO NOT return objects inside the tips array. RETURN STRINGS ONLY.
            Example: { "tips": ["Tip 1 text", "Tip 2 text", "Tip 3 text"] }
            
            RETURN ONLY RAW JSON.`;

            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0]?.message?.content || "{}";
            const parsed = JSON.parse(content);

            // Ensure tips is an array of strings for the frontend
            if (parsed.tips && Array.isArray(parsed.tips)) {
                parsed.tips = parsed.tips.map(tip => typeof tip === 'object' ? (tip.description || tip.text || JSON.stringify(tip)) : String(tip));
            }

            return parsed;
        } catch (error) {
            logger.error("Error analyzing performance with Groq:", error);
            return { tips: ["Practice consistently", "Review errors", "Try different topics"] };
        }
    }

    async analyzeCode(code, language, problemDescription) {
        try {
            const groq = this._initGroq();
            const prompt = `Analyze the following ${language} code for the problem: "${problemDescription}".
            Code:
            ${code}

            Provide feedback in JSON format with fields:
            - timeComplexity
            - spaceComplexity
            - correctness (boolean)
            - qualityScore (0-100)
            - feedback (string)
            - suggestions (string array)
            - optimizedCode (string)

            RETURN ONLY RAW JSON.`;

            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0]?.message?.content || "{}";
            const parsed = JSON.parse(content);

            // Defensive check for suggestions
            if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
                parsed.suggestions = parsed.suggestions.map(s => typeof s === 'object' ? (s.description || s.text || JSON.stringify(s)) : String(s));
            }

            return parsed;
        } catch (error) {
            logger.error("Error analyzing code with Groq:", error);
            return {
                qualityScore: 0,
                feedback: "Analysis unavailable currently.",
                suggestions: ["Try again later"],
                timeComplexity: "Unknown",
                spaceComplexity: "Unknown"
            };
        }
    }
}

module.exports = new AIService();
