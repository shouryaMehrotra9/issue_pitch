import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { 
      personas,            // Array of active personas in the scenario
      difficulty,          // 'Easy' | 'Medium' | 'Combative'
      history,             // Conversation history
      newMessage,          // The user's latest statement
      objectives,          // The current active objectives
      objectivesMet,       // Map of met objectives
      memory,              // Prior conversation memory summaries (array of strings)
      refereeMode,         // Boolean: if true, AI is just scoring two human partners
      activePersonaId      // ID of the persona currently responding (if pre-selected)
    } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Please set GEMINI_API_KEY in your .env.local file." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Initialize model in JSON response mode
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      }
    });

    const prompt = `
You are an advanced AI coaching referee and conversational simulator for EchoPersona.

--- 
SIMULATOR CONFIGURATION:
Active Personas in this room:
${(personas || []).map((p: any) => `
- ID: "${p.id}"
  Name: "${p.name}"
  Relationship: "${p.relationship}"
  Prompt instructions: "${p.prompt}"
  Traits:
    * Formality: ${p.traits?.formality ?? 50}%
    * Verbosity: ${p.traits?.verbosity ?? 50}%
    * Interruption Frequency: ${p.traits?.interruptionFrequency ?? 50}%
    * Emotional Volatility: ${p.traits?.emotionalVolatility ?? 50}%
    * Starting Tension: ${p.traits?.startingTension ?? 50}%
`).join('\n')}

Difficulty Setting: ${difficulty || 'Medium'} (Easy = cooperative, Medium = defensive, Combative = highly stubborn and resistant)

Prior Memories/Context from past sessions with this user:
${(memory || []).map((m: string) => `- ${m}`).join('\n') || "No prior history. This is the first conversation."}

Active Rehearsal Objectives:
${(objectives || []).map((obj: any) => `- ${obj.id}: "${obj.text}" (Currently Met: ${objectivesMet?.[obj.id] ? 'YES' : 'NO'})`).join('\n')}

Referee Mode Active: ${refereeMode ? 'YES (Two human users are talking, you are only scoring/coaching them, do NOT write a character response)' : 'NO (You are simulating the counterparts)'}
---

Conversation History:
${JSON.stringify(history || [], null, 2)}

User's Latest Statement:
"${newMessage}"

---
INSTRUCTIONS:

1. IF REFEREE MODE IS YES:
   - "text" should be empty ("").
   - Evaluate the user's latest statement in "coachingTip".
   - Adjust "defensivenessScore" (0-100) based on the overall tension of their statement.
   - Check if any objectives were met, returning them in "objectivesMet".

2. IF REFEREE MODE IS NO:
   - Choose which persona should respond next based on the flow. If there is only one persona, choose that persona's ID. Return this in "activePersonaId".
   - Generate the response for this chosen persona in "text".
   - Language Support: The user may speak in English, Hindi (Devanagari script), Hinglish (Hindi words written in English letters), or a mix. The counterpart must respond in the same language style and script as the user's input, while maintaining their core traits.
   - Follow the persona's traits precisely:
     * High Formality (>75): Avoid contractions, use stiff vocabulary (or pure Hindi formal vocabulary if Hindi). Low (<35): casual/colloquial.
     * High Verbosity (>75): Long sentences, detailed arguments. Low (<35): 1-2 sentence replies.
     * High Interruption (>75): Cut off the user, e.g. start response with "Let me stop you right there..." (or Hindi/Hinglish equivalent like "Dekho, main beech mein bol raha hoon...").
     * High Volatility (>75): Easily triggered, sudden changes in tension based on keywords.
   - Write a constructive 1-sentence "coachingTip" about the user's latest statement. If they spoke in Hindi/Hinglish, you can write the coaching tip in English or Hinglish.
   - Update the "defensivenessScore" (0-100) representing the current selected persona's tension level.
   - Evaluate if any of the objectives have been met so far.

Return a JSON object conforming exactly to this schema:
{
  "activePersonaId": "string (the ID of the persona who responded, or empty in referee mode)",
  "text": "The character response in character, or empty string in referee mode",
  "coachingTip": "A 1-sentence constructive coaching tip evaluating the user's last statement",
  "defensivenessScore": number (0 to 100 representing counterpart tension),
  "objectivesMet": {
    "objectiveId": boolean (whether the objective has been achieved at any point)
  }
}

Do not output anything else other than the raw JSON object.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const parsedData = JSON.parse(text);
      return NextResponse.json(parsedData);
    } catch (parseErr) {
      console.error("Failed to parse JSON response from Gemini simulator:", text);
      return NextResponse.json({ 
        error: "Failed to parse simulation response", 
        rawText: text 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Simulation API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate response" }, { status: 500 });
  }
}
