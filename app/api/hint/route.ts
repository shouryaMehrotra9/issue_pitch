import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { scenarioDescription, personaName, history, objectives } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Please set GEMINI_API_KEY in your .env.local file." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use gemini-2.5-flash with JSON mode output enabled
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      }
    });

    const prompt = `
You are an expert communication coach and interpersonal trainer.
The user is roleplaying a difficult conversation with an AI simulating a character named "${personaName}".
Scenario: ${scenarioDescription}

Objectives the user needs to achieve:
${(objectives || []).map((o: any) => `- [${o.met ? 'x' : ' '}] ${o.text}`).join('\n')}

Here is the conversation history so far:
${JSON.stringify(history || [], null, 2)}

Provide three suggested options for what the user could say next. Each option should represent a different communication style:
1. "empathetic": A response that validates the character's feelings, de-escalates tension, and matches their emotional state constructively.
2. "assertive": A response that is firm, stands up for the user's boundaries/needs, and does not yield to manipulation or pressure.
3. "collaborative": A response that proposes a compromise, asks a constructive question, or pivots towards a mutual solution.

Return a JSON object conforming exactly to this schema:
{
  "empathetic": "A complete response string the user can say",
  "assertive": "A complete response string the user can say",
  "collaborative": "A complete response string the user can say"
}

Make the responses highly realistic, natural, and specifically adapted to the current state of the conversation history. Do not output anything else other than the raw JSON object.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const suggestions = JSON.parse(text);
      return NextResponse.json(suggestions);
    } catch (parseErr) {
      console.error("Failed to parse JSON response from Gemini for hints:", text);
      return NextResponse.json({ 
        error: "Failed to parse copilot hints", 
        rawText: text 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Hint API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate suggestions" }, { status: 500 });
  }
}
