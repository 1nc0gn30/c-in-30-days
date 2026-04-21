import { GoogleGenAI, Type } from "@google/genai";
import { DayContent, QuizQuestion, Exercise } from "../data/curriculum";

export interface UserProfile {
  os: string;
  goals: string;
  editors: string;
}

function getAI() {
  const userKey = typeof window !== 'undefined' ? localStorage.getItem('USER_GEMINI_API_KEY') : null;
  const apiKey = userKey || process.env.GEMINI_API_KEY || "";
  return new GoogleGenAI({ apiKey });
}

export async function evaluateCCode(
  problemDescription: string,
  userCode: string,
  profile?: UserProfile
): Promise<{ passed: boolean; feedback: string }> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `You are an expert C programming tutor. 
Evaluate this user's C code for the following problem. 

USER PROFILE:
- OS: ${profile?.os || 'Unknown'}
- Learning Goals: ${profile?.goals || 'Learn C'}
- Preferred Code Editor/IDE: ${profile?.editors || 'Unknown'}

Requirements:
1. The code must be syntactically valid C.
2. It must solve the problem described.

Problem: ${problemDescription}

User's Code:
\`\`\`c
${userCode}
\`\`\`

Evaluate the code. Did it completely solve the problem correctly?
Return your answer adhering to this JSON schema:
{
  "passed": boolean,
  "feedback": "string"
}

If they passed, give praise and point out what they did well.
If they failed, explain WHY without giving them the direct answer unless they completely failed. Give them hints on how to fix it. 
Tailor your feedback to their OS and preferred editor if relevant.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            passed: {
              type: Type.BOOLEAN,
              description: "Whether the code passes and solves the problem.",
            },
            feedback: {
              type: Type.STRING,
              description: "Constructive feedback and hints, formatted in markdown.",
            },
          },
          required: ["passed", "feedback"],
        },
      },
    });

    const resultText = response.text?.trim() || "";
    try {
        const parsed = JSON.parse(resultText);
        return {
            passed: parsed.passed,
            feedback: parsed.feedback
        };
    } catch {
        return { passed: false, feedback: "Error parsing AI response. Please try again." };
    }
  } catch (error) {
    console.error("Error evaluating code:", error);
    return { passed: false, feedback: "Failed to connect to the AI evaluator. Please try again." };
  }
}

export async function generateDayContent(
  topic: string, 
  dayNumber: number,
  profile?: UserProfile
): Promise<Partial<DayContent> | null> {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: `You are an expert C programming teacher creating the complete curriculum content for Day ${dayNumber} of a 30-day course.
Topic: ${topic}

USER PROFILE:
- OS: ${profile?.os || 'Unknown'}
- Learning Goals: ${profile?.goals || 'Learn C'}
- Preferred Code Editor/IDE: ${profile?.editors || 'Unknown'}

Please provide:
1. 'lessonMarkdown': A clean, engaging lesson plan in Markdown. Include an introduction, clear explanations, and C code examples. Keep it concise (500-800 words).
   - IMPORTANT: Since the user is on ${profile?.os || 'their OS'} and using ${profile?.editors || 'their editor'}, provide specific instructions on how to compile and run the code for this specific lesson topic using their setup.
2. 'quiz': A 2-question multiple choice quiz testing the lesson's concepts.
3. 'exercise': A practical coding exercise with a description and starter code.

IMPORTANT: Do NOT use markdown codeblock wrappers (\`\`\`json) around your output, return raw JSON that matches the schema.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        lessonMarkdown: { type: Type.STRING },
                        quiz: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING },
                                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    correctAnswerIndex: { type: Type.INTEGER },
                                    explanation: { type: Type.STRING }
                                },
                                required: ["question", "options", "correctAnswerIndex", "explanation"]
                            }
                        },
                        exercise: {
                            type: Type.OBJECT,
                            properties: {
                                description: { type: Type.STRING },
                                initialCode: { type: Type.STRING }
                            },
                            required: ["description", "initialCode"]
                        }
                    },
                    required: ["lessonMarkdown", "quiz", "exercise"]
                }
            }
        });
        
        const resultText = response.text?.trim() || "{}";
        const parsed = JSON.parse(resultText);
        return {
            lessonMarkdown: parsed.lessonMarkdown,
            quiz: parsed.quiz,
            exercise: parsed.exercise
        };
    } catch (e) {
        console.error("AI Error:", e);
        return null; // Signals to the UI to handle the error
    }
}
