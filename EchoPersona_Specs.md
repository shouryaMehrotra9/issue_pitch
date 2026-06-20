# EchoPersona - Final Product & Technical Specifications
*A High-Fidelity Conversation Rehearsal Simulator*

---

## 1. Executive Summary
**EchoPersona** is a training simulator cockpit designed to help users rehearse high-stakes, difficult conversations (e.g., salary negotiations, relationship boundaries, startup board meetings, client disputes) in a private sandbox. 

Unlike standard roleplay chatbots (which are linear, unstructured, and provide no live instruction), EchoPersona behaves like a flight simulator: it introduces state-driven state mechanics, timeline branching, live objective lists, counterpart tension meters, vocal pacing analysis, and human-partner refereeing.

---

## 2. Comprehensive Feature Specification

### 🎚️ Trait-Based Counterpart Configuration
Instead of a single difficulty slider, users configure their counterparts using five independent sliders (0-100%):
* **Formality**: Controls vocabulary and stiffness (e.g., high formality avoids contractions and uses sophisticated vocabulary).
* **Verbosity**: Controls sentence length and detail (e.g., low verbosity results in short, punchy 1-2 sentence replies).
* **Interruption Frequency**: Determines how often the character interjects or cuts off user arguments in text (e.g., starting with *"Let me stop you right there..."*).
* **Emotional Volatility**: Affects sensitivity and trigger-happiness under disagreement.
* **Starting Tension**: The initial defensiveness of the counterpart.

*These metrics are dynamically woven into the Gemini prompt instructions to govern behavior.*

### 🧠 Persistent Personas & Relationship Memory
* Personas and presets persist in local storage (`echopersona_persistent_personas`).
* **Memory Loop**: After a rehearsal ends, the AI coach generates a brief **Timeline Summary** of the outcome (e.g., *"We agreed to a 10% raise, review in 3 months"*).
* This summary is appended to the persona's memory profile and injected into subsequent sessions, allowing the counterpart to reference past conversations.

### ⏱️ Timeline Branch Comparison (Forking)
Rehearsals are non-linear. If a conversation takes a bad turn, the user can review past exchanges:
* Hover over any message bubble and click **"Rewind here"**.
* The simulator archives the abandoned path (including its scorecard, tension levels, and met objectives) in local storage as a **Branch**.
* The active chat truncates, allowing the user to try a different approach.
* Under the **Branch Comparison** tab, users select two saved branches to view side-by-side transcripts and compare scorecard metrics (e.g., *"Branch A Empathy: 80% vs Branch B Empathy: 45%"*).

### 🎤 Voice-Pace Coaching (STT Pacing)
* When utilizing microphone input, the application records dictation duration.
* Calculates your speaking rate in **Words Per Minute (WPM)**: `wordCount / (durationInSeconds / 60)`.
* This pacing data is sent to the coaching evaluation. The AI coach highlights if you spoke too fast (>155 WPM - shows anxiety) or too slow (<95 WPM - shows hesitation) and provides pacing suggestions.

### 👥 Multi-Party AI Routing
* Scenarios can host multiple AI counterparts (e.g., negotiating with a Manager while an HR rep mediates).
* The backend API automatically routes turns between the counterparts based on the flow.
* The sidebar highlights the current active speaker's card and traits.

### 🏁 Human-Partner Referee Mode
* A toggle in Setup hides AI responses.
* Two humans (e.g., Player A: Employee, Player B: Manager) take turns typing/speaking on the same device.
* The AI acts solely as a referee—evaluating tension shifts, checking off objectives, and providing coaching tips for both users after each turn.

### 📊 History & Analytics Dashboard
* A new **History & Analytics** tab compiles all completed rehearsals.
* Plots overall scorecard scores on a custom SVG trend line.
* Lists past scorecards and average scores per metric.

---

## 3. Technical Architecture & File Map

```
issue_pitch/
├── app/
│   ├── api/
│   │   ├── simulate/
│   │   │   └── route.ts     # Character simulator & referee routing
│   │   ├── hint/
│   │   │   └── route.ts     # Copilot suggestions API
│   │   └── coach/
│   │       └── route.ts     # Final coaching evaluation & memory generator
│   ├── layout.tsx           # Layout shell & SEO metadata
│   ├── globals.css          # Tailwind CSS global styles
│   └── page.tsx             # Interactive simulator cockpit & history
├── .env.local               # Environment API credentials
├── package.json             # Workspace dependencies
└── README.md                # Project README overview
```

### API Response Schemas

#### `/api/simulate` Response Schema:
```json
{
  "activePersonaId": "string (ID of the persona who responded, or empty in referee mode)",
  "text": "The character response string, or empty in referee mode",
  "coachingTip": "A 1-sentence constructive coaching tip evaluating the user's last statement",
  "defensivenessScore": 75,
  "objectivesMet": {
    "objectiveId": true
  }
}
```

#### `/api/hint` Response Schema:
```json
{
  "empathetic": "Suggested response validating counterpart feelings",
  "assertive": "Suggested response setting a firm boundary",
  "collaborative": "Suggested response offering a compromise"
}
```

#### `/api/coach` Response Schema:
```json
{
  "overallScore": 85,
  "overallFeedback": "Detailed summary of performance and vocal pacing",
  "metrics": {
    "empathy": { "score": 80, "analysis": "Feedback text..." },
    "clarity": { "score": 90, "analysis": "Feedback text including pacing..." },
    "assertiveness": { "score": 85, "analysis": "Feedback text..." }
  },
  "strengths": ["Strength 1 (quoted)", "Strength 2"],
  "improvements": ["Improvement 1", "Improvement 2"],
  "timelineSummary": "Outcome summary for memory loop (e.g. Secured a committed date of Sept 1)"
}
```

---

## 4. Local Setup & Verification

### Step 1: Add your key to `.env.local`
Create or open [.env.local](file:///c:/issue_pitch/.env.local) and add:
```env
GEMINI_API_KEY=AIzaSy...
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Run local dev server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Step 4: Run production build check
```bash
npm run build
```
*(Verified: compiles successfully in under 9 seconds with zero TypeScript errors).*
