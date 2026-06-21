import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { scenarioDescription, personaName, history, hiddenObjectives } = await req.json();

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
        temperature: 0.2, // Lower temperature for more analytical scoring
      }
    });

    const prompt = `
You are an expert communication coach and interpersonal relations specialist.
Your task is to analyze a conversation rehearsal between a user and an AI roleplaying as a specific persona in a difficult scenario.

Scenario Description: ${scenarioDescription || "A difficult interpersonal scenario"}
Persona Name: ${personaName || "Roleplay Persona"}

Secret Hidden Objectives of the counterpart:
${(hiddenObjectives || []).map((obj: any) => `- ${obj.id || obj.text}: "${obj.text}"`).join('\n') || "No hidden objectives specified."}

Below is the transcript of the conversation:
${JSON.stringify(history || [], null, 2)}

Note: Some user messages in the transcript contain a "paceMetric" field (which lists "wpm" for Words Per Minute, and "duration" in seconds).
If vocal pacing metrics are present:
- Evaluate the speaking rate. A rate of 110-140 WPM is generally confident and clear.
- Rates > 155 WPM may indicate rushing, anxiety, or nervousness.
- Rates < 95 WPM may indicate hesitation, passivity, or uncertainty.

Analyze the conversation and provide a detailed constructive evaluation in JSON format. The response must match this schema exactly:
{
  "overallScore": number (between 0 and 100),
  "overallFeedback": "string summarizing the user's performance, tone, vocal pacing details (if any), and whether they met their objectives",
  "metrics": {
    "empathy": {
      "score": number (between 0 and 100),
      "analysis": "string detailing how well the user showed empathy, active listening, or validated the other person"
    },
    "clarity": {
      "score": number (between 0 and 100),
      "analysis": "string detailing the clarity, conciseness, vocal pacing, and articulation of the user's points"
    },
    "assertiveness": {
      "score": number (between 0 and 100),
      "analysis": "string detailing if the user stood up for their interests effectively without being passive or aggressive"
    }
  },
  "strengths": ["at least 2 specific things the user did well, quoting or referring to their words"],
  "improvements": ["at least 2 specific suggestions on how the user could rephrase or adjust their speaking pace/approach differently"],
  "timelineSummary": "A 1-sentence recap of the final outcome of the conversation (e.g. 'Agreed to review raise in 3 months') to be stored in the persona's memory",
  "hiddenObjectivesAnalysis": [
    {
      "id": "string (the ID or text of the secret hidden objective, matching the ones provided above)",
      "met": boolean,
      "explanation": "A 1-sentence explanation of why the user successfully navigated or completely missed this hidden goal"
    }
  ],
  "sportsCommentary": [
    {
      "turnIndex": number,
      "comment": "Constructive sports-commentator-style highlight of a key turn (e.g., 'At turn 4, the user validated their concerns, dropping defensiveness by 20%')"
    }
  ],
  "optimalPath": [
    {
      "userIndex": number,
      "optimalResponse": "A reconstructed optimal response the user could have said at this turn index",
      "reasoning": "Why this response would be significantly higher scoring",
      "expectedOutcome": "How the counterpart would have reacted in terms of trust and cooperation"
    }
  ]
}

Be constructive, specific, and actionable. Do not output anything else other than the raw JSON object.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const evaluation = JSON.parse(text);
      return NextResponse.json(evaluation);
    } catch (parseErr) {
      console.error("Failed to parse JSON response from Gemini:", text);
      return NextResponse.json({ 
        error: "Failed to parse coach response", 
        rawText: text 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Coaching API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze conversation" }, { status: 500 });
  }
}
