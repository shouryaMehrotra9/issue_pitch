# EchoPersona Simulator Cockpit
> **A Flight Simulator for Hard Conversations.**

EchoPersona is an interactive, AI-powered training simulator designed to help users rehearse high-stakes, difficult conversations (e.g., salary negotiations, relationship boundaries, startup board meetings) in a safe, structured sandbox.

Unlike generic roleplay chatbots, EchoPersona operates as a true training cockpit with branching state control, vocal pacing analytics, multi-party simulation, and refereeing tools.

---

## 🚀 Advanced Simulator Features

1. **🎚️ Trait-Based Sliders**:
   * Replace simple difficulty settings with five independent sliders: **Formality**, **Verbosity**, **Interruption Frequency**, **Emotional Volatility**, and **Starting Tension**.
   * These traits are dynamically woven into the AI's prompt instructions to control its vocabulary, resistance level, and behavioral style.

2. **🧠 Persistent Personas & Memory Loops**:
   * Custom counterparts persist client-side.
   * After each rehearsal, the AI generates a **Timeline Summary** of the outcome (e.g. *"Agreed to review budget in September"*). This summary is stored and injected as prior relationship memory in subsequent sessions.

3. **⏱️ Timeline Branch Comparison**:
   * When you click **"Rewind here"** to try a different conversational approach, the simulator automatically saves the abandoned path.
   * A dedicated **Branch Comparison** panel allows you to compare two branches side-by-side (view transcripts and coaching score deltas).

4. **🎤 Voice-Pace Coaching (STT Analytics)**:
   * Speak via the microphone button. The app calculates your speaking speed in **Words Per Minute (WPM)**.
   * Pacing metadata is sent to the coaching engine to evaluate if you spoke too fast (rushed/anxious) or too slow (hesitant).

5. **👥 Multi-Party Scenarios**:
   * Scenarios can contain multiple AI counterparts (e.g. your Manager Sarah and Bob from HR).
   * The AI routing engine automatically determines who should speak next based on the flow.

6. **🏁 Human-Partner Referee Mode**:
   * A dual-player mode where two real users take turns typing/speaking on the same device.
   * The AI behaves solely as a referee—tracking tension, checking off objectives, and offering coaching tips for both users after each turn.

7. **📊 Session History Dashboard**:
   * Plots your overall scorecard performance trends over time.
   * Displays history logs of completed simulations and average scores per metric.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS v4, Lucide React Icons.
* **AI Core**: Google Gemini API via the official `@google/generative-ai` SDK.
  * **Model**: `gemini-2.5-flash` (provides ultra-low latency roleplay responses, JSON mode configurations, and analytical coaching).
* **Voice Engine**:
  * **Speech-to-Text (STT)**: Native browser-level `SpeechRecognition` API (used to record duration and calculate WPM).
  * **Text-to-Speech (TTS)**: Native browser-level `SpeechSynthesis` API to speak simulator responses aloud.

---

## 📂 File Architecture

```
issue_pitch/
├── app/
│   ├── api/
│   │   ├── simulate/
│   │   │   └── route.ts     # Character simulator & referee engine
│   │   ├── hint/
│   │   │   └── route.ts     # Copilot suggestions API
│   │   └── coach/
│   │       └── route.ts     # Final coaching evaluation & memory recap
│   ├── layout.tsx           # Layout shell & page metadata
│   ├── globals.css          # Tailwind CSS global styles
│   └── page.tsx             # Interactive simulator cockpit & dashboard
├── .env.local               # Environment API credentials
├── package.json             # Workspace dependencies
└── README.md                # Project documentation (this file)
```

---

## 💻 Local Setup & Execution

### Prerequisites
* **Node.js**: Version 18.x or newer.
* **Gemini API Key**: Get a free API Key from [Google AI Studio](https://aistudio.google.com/).

### Step 1: Add your key to `.env.local`
Open the [.env.local](file:///c:/issue_pitch/.env.local) file and insert your API key:
```env
GEMINI_API_KEY=AIzaSy...
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Run the app
Start the dev server:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Step 4: Verify production builds
Verify compilation builds:
```bash
npm run build
```
