import { GoogleGenAI, Type } from "@google/genai";

export interface UserProfile {
  os: string;
  goals: string;
  editors: string;
}

export function hasUserGeminiKey(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem('USER_GEMINI_API_KEY')?.trim());
}

function getAI(): GoogleGenAI | null {
  const userKey = typeof window !== 'undefined' ? localStorage.getItem('USER_GEMINI_API_KEY')?.trim() : '';
  if (!userKey) return null;
  return new GoogleGenAI({ apiKey: userKey });
}

export async function evaluateCCodeWithAI(
  problemDescription: string,
  userCode: string,
  profile?: UserProfile
): Promise<{ passed: boolean; feedback: string } | null> {
  const ai = getAI();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a concise C11 systems programming tutor.
Evaluate this user's C code for the problem below.

USER PROFILE:
- OS: ${profile?.os || 'Linux'}
- Editor: ${profile?.editors || 'VS Code'}

Problem: ${problemDescription}

Code:
\`\`\`c
${userCode}
\`\`\`

Return JSON matching { "passed": boolean, "feedback": string }.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            passed: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING },
          },
          required: ["passed", "feedback"],
        },
      },
    });

    const resultText = response.text?.trim() || "";
    const parsed = JSON.parse(resultText);
    return {
      passed: Boolean(parsed.passed),
      feedback: String(parsed.feedback || ""),
    };
  } catch {
    return null;
  }
}
