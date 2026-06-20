'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  MessageSquare, 
  Settings, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  Award, 
  RefreshCw, 
  ArrowRight, 
  ChevronRight, 
  AlertTriangle, 
  User, 
  Compass, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Activity,
  Smile,
  Shield,
  Briefcase,
  GitCommit,
  Sparkles,
  Download,
  AlertCircle,
  Info,
  Calendar,
  Share2,
  Users,
  Maximize2,
  History,
  Copy,
  Check
} from 'lucide-react';

// Preset scenarios with initial multi-party and objective configuration
const DEFAULT_PRESETS = [
  {
    id: 'dismissive-boss-scenario',
    title: 'Salary Review Committee',
    scenario: 'Salary Negotiation',
    description: 'Negotiate a raise with your manager Sarah, who is defensive about budget constraints, while HR rep Bob mediates.',
    objective: 'Negotiate a 15% raise or secure a committed timeline and budget for a review.',
    objectives: [
      { id: 'budget', text: 'Acknowledge company budget constraints without yielding' },
      { id: 'value', text: 'Quantify your accomplishments and business value clearly' },
      { id: 'timeline', text: 'Secure a commitment for a specific future review date' }
    ],
    personas: [
      {
        id: 'sarah-manager',
        name: 'Sarah (The Dismissive Boss)',
        relationship: 'Manager',
        prompt: `You are Sarah, a busy corporate department manager. Your employee is asking for a 15% raise. You are defensive, evasive, and constantly redirect to company budget constraints and HR policies. You want to delay the discussion. Give short responses (1-3 sentences).`,
        traits: { formality: 85, verbosity: 40, interruptionFrequency: 70, emotionalVolatility: 60, startingTension: 70 }
      },
      {
        id: 'bob-hr',
        name: 'Bob (The Corporate HR)',
        relationship: 'HR Representative',
        prompt: `You are Bob, an HR representative mediating the salary discussion. You are neutral, extremely formal, policy-driven, and try to calm down emotional outbursts. You suggest compromises but always protect company risk. Give short responses (1-2 sentences).`,
        traits: { formality: 95, verbosity: 30, interruptionFrequency: 20, emotionalVolatility: 10, startingTension: 30 }
      }
    ]
  },
  {
    id: 'guilt-tripper-scenario',
    title: 'Weekend Border Dispute',
    scenario: 'Setting Boundaries',
    description: 'Alex wants you to spend the weekend at their family wedding, while you desperately need solo time to avoid burnout.',
    objective: 'Hold your ground and set a boundary to stay home without apologizing excessively or giving in.',
    objectives: [
      { id: 'boundary', text: 'Clearly state your need to stay home without over-apologizing' },
      { id: 'validate', text: 'Validate Alex\'s feelings and confirm your care for them' },
      { id: 'alternative', text: 'Propose a specific alternative way to connect later' }
    ],
    personas: [
      {
        id: 'alex-partner',
        name: 'Alex (The Guilt-Tripping Partner)',
        relationship: 'Partner',
        prompt: `You are Alex, the user's romantic partner. You are hurt and try to guilt-trip them (e.g., 'I always support you', 'Everyone will ask where you are'). Keep responses emotionally manipulative but realistic. Give short, punchy responses (1-3 sentences).`,
        traits: { formality: 20, verbosity: 50, interruptionFrequency: 60, emotionalVolatility: 90, startingTension: 60 }
      }
    ]
  },
  {
    id: 'skeptical-vc-scenario',
    title: 'VC Board Confrontation',
    scenario: 'Pitching a Startup Pivot',
    description: 'Pitch your startup\'s pivot to your lead investor Marcus, who is impatient, and co-investor Helen.',
    objective: 'De-escalate concerns, validate their investment protection, and pitch the pivot logic successfully.',
    objectives: [
      { id: 'deescalate', text: 'Acknowledge the retention metrics issue without being defensive' },
      { id: 'moat', text: 'Explain the product moat or acquisition strategy for the pivot' },
      { id: 'protection', text: 'Reassure them that their capital and dilution are respected' }
    ],
    personas: [
      {
        id: 'marcus-vc',
        name: 'Marcus (The Skeptical VC)',
        relationship: 'Lead Investor',
        prompt: `You are Marcus, a seasoned venture capitalist. You are impatient, skeptical, data-driven, and query retention metrics. You check your phone frequently. Give concise, aggressive responses (1-2 sentences).`,
        traits: { formality: 70, verbosity: 35, interruptionFrequency: 80, emotionalVolatility: 50, startingTension: 80 }
      },
      {
        id: 'helen-angel',
        name: 'Helen (The Soft Angel)',
        relationship: 'Co-Investor',
        prompt: `You are Helen, an angel investor who co-invested. You are supportive of the founder but worried about Marcus backing out. You ask constructive questions about user feedback. Give short responses (1-3 sentences).`,
        traits: { formality: 60, verbosity: 45, interruptionFrequency: 30, emotionalVolatility: 30, startingTension: 40 }
      }
    ]
  }
];

interface Persona {
  id: string;
  name: string;
  relationship: string;
  prompt: string;
  traits: {
    formality: number;
    verbosity: number;
    interruptionFrequency: number;
    emotionalVolatility: number;
    startingTension: number;
  };
}

interface Scenario {
  id: string;
  title: string;
  scenario: string;
  description: string;
  objective: string;
  objectives: { id: string; text: string }[];
  personas: Persona[];
  memory?: string[]; // Prior session summary memories
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  activePersonaId?: string; // ID of the persona who sent the message (for multi-party)
  activePersonaName?: string; // Name of the persona
  coachingTip?: string;
  defensivenessScore?: number;
  objectivesMetSnapshot?: Record<string, boolean>;
  paceMetric?: {
    wpm: number;
    duration: number; // in seconds
  };
}

interface SavedBranch {
  id: string;
  name: string;
  scenarioId: string;
  scenarioTitle: string;
  messages: Message[];
  objectivesMet: Record<string, boolean>;
  defensivenessScore: number;
  coachingResult: CoachingResult | null;
  timestamp: string;
}

interface CoachingResult {
  overallScore: number;
  overallFeedback: string;
  metrics: {
    empathy: { score: number; analysis: string };
    clarity: { score: number; analysis: string };
    assertiveness: { score: number; analysis: string };
  };
  strengths: string[];
  improvements: string[];
  timelineSummary?: string; // Outcome memory log
}

interface CopilotHints {
  empathetic: string;
  assertive: string;
  collaborative: string;
}

export default function Home() {
  // Navigation Tabs: 'simulator' | 'history' | 'branches'
  const [navTab, setNavTab] = useState<'simulator' | 'history' | 'branches'>('simulator');
  
  // Simulation Steps: 'setup' | 'rehearsal' | 'dashboard'
  const [step, setStep] = useState<'setup' | 'rehearsal' | 'dashboard'>('setup');
  
  // Shared URL Assignment Scenario Indicator
  const [assignmentMode, setAssignmentMode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Database / LocalStorage state
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('dismissive-boss-scenario');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Combative'>('Medium');
  
  // Custom sandbox editor states
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [customObjective, setCustomObjective] = useState<string>('');
  const [customObj1, setCustomObj1] = useState<string>('');
  const [customObj2, setCustomObj2] = useState<string>('');
  const [customObj3, setCustomObj3] = useState<string>('');

  // Independent custom persona sliders
  const [persona1Name, setPersona1Name] = useState<string>('');
  const [persona1Rel, setPersona1Rel] = useState<string>('');
  const [persona1Prompt, setPersona1Prompt] = useState<string>('');
  const [formality1, setFormality1] = useState<number>(50);
  const [verbosity1, setVerbosity1] = useState<number>(50);
  const [interrupt1, setInterrupt1] = useState<number>(50);
  const [volatility1, setVolatility1] = useState<number>(50);
  const [tension1, setTension1] = useState<number>(50);

  // Second custom persona (for multi-party configuration)
  const [includeSecondPersona, setIncludeSecondPersona] = useState<boolean>(false);
  const [persona2Name, setPersona2Name] = useState<string>('');
  const [persona2Rel, setPersona2Rel] = useState<string>('');
  const [persona2Prompt, setPersona2Prompt] = useState<string>('');
  const [formality2, setFormality2] = useState<number>(50);
  const [verbosity2, setVerbosity2] = useState<number>(50);
  const [interrupt2, setInterrupt2] = useState<number>(50);
  const [volatility2, setVolatility2] = useState<number>(50);
  const [tension2, setTension2] = useState<number>(50);

  // Referee Mode state
  const [refereeMode, setRefereeMode] = useState<boolean>(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<'A' | 'B'>('A'); // Turn tracker in referee mode
  const [refereeUserAName, setRefereeUserAName] = useState<string>('Employee');
  const [refereeUserBName, setRefereeUserBName] = useState<string>('Manager');

  // Simulation Active states
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [isGeneratingMessage, setIsGeneratingMessage] = useState<boolean>(false);
  const [simError, setSimError] = useState<string | null>(null);
  
  // Rehearsal metrics
  const [objectivesMet, setObjectivesMet] = useState<Record<string, boolean>>({});
  const [currentTension, setCurrentTension] = useState<number>(50);
  const [lastCoachingTip, setLastCoachingTip] = useState<string>('Simulator active. Open the dialogue.');
  const [activeSpeakerId, setActiveSpeakerId] = useState<string>('');
  const [showTipId, setShowTipId] = useState<string | null>(null);

  // Copilot Suggestion States
  const [copilotHints, setCopilotHints] = useState<CopilotHints | null>(null);
  const [isGeneratingHints, setIsGeneratingHints] = useState<boolean>(false);
  const [hintError, setHintError] = useState<string | null>(null);
  const [showHintModal, setShowHintModal] = useState<boolean>(false);
  
  // Voice & Pacing States
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechToTextSupported, setSpeechToTextSupported] = useState<boolean>(false);
  const [readAloudEnabled, setReadAloudEnabled] = useState<boolean>(false);
  const [micStartTime, setMicStartTime] = useState<number | null>(null);
  const [speechLanguage, setSpeechLanguage] = useState<'en-US' | 'hi-IN'>('en-US');
  
  // Completed Session History & Branches Database
  const [sessionHistory, setSessionHistory] = useState<CoachingResult[]>([]); // Stored finished logs
  const [historyList, setHistoryList] = useState<any[]>([]); // Saved logs overview
  const [savedBranches, setSavedBranches] = useState<SavedBranch[]>([]);
  
  // Branch Comparison states
  const [compareBranchId1, setCompareBranchId1] = useState<string>('');
  const [compareBranchId2, setCompareBranchId2] = useState<string>('');

  // Coaching final report states
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState<boolean>(false);
  const [coachingResult, setCoachingResult] = useState<CoachingResult | null>(null);
  const [coachError, setCoachError] = useState<string | null>(null);

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // 1. Initial Load & Seed Database
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Seed Presets Scenarios
      const storedScenarios = localStorage.getItem('echopersona_scenarios');
      if (storedScenarios) {
        setScenarios(JSON.parse(storedScenarios));
      } else {
        localStorage.setItem('echopersona_scenarios', JSON.stringify(DEFAULT_PRESETS));
        setScenarios(DEFAULT_PRESETS);
      }

      // Load History
      const storedHistory = localStorage.getItem('echopersona_history');
      if (storedHistory) {
        setHistoryList(JSON.parse(storedHistory));
      }

      // Load Branches
      const storedBranches = localStorage.getItem('echopersona_branches');
      if (storedBranches) {
        setSavedBranches(JSON.parse(storedBranches));
      }

      // Check URL Assignment Parameter
      if (window.location.hash) {
        try {
          const hashVal = window.location.hash.substring(1);
          if (hashVal.startsWith('assignment=')) {
            const encodedData = decodeURIComponent(hashVal.replace('assignment=', ''));
            const decodedScenario = JSON.parse(atob(encodedData));
            if (decodedScenario && decodedScenario.id) {
              setScenarios(prev => {
                const filtered = prev.filter(s => s.id !== decodedScenario.id);
                return [decodedScenario, ...filtered];
              });
              setSelectedScenarioId(decodedScenario.id);
              setAssignmentMode(true);
              setStep('setup');
            }
          }
        } catch (e) {
          console.error("Failed to decode shared assignment", e);
        }
      }
    }
  }, []);

  // 2. Setup Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechToTextSupported(true);
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onstart = () => {
          setIsListening(true);
          setMicStartTime(Date.now());
        };

        rec.onend = () => {
          setIsListening(false);
        };

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript && micStartTime) {
            const endTime = Date.now();
            const duration = (endTime - micStartTime) / 1000;
            const wordCount = transcript.trim().split(/\s+/).length;
            const wpm = duration > 0.5 ? Math.round(wordCount / (duration / 60)) : 120;
            
            setInputVal((prev) => {
              const base = prev ? prev + ' ' + transcript : transcript;
              return base;
            });

            // Store transient pacing metadata on window for capture
            (window as any)._lastPacing = { wpm, duration };
          }
        };

        rec.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, [micStartTime]);

  // Update Speech Recognition Language on change
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = speechLanguage;
    }
  }, [speechLanguage]);

  // Scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGeneratingMessage]);

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceInputToggle = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        (window as any)._lastPacing = null;
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Launch Simulator
  const handleStartRehearsal = () => {
    let scenarioConfig: Scenario;

    if (isCustomMode) {
      if (!customTitle || !customDescription) {
        alert('Please enter a Scenario Title and Description.');
        return;
      }
      if (!persona1Name || !persona1Prompt) {
        alert('Please fill out at least the first Persona Name and Prompt.');
        return;
      }

      const activePersonas: Persona[] = [
        {
          id: 'custom-p1',
          name: persona1Name,
          relationship: persona1Rel || 'Counterpart',
          prompt: persona1Prompt,
          traits: {
            formality: formality1,
            verbosity: verbosity1,
            interruptionFrequency: interrupt1,
            emotionalVolatility: volatility1,
            startingTension: tension1
          }
        }
      ];

      if (includeSecondPersona && persona2Name && persona2Prompt) {
        activePersonas.push({
          id: 'custom-p2',
          name: persona2Name,
          relationship: persona2Rel || 'Co-Mediator',
          prompt: persona2Prompt,
          traits: {
            formality: formality2,
            verbosity: verbosity2,
            interruptionFrequency: interrupt2,
            emotionalVolatility: volatility2,
            startingTension: tension2
          }
        });
      }

      const customObjectivesList = [];
      if (customObj1) customObjectivesList.push({ id: 'custom-obj1', text: customObj1 });
      if (customObj2) customObjectivesList.push({ id: 'custom-obj2', text: customObj2 });
      if (customObj3) customObjectivesList.push({ id: 'custom-obj3', text: customObj3 });
      
      if (customObjectivesList.length === 0) {
        customObjectivesList.push(
          { id: 'custom-obj1', text: 'State your boundary or position clearly' },
          { id: 'custom-obj2', text: 'Listen and acknowledge their main concern' },
          { id: 'custom-obj3', text: 'Suggest a collaborative compromise option' }
        );
      }

      scenarioConfig = {
        id: 'custom-scenario-' + Date.now(),
        title: customTitle,
        scenario: 'Custom Training',
        description: customDescription,
        objective: customObjective || 'Resolve the scenario constructively.',
        objectives: customObjectivesList,
        personas: activePersonas,
        memory: []
      };

      // Save custom scenario to local storage scenarios list
      setScenarios(prev => {
        const updated = [...prev, scenarioConfig];
        localStorage.setItem('echopersona_scenarios', JSON.stringify(updated));
        return updated;
      });
    } else {
      const selected = scenarios.find(s => s.id === selectedScenarioId);
      if (!selected) return;
      scenarioConfig = selected;
    }

    // Set starting tension based on first active counterpart
    const startingTension = scenarioConfig.personas[0]?.traits.startingTension ?? 50;

    const initialObjectives: Record<string, boolean> = {};
    scenarioConfig.objectives.forEach(obj => {
      initialObjectives[obj.id] = false;
    });

    setActiveScenario(scenarioConfig);
    setObjectivesMet(initialObjectives);
    setCurrentTension(startingTension);
    setLastCoachingTip('Simulator active. Present your position to begin.');
    setActiveSpeakerId(scenarioConfig.personas[0]?.id || '');
    setCopilotHints(null);
    setShowHintModal(false);
    
    // Reset turns
    setCurrentSpeaker('A');

    setMessages([
      {
        id: 'init',
        role: 'model',
        text: `Hey, let's talk. What's on your mind?`,
        timestamp: new Date(),
        activePersonaId: scenarioConfig.personas[0]?.id,
        activePersonaName: scenarioConfig.personas[0]?.name,
        defensivenessScore: startingTension,
        objectivesMetSnapshot: initialObjectives
      }
    ]);
    
    setInputVal('');
    setSimError(null);
    setStep('rehearsal');

    if (readAloudEnabled) {
      setTimeout(() => {
        speakText(`Hey, let's talk. What's on your mind?`);
      }, 500);
    }
  };

  // Rehearsal communication loop
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isGeneratingMessage || !activeScenario) return;

    // Check transient pacing values from SpechRecognition
    const lastPacing = (window as any)._lastPacing;
    const paceMetric = lastPacing ? { ...lastPacing } : undefined;
    (window as any)._lastPacing = null;

    const userMessage: Message = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      text: inputVal.trim(),
      timestamp: new Date(),
      activePersonaName: refereeMode 
        ? (currentSpeaker === 'A' ? refereeUserAName : refereeUserBName) 
        : 'You',
      paceMetric
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputVal('');
    setIsGeneratingMessage(true);
    setSimError(null);
    setCopilotHints(null);

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personas: activeScenario.personas,
          difficulty: refereeMode ? 'Medium' : difficulty,
          newMessage: userMessage.text,
          history: messages,
          objectives: activeScenario.objectives,
          objectivesMet: objectivesMet,
          memory: activeScenario.memory || [],
          refereeMode: refereeMode,
          activePersonaId: refereeMode ? '' : activeSpeakerId
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to simulate');
      }

      setObjectivesMet(data.objectivesMet || {});
      setCurrentTension(data.defensivenessScore ?? 50);
      setLastCoachingTip(data.coachingTip || 'Continue maintaining control.');

      if (refereeMode) {
        // In referee mode, we do NOT generate AI text. We just insert referee feedback metadata.
        const refMetaMessage: Message = {
          id: `msg-referee-${Date.now()}`,
          role: 'model',
          text: `[REFEREE FEEDBACK] Defensiveness: ${data.defensivenessScore}%. ${data.coachingTip}`,
          timestamp: new Date(),
          coachingTip: data.coachingTip,
          defensivenessScore: data.defensivenessScore,
          objectivesMetSnapshot: data.objectivesMet
        };
        setMessages((prev) => [...prev, refMetaMessage]);
        
        // Toggle turn speaker
        setCurrentSpeaker(currentSpeaker === 'A' ? 'B' : 'A');
      } else {
        // AI response turn
        const counterpart = activeScenario.personas.find(p => p.id === data.activePersonaId) || activeScenario.personas[0];
        setActiveSpeakerId(counterpart.id);

        const modelMessage: Message = {
          id: `msg-model-${Date.now()}`,
          role: 'model',
          text: data.text,
          timestamp: new Date(),
          activePersonaId: counterpart.id,
          activePersonaName: counterpart.name,
          coachingTip: data.coachingTip,
          defensivenessScore: data.defensivenessScore,
          objectivesMetSnapshot: data.objectivesMet
        };
        setMessages((prev) => [...prev, modelMessage]);

        if (readAloudEnabled) {
          speakText(data.text);
        }
      }
    } catch (err: any) {
      console.error(err);
      setSimError(err.message || 'An error occurred.');
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  // Timeline Rewind with Auto-Branch saving
  const handleRewind = (index: number) => {
    if (index < 0 || index >= messages.length || !activeScenario) return;

    // Auto-save the current path as a branch before we truncate it
    const scoreText = coachingResult ? ` (Score: ${coachingResult.overallScore})` : '';
    const newBranch: SavedBranch = {
      id: 'branch-' + Date.now(),
      name: `Branch from turn ${index} - ${new Date().toLocaleTimeString()}${scoreText}`,
      scenarioId: activeScenario.id,
      scenarioTitle: activeScenario.title,
      messages: [...messages],
      objectivesMet: { ...objectivesMet },
      defensivenessScore: currentTension,
      coachingResult: coachingResult,
      timestamp: new Date().toLocaleString()
    };

    setSavedBranches(prev => {
      const updated = [newBranch, ...prev];
      localStorage.setItem('echopersona_branches', JSON.stringify(updated));
      return updated;
    });

    // Truncate messages
    const slicedMessages = messages.slice(0, index + 1);
    const targetState = slicedMessages[slicedMessages.length - 1];

    setMessages(slicedMessages);
    if (targetState.objectivesMetSnapshot) setObjectivesMet(targetState.objectivesMetSnapshot);
    if (targetState.defensivenessScore !== undefined) setCurrentTension(targetState.defensivenessScore);
    
    setLastCoachingTip(targetState.coachingTip || 'Timeline rewound. Enter new branch responses.');
    setCopilotHints(null);
    setShowHintModal(false);

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // Ask Copilot Suggestions
  const handleGetHints = async () => {
    if (!activeScenario || isGeneratingMessage) return;

    setIsGeneratingHints(true);
    setHintError(null);
    setShowHintModal(true);

    try {
      const res = await fetch('/api/hint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenarioDescription: activeScenario.description,
          personaName: activeScenario.personas[0]?.name || 'Counterpart',
          history: messages,
          objectives: activeScenario.objectives.map(o => ({
            ...o,
            met: objectivesMet[o.id]
          }))
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch suggestions');
      setCopilotHints(data);
    } catch (err: any) {
      console.error(err);
      setHintError(err.message || 'Failed to generate hints.');
    } finally {
      setIsGeneratingHints(false);
    }
  };

  const handleSelectHint = (text: string) => {
    setInputVal(text);
    setShowHintModal(false);
  };

  // End Rehearsal and get scoring with pacing metrics
  const handleEndAndGetFeedback = async () => {
    if (messages.length < 2) {
      alert('Please exchange dialogue turns first.');
      return;
    }

    setStep('dashboard');
    setIsGeneratingFeedback(true);
    setCoachError(null);
    setCoachingResult(null);

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenarioDescription: activeScenario?.description || '',
          personaName: activeScenario?.personas.map(p => p.name).join(', ') || 'Counterparts',
          history: messages // History includes paceMetric metadata fields
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to score rehearsal');

      setCoachingResult(data);

      // 1. Update Persistent memory of the scenario based on outcome timeline summary
      if (data.timelineSummary && activeScenario) {
        setScenarios(prev => {
          const updated = prev.map(s => {
            if (s.id === activeScenario.id) {
              const mem = s.memory ? [...s.memory, data.timelineSummary] : [data.timelineSummary];
              // Keep only last 5 outcomes to avoid prompt bloat
              if (mem.length > 5) mem.shift();
              return { ...s, memory: mem };
            }
            return s;
          });
          localStorage.setItem('echopersona_scenarios', JSON.stringify(updated));
          return updated;
        });
      }

      // 2. Save scorecard to history list database
      const historyItem = {
        id: 'run-' + Date.now(),
        scenarioTitle: activeScenario?.title || 'Custom Scenario',
        score: data.overallScore,
        date: new Date().toLocaleDateString(),
        feedback: data.overallFeedback,
        metrics: data.metrics
      };

      setHistoryList(prev => {
        const updated = [historyItem, ...prev];
        localStorage.setItem('echopersona_history', JSON.stringify(updated));
        return updated;
      });

    } catch (err: any) {
      console.error(err);
      setCoachError(err.message || 'Feedback evaluation failed.');
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  // Generate URL Assignment Link
  const handleGenerateShareLink = () => {
    if (!activeScenario) {
      const selected = scenarios.find(s => s.id === selectedScenarioId);
      if (!selected) return;
      const b64 = btoa(JSON.stringify(selected));
      const url = `${window.location.origin}${window.location.pathname}#assignment=${encodeURIComponent(b64)}`;
      navigator.clipboard.writeText(url);
    } else {
      const b64 = btoa(JSON.stringify(activeScenario));
      const url = `${window.location.origin}${window.location.pathname}#assignment=${encodeURIComponent(b64)}`;
      navigator.clipboard.writeText(url);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportLogs = () => {
    if (!activeScenario) return;
    let content = `# EchoPersona Rehearsal Flight Log\n`;
    content += `Date: ${new Date().toLocaleDateString()}\n`;
    content += `Scenario: ${activeScenario.title}\n`;
    content += `Objective: ${activeScenario.objective}\n\n`;

    content += `## 1. Scorecard\n`;
    if (coachingResult) {
      content += `Overall Score: ${coachingResult.overallScore}/100\n`;
      content += `Feedback: "${coachingResult.overallFeedback}"\n\n`;
    }

    content += `## 2. Pacing & Transcript logs\n`;
    messages.forEach((msg, idx) => {
      content += `**[${idx}] ${msg.activePersonaName || 'User'}**: "${msg.text}"\n`;
      if (msg.paceMetric) {
        content += `*Speaking Pace: ${msg.paceMetric.wpm} WPM (Duration: ${msg.paceMetric.duration}s)*\n`;
      }
      content += `\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FlightLog_${activeScenario.id}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestart = () => {
    setActiveScenario(null);
    setMessages([]);
    setCoachingResult(null);
    setStep('setup');
    setAssignmentMode(false);
  };

  // UI calculations: average history score
  const getAverageHistoryScore = () => {
    if (historyList.length === 0) return 0;
    const sum = historyList.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(sum / historyList.length);
  };

  // Color helper for tension meter
  const getTensionColor = (score: number) => {
    if (score < 40) return 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30';
    if (score < 75) return 'text-amber-400 bg-amber-950/20 border-amber-900/30';
    return 'text-red-400 bg-red-950/20 border-red-900/30 animate-pulse';
  };

  return (
    <div className="flex-1 w-full bg-slate-955 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased min-h-screen">
      {/* Navbar Header */}
      <header className="sticky top-0 z-45 bg-slate-950/90 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-400">
              EchoPersona
            </h1>
            <p className="text-xs text-slate-400 sm:block hidden">Flight simulator for hard conversations</p>
          </div>
        </div>

        {/* Global tab navigator */}
        {step === 'setup' && (
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setNavTab('simulator')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                navTab === 'simulator' ? 'bg-slate-800 text-white shadow' : 'text-slate-450 hover:text-slate-200'
              }`}
            >
              Simulator
            </button>
            <button
              onClick={() => setNavTab('branches')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                navTab === 'branches' ? 'bg-slate-800 text-white shadow' : 'text-slate-450 hover:text-slate-200'
              }`}
            >
              Branch Comparison
            </button>
            <button
              onClick={() => setNavTab('history')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                navTab === 'history' ? 'bg-slate-800 text-white shadow' : 'text-slate-450 hover:text-slate-200'
              }`}
            >
              History & Analytics
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => setReadAloudEnabled(!readAloudEnabled)}
            className={`p-2 rounded-md transition-all flex items-center gap-1.5 text-xs font-medium ${
              readAloudEnabled 
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
                : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="Read Responses Aloud"
          >
            {readAloudEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="sm:inline hidden">Voice Response</span>
          </button>
          
          {step !== 'setup' && (
            <button
              onClick={handleRestart}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-center">

        {/* ================================== TABS 1: SIMULATOR SETUP / COCKPIT ================================== */}
        {navTab === 'simulator' && (
          <div className="w-full">
            
            {/* SETUP SCREEN */}
            {step === 'setup' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
                {/* Left Side: Setup Forms */}
                <div className="lg:col-span-7 flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    {assignmentMode ? (
                      <span className="text-xs uppercase tracking-wider font-bold text-amber-400 bg-amber-950/20 border border-amber-900/30 px-3 py-1 rounded-full self-start">
                        🎯 Assigned Training Active
                      </span>
                    ) : (
                      <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">Step 1: Configuration</span>
                    )}
                    <h2 className="text-3xl font-extrabold tracking-tight">Rehearsal Cockpit</h2>
                    <p className="text-slate-400 text-sm">
                      Set up your counterpart's specific communication sliders, or choose from pre-built scenarios.
                    </p>
                  </div>

                  {/* Mode tabs */}
                  {!assignmentMode && (
                    <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-850">
                      <button
                        onClick={() => setIsCustomMode(false)}
                        className={`flex-1 py-3 text-center rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                          !isCustomMode ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Compass className="w-4 h-4" />
                        Scenarios
                      </button>
                      <button
                        onClick={() => setIsCustomMode(true)}
                        className={`flex-1 py-3 text-center rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                          isCustomMode ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        Custom Sandbox
                      </button>
                    </div>
                  )}

                  {/* Mode selection referee / simulator */}
                  <div className="flex bg-slate-900/40 border border-slate-850 p-4 rounded-xl items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Users className="w-5 h-5 text-indigo-400" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">Human-Partner Referee Mode</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Two real users converse; AI tracks score and objectives.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setRefereeMode(!refereeMode)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                        refereeMode ? 'bg-indigo-600' : 'bg-slate-800'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        refereeMode ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {refereeMode && (
                    <div className="bg-slate-900/35 border border-slate-850 p-4 rounded-xl flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                      <h4 className="text-xs font-bold text-slate-300">Partner Details</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase">Player A (Employee / Initiator)</label>
                          <input
                            type="text"
                            value={refereeUserAName}
                            onChange={(e) => setRefereeUserAName(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-xs px-3 py-2 outline-none focus:border-indigo-500 rounded-lg text-slate-100"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase">Player B (Manager / Counterpart)</label>
                          <input
                            type="text"
                            value={refereeUserBName}
                            onChange={(e) => setRefereeUserBName(e.target.value)}
                            className="bg-slate-955 border border-slate-800 text-xs px-3 py-2 outline-none focus:border-indigo-500 rounded-lg text-slate-100"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scenarios preset selection list */}
                  {!isCustomMode && !assignmentMode ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {scenarios.map((preset) => {
                        const isSelected = selectedScenarioId === preset.id;
                        return (
                          <button
                            key={preset.id}
                            onClick={() => setSelectedScenarioId(preset.id)}
                            className={`text-left p-5 rounded-2xl border transition-all flex flex-col justify-between h-full gap-3 ${
                              isSelected 
                                ? 'bg-indigo-950/40 border-indigo-500 shadow-lg' 
                                : 'bg-slate-900/60 border-slate-850/60 hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex flex-col gap-1.5 w-full">
                              <div className="flex justify-between items-start w-full text-[9px] uppercase tracking-wider font-bold text-slate-500">
                                <span>{preset.scenario}</span>
                                <span>{preset.personas.length} counterpart{preset.personas.length > 1 ? 's' : ''}</span>
                              </div>
                              <h3 className="text-base font-bold text-slate-100 mt-0.5">{preset.title}</h3>
                              <p className="text-xs text-slate-450 leading-normal line-clamp-3">
                                {preset.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : isCustomMode && !assignmentMode ? (
                    /* Custom Config Panel with Trait Sliders */
                    <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 flex flex-col gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-350">Scenario Title</label>
                          <input
                            type="text"
                            placeholder="e.g., Critical Budget Review"
                            value={customTitle}
                            onChange={(e) => setCustomTitle(e.target.value)}
                            className="bg-slate-950 border border-slate-850 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-sm text-slate-100 transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-350">Rehearsal Type</label>
                          <input
                            type="text"
                            placeholder="e.g., Salary, Dispute, Breakup"
                            className="bg-slate-950 border border-slate-850 focus:border-indigo-500 outline-none rounded-xl px-4 py-2.5 text-sm text-slate-100 transition-all"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-350">Scenario Context & Description</label>
                        <textarea
                          placeholder="Describe the difficulty stakes, context, and counterparty's stance."
                          value={customDescription}
                          onChange={(e) => setCustomDescription(e.target.value)}
                          rows={2}
                          className="bg-slate-950 border border-slate-850 focus:border-indigo-500 outline-none rounded-xl p-4 text-sm text-slate-100 transition-all resize-none"
                        />
                      </div>

                      {/* Custom Persona 1 configuration */}
                      <div className="border-t border-slate-800 pt-4 mt-2">
                        <h4 className="text-sm font-bold text-indigo-400 flex items-center justify-between">
                          Counterpart Configuration
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-400 font-bold uppercase">Name</label>
                            <input
                              type="text"
                              placeholder="e.g., Sarah"
                              value={persona1Name}
                              onChange={(e) => setPersona1Name(e.target.value)}
                              className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-100"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-400 font-bold uppercase">Relationship</label>
                            <input
                              type="text"
                              placeholder="e.g., Manager"
                              value={persona1Rel}
                              onChange={(e) => setPersona1Rel(e.target.value)}
                              className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-100"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 mt-3">
                          <label className="text-[10px] text-slate-400 font-bold uppercase">Core Prompts / Prompt Instructions</label>
                          <textarea
                            placeholder="e.g., You are Sarah, a stubborn boss who constantly defers review details. Keep responses short."
                            value={persona1Prompt}
                            onChange={(e) => setPersona1Prompt(e.target.value)}
                            rows={2}
                            className="bg-slate-955 border border-slate-850 rounded-lg p-3 text-xs text-slate-100 resize-none"
                          />
                        </div>

                        {/* Trait sliders */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                              <span>Formality: {formality1}%</span>
                              <span className="text-[9px] text-slate-600">{formality1 > 75 ? 'Corporate' : 'Casual'}</span>
                            </div>
                            <input type="range" min="0" max="100" value={formality1} onChange={(e) => setFormality1(Number(e.target.value))} className="w-full accent-indigo-500" />
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                              <span>Verbosity: {verbosity1}%</span>
                              <span className="text-[9px] text-slate-600">{verbosity1 > 75 ? 'Talkative' : 'Laconic'}</span>
                            </div>
                            <input type="range" min="0" max="100" value={verbosity1} onChange={(e) => setVerbosity1(Number(e.target.value))} className="w-full accent-indigo-500" />
                          </div>

                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                              <span>Interruption Freq: {interrupt1}%</span>
                              <span className="text-[9px] text-slate-600">{interrupt1 > 75 ? 'Intrusive' : 'Patient'}</span>
                            </div>
                            <input type="range" min="0" max="100" value={interrupt1} onChange={(e) => setInterrupt1(Number(e.target.value))} className="w-full accent-indigo-500" />
                          </div>

                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                              <span>Emotional Volatility: {volatility1}%</span>
                              <span className="text-[9px] text-slate-600">{volatility1 > 75 ? 'Sensitive' : 'Stoic'}</span>
                            </div>
                            <input type="range" min="0" max="100" value={volatility1} onChange={(e) => setVolatility1(Number(e.target.value))} className="w-full accent-indigo-500" />
                          </div>

                          <div className="flex flex-col gap-1 sm:col-span-2">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                              <span>Starting Tension: {tension1}%</span>
                            </div>
                            <input type="range" min="0" max="100" value={tension1} onChange={(e) => setTension1(Number(e.target.value))} className="w-full accent-indigo-500" />
                          </div>
                        </div>
                      </div>

                      {/* Multi-party second character option */}
                      <div className="border-t border-slate-800 pt-4 mt-2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold text-indigo-400">Multi-Party Simulator (2nd Counterpart)</h4>
                          <button
                            onClick={() => setIncludeSecondPersona(!includeSecondPersona)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                          >
                            {includeSecondPersona ? 'Remove 2nd Person' : 'Add 2nd Person'}
                          </button>
                        </div>

                        {includeSecondPersona && (
                          <div className="animate-in slide-in-from-top-2 duration-200 mt-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-slate-400 font-bold uppercase">Name</label>
                                <input
                                  type="text"
                                  placeholder="e.g., Bob (HR)"
                                  value={persona2Name}
                                  onChange={(e) => setPersona2Name(e.target.value)}
                                  className="bg-slate-955 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-100"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-slate-400 font-bold uppercase">Relationship</label>
                                <input
                                  type="text"
                                  placeholder="e.g., HR Rep"
                                  value={persona2Rel}
                                  onChange={(e) => setPersona2Rel(e.target.value)}
                                  className="bg-slate-955 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-100"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col gap-1 mt-3">
                              <label className="text-[10px] text-slate-400 font-bold uppercase">Prompt Instructions</label>
                              <textarea
                                placeholder="e.g., You are Bob, a mediator. Keep responses neutral and policy focused."
                                value={persona2Prompt}
                                onChange={(e) => setPersona2Prompt(e.target.value)}
                                rows={2}
                                className="bg-slate-955 border border-slate-850 rounded-lg p-3 text-xs text-slate-100 resize-none"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-400">Formality: {formality2}%</label>
                                <input type="range" min="0" max="100" value={formality2} onChange={(e) => setFormality2(Number(e.target.value))} className="w-full accent-indigo-500" />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-400">Verbosity: {verbosity2}%</label>
                                <input type="range" min="0" max="100" value={verbosity2} onChange={(e) => setVerbosity2(Number(e.target.value))} className="w-full accent-indigo-500" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Custom objectives configuration */}
                      <div className="border-t border-slate-800 pt-4 mt-2">
                        <label className="text-xs font-semibold text-slate-350 block mb-2">Scenario Objectives (To check off dynamically)</label>
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            placeholder="Objective 1: e.g. State your request clearly"
                            value={customObj1}
                            onChange={(e) => setCustomObj1(e.target.value)}
                            className="bg-slate-955 border border-slate-850 focus:border-indigo-500 outline-none rounded-xl px-4 py-2 text-xs text-slate-200 transition-all"
                          />
                          <input
                            type="text"
                            placeholder="Objective 2: e.g. Listen and acknowledge budget details"
                            value={customObj2}
                            onChange={(e) => setCustomObj2(e.target.value)}
                            className="bg-slate-955 border border-slate-850 focus:border-indigo-500 outline-none rounded-xl px-4 py-2 text-xs text-slate-200 transition-all"
                          />
                          <input
                            type="text"
                            placeholder="Objective 3: e.g. Agree on a future review date"
                            value={customObj3}
                            onChange={(e) => setCustomObj3(e.target.value)}
                            className="bg-slate-955 border border-slate-850 focus:border-indigo-500 outline-none rounded-xl px-4 py-2 text-xs text-slate-200 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Right Side: Setup Summary Card & Share */}
                <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
                    
                    <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                      <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-400" />
                        Flight Configuration
                      </h3>
                      <button
                        onClick={handleGenerateShareLink}
                        className="text-xs text-slate-400 hover:text-slate-250 flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-850"
                        title="Copy share assignment link to clipboard"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-450" /> : <Share2 className="w-3.5 h-3.5" />}
                        {copiedLink ? 'Copied' : 'Assign'}
                      </button>
                    </div>

                    {/* Presets Summary Display */}
                    {!isCustomMode ? (
                      (() => {
                        const preset = scenarios.find(s => s.id === selectedScenarioId);
                        if (!preset) return null;
                        return (
                          <div className="flex flex-col gap-4">
                            <div>
                              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Scenario Title</span>
                              <span className="text-lg font-bold text-white mt-0.5 block">{preset.title}</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Counterpart(s)</span>
                              <div className="flex flex-col gap-2 mt-1.5">
                                {preset.personas.map(p => (
                                  <div key={p.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-850/80 text-xs">
                                    <div className="flex justify-between text-slate-300 font-bold">
                                      <span>{p.name}</span>
                                      <span className="text-[10px] font-medium text-slate-500 italic">({p.relationship})</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">Traits: Formality {p.traits.formality}%, Volatility {p.traits.emotionalVolatility}%</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Persistent memory summaries */}
                            {preset.memory && preset.memory.length > 0 && (
                              <div>
                                <span className="text-[9px] font-bold text-indigo-350 uppercase tracking-widest flex items-center gap-1">
                                  <History className="w-3.5 h-3.5" />
                                  Prior Outcome Memory
                                </span>
                                <ul className="list-disc pl-4 text-[10px] text-indigo-250 mt-1 space-y-1 bg-indigo-950/10 p-2.5 rounded-lg border border-indigo-900/20">
                                  {preset.memory.map((mem, idx) => (
                                    <li key={idx}>"{mem}"</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Active Targets ({preset.objectives.length})</span>
                              <ul className="space-y-1 mt-1.5">
                                {preset.objectives.map((obj, idx) => (
                                  <li key={obj.id} className="text-xs text-indigo-250 flex items-start gap-2">
                                    <span className="text-indigo-400 font-bold shrink-0">{idx + 1}.</span>
                                    {obj.text}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      /* Custom Summary Display */
                      <div className="flex flex-col gap-4">
                        <div>
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Custom Scenario</span>
                          <span className="text-lg font-bold text-white mt-0.5 block">{customTitle || '(Untitled...)'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Counterpart Summary</span>
                          <p className="text-xs text-slate-350 mt-1 leading-normal">
                            {persona1Name ? `${persona1Name} (${persona1Rel || 'Partner'})` : 'Please configure counterpart details.'}
                            {includeSecondPersona && persona2Name && ` & ${persona2Name} (${persona2Rel})`}
                          </p>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Targets Configured</span>
                          <ul className="space-y-1 mt-1.5 text-xs text-indigo-250">
                            {customObj1 && <li>• {customObj1}</li>}
                            {customObj2 && <li>• {customObj2}</li>}
                            {customObj3 && <li>• {customObj3}</li>}
                            {!customObj1 && !customObj2 && !customObj3 && <li className="italic text-slate-550">• State your position and compromise.</li>}
                          </ul>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleStartRehearsal}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group text-sm"
                    >
                      Start Simulator Rehearsal
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}


            {/* REHEARSAL CHAT SCREEN */}
            {step === 'rehearsal' && activeScenario && (
              <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-in fade-in duration-300">
                
                {/* Left Panel: Checklist & Tension (3 cols) */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                  {/* Speakers profile */}
                  <div className="bg-slate-900/70 border border-slate-850 rounded-2xl p-5 flex flex-col gap-3">
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block">Active Speaker counterparts</span>
                    <div className="flex flex-col gap-2">
                      {activeScenario.personas.map((p) => {
                        const isSpeaking = activeSpeakerId === p.id && !refereeMode;
                        return (
                          <div 
                            key={p.id} 
                            className={`p-3 rounded-xl border transition-all flex justify-between items-center ${
                              isSpeaking 
                                ? 'bg-indigo-950/30 border-indigo-500 shadow-sm' 
                                : 'bg-slate-950/60 border-slate-850 text-slate-400'
                            }`}
                          >
                            <div>
                              <h4 className="text-xs font-bold text-white">{p.name}</h4>
                              <span className="text-[10px] text-slate-500 italic block">{p.relationship}</span>
                            </div>
                            {isSpeaking && (
                              <span className="text-[9px] bg-indigo-500 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">
                                Speaking
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Defensiveness Score vertical bar */}
                  <div className="bg-slate-900/70 border border-slate-850 rounded-2xl p-5 flex flex-col gap-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Counterpart Defensiveness</span>
                    
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-850 p-0.5">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            currentTension < 40 ? 'bg-emerald-500' : currentTension < 75 ? 'bg-amber-500' : 'bg-red-500 animate-pulse'
                          }`}
                          style={{ width: `${currentTension}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-200 w-8 text-right">{currentTension}%</span>
                    </div>
                    
                    <span className={`text-[10px] font-bold border rounded-lg px-2.5 py-1 text-center transition-all ${getTensionColor(currentTension)}`}>
                      {currentTension < 40 ? '🟢 Receptive & Open' : currentTension < 75 ? '⚡ Defensive & Guarded' : '🔥 Combat / Stalled'}
                    </span>
                  </div>

                  {/* Objective Checklists */}
                  <div className="bg-slate-900/70 border border-slate-850 rounded-2xl p-5 flex flex-col gap-3 flex-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Dynamic Objectives</span>
                    
                    <ul className="space-y-3 mt-2">
                      {activeScenario.objectives.map((obj, idx) => {
                        const isMet = objectivesMet[obj.id];
                        return (
                          <li 
                            key={obj.id} 
                            className={`flex items-start gap-2.5 p-2 rounded-xl border transition-all ${
                              isMet 
                                ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-300' 
                                : 'bg-slate-955/45 border-slate-850 text-slate-450'
                            }`}
                          >
                            <div className="mt-0.5">
                              {isMet ? (
                                <CheckCircle className="w-4 h-4 text-emerald-450 shrink-0" />
                              ) : (
                                <span className="w-4 h-4 rounded-full border-2 border-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-500 shrink-0">
                                  {idx + 1}
                                </span>
                              )}
                            </div>
                            <span className="text-xs leading-normal font-medium">{obj.text}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <button
                    onClick={handleEndAndGetFeedback}
                    className="w-full bg-emerald-600/10 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 text-emerald-400 font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg text-sm shrink-0"
                  >
                    <Award className="w-4 h-4" />
                    End & Get Coached
                  </button>
                </div>

                {/* Middle Panel: Chat stream and timeline rewinding (6 cols) */}
                <div className="lg:col-span-6 bg-slate-900 border border-slate-850 rounded-3xl flex flex-col overflow-hidden h-[620px] shadow-2xl relative">
                  
                  {/* Chat header */}
                  <div className="bg-slate-950 border-b border-slate-850 px-6 py-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {refereeMode ? `Referee Mode: ${refereeUserAName} vs ${refereeUserBName}` : activeScenario.title}
                      </h4>
                      <span className="text-[10px] text-slate-550 uppercase font-semibold">Active Rehearsal Room</span>
                    </div>

                    {refereeMode && (
                      <div className="text-xs bg-indigo-950/30 border border-indigo-900/30 px-3 py-1 rounded-full text-indigo-400 font-bold">
                        Turn: {currentSpeaker === 'A' ? refereeUserAName : refereeUserBName}
                      </div>
                    )}
                  </div>

                  {/* Messages list */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {messages.map((msg, index) => {
                      const isUser = msg.role === 'user';
                      const isRefLog = msg.text.startsWith('[REFEREE FEEDBACK]');

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isUser ? 'justify-end' : 'justify-start'} group/msg animate-in fade-in duration-200`}
                        >
                          <div className={`max-w-[85%] flex flex-col ${isUser ? 'items-end' : 'items-start'} relative`}>
                            <div className="flex items-center gap-2 mb-1 px-1">
                              <span className="text-[10px] text-slate-500 font-semibold">
                                {msg.activePersonaName || (isUser ? 'You' : 'System')}
                              </span>
                              
                              {!isUser && msg.defensivenessScore !== undefined && !isRefLog && (
                                <span className="text-[9px] text-slate-500 bg-slate-950 border border-slate-850 px-1.5 rounded">
                                  Tension: {msg.defensivenessScore}%
                                </span>
                              )}

                              {/* Timeline Rewind hover button */}
                              <button
                                onClick={() => handleRewind(index)}
                                className="hidden group-hover/msg:flex items-center gap-0.5 text-[9px] text-indigo-400 bg-indigo-950/50 hover:bg-indigo-500 hover:text-white border border-indigo-900/50 hover:border-indigo-500 px-2 py-0.5 rounded-md transition-all shadow"
                                title="Rewind to this message (auto-saves timeline branch)"
                              >
                                <GitCommit className="w-3 h-3" />
                                Rewind here
                              </button>
                            </div>

                            <div className="relative">
                              <div
                                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                  isRefLog
                                    ? 'bg-amber-950/10 border border-amber-900/20 text-amber-300 font-medium'
                                    : isUser
                                      ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-tr-none shadow-md'
                                      : 'bg-slate-800 border border-slate-750 text-slate-200 rounded-tl-none'
                                }`}
                              >
                                {msg.text}
                                
                                {/* Vocal pacing metadata stamp inside chat bubble */}
                                {msg.paceMetric && (
                                  <span className="block text-[9px] text-indigo-200 mt-1 font-semibold italic">
                                    🎤 spoken at {msg.paceMetric.wpm} WPM ({msg.paceMetric.duration}s)
                                  </span>
                                )}
                              </div>

                              {/* Toggle coaching tip icon */}
                              {!isUser && msg.coachingTip && !isRefLog && (
                                <div className="absolute -right-3 -bottom-3 z-10">
                                  <button
                                    type="button"
                                    onClick={() => setShowTipId(showTipId === msg.id ? null : msg.id)}
                                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                                      showTipId === msg.id 
                                        ? 'bg-amber-600 border-amber-500 text-white'
                                        : 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800'
                                    }`}
                                  >
                                    <HelpCircle className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Coach Turn Tips display box */}
                            {!isUser && msg.coachingTip && showTipId === msg.id && (
                              <div className="mt-2.5 w-full bg-amber-955/15 border border-amber-900/30 p-3 rounded-xl text-xs text-amber-300 animate-in slide-in-from-top-1 duration-200">
                                <strong>Coach Tip:</strong> {msg.coachingTip}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {isGeneratingMessage && (
                      <div className="flex justify-start animate-pulse">
                        <div className="flex flex-col items-start max-w-[80%]">
                          <span className="text-[10px] text-slate-500 font-semibold mb-1 px-1">
                            Analyzing statement...
                          </span>
                          <div className="bg-slate-800 border border-slate-750 rounded-2xl px-5 py-3.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}

                    {simError && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>{simError}</div>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleSendMessage} className="bg-slate-950 border-t border-slate-850 p-4 flex gap-3 items-center">
                    {speechToTextSupported && (
                      <div className="flex items-center gap-0 shrink-0">
                        <button
                          type="button"
                          onClick={handleVoiceInputToggle}
                          className={`p-3.5 rounded-xl border border-r-0 rounded-r-none transition-all ${
                            isListening
                              ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                          title="Voice Dictation input"
                        >
                          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSpeechLanguage(speechLanguage === 'en-US' ? 'hi-IN' : 'en-US')}
                          className="px-2.5 py-3.5 bg-slate-900 border border-slate-800 text-[9px] font-extrabold text-indigo-400 hover:text-indigo-300 rounded-xl rounded-l-none transition-all"
                          title="Toggle Speech Recognition Language (English / Hindi)"
                        >
                          {speechLanguage === 'en-US' ? 'EN' : 'हिन्दी'}
                        </button>
                      </div>
                    )}

                    <input
                      type="text"
                      placeholder={
                        isListening 
                          ? "Listening... Speak clearly" 
                          : refereeMode 
                            ? `Type response for ${currentSpeaker === 'A' ? refereeUserAName : refereeUserBName}...`
                            : "Type your response..."
                      }
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      disabled={isGeneratingMessage}
                      className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-550 transition-all disabled:opacity-50"
                    />

                    {!refereeMode && (
                      <button
                        type="button"
                        onClick={handleGetHints}
                        disabled={isGeneratingMessage || isGeneratingHints}
                        className="p-3.5 bg-slate-900 border border-slate-800 text-indigo-400 hover:text-indigo-300 rounded-xl transition-all shrink-0 flex items-center gap-1 text-xs font-bold disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span className="sm:inline hidden">Ask Copilot</span>
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={isGeneratingMessage || !inputVal.trim()}
                      className="p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-md disabled:opacity-50 shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                {/* Right Panel: Live Coach & Copilot Suggestions (3 cols) */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                  <div className="bg-slate-900/70 border border-slate-850 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
                    
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-350 flex items-center gap-1.5 border-b border-slate-850 pb-2">
                      <Smile className="w-4 h-4 text-amber-400 animate-pulse" />
                      Live Coach
                    </h4>
                    
                    <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl text-xs text-slate-350 leading-relaxed min-h-[90px] flex items-center">
                      "{lastCoachingTip}"
                    </div>
                  </div>

                  {showHintModal && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 flex-1 shadow-xl animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Phrasing Suggestions
                        </span>
                        <button onClick={() => setShowHintModal(false)} className="text-xs text-slate-500 hover:text-slate-350">Close</button>
                      </div>

                      {isGeneratingHints && (
                        <div className="flex flex-col items-center justify-center py-10 gap-3 flex-1">
                          <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                          <span className="text-xs text-slate-550">Generating...</span>
                        </div>
                      )}

                      {hintError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-[10px] flex gap-2">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <div>{hintError}</div>
                        </div>
                      )}

                      {copilotHints && !isGeneratingHints && (
                        <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[350px]">
                          <button
                            onClick={() => handleSelectHint(copilotHints.empathetic)}
                            className="text-left p-3 rounded-xl bg-slate-950 border border-slate-850 hover:border-indigo-500/60 transition-all flex flex-col gap-1 hover:bg-slate-950/90 group"
                          >
                            <span className="text-[9px] font-bold text-emerald-450 uppercase flex items-center gap-1">
                              <Smile className="w-3 h-3" />
                              Empathetic Phrasing
                            </span>
                            <p className="text-xs text-slate-300 italic leading-relaxed">"{copilotHints.empathetic}"</p>
                          </button>

                          <button
                            onClick={() => handleSelectHint(copilotHints.assertive)}
                            className="text-left p-3 rounded-xl bg-slate-950 border border-slate-850 hover:border-indigo-500/60 transition-all flex flex-col gap-1 hover:bg-slate-950/90 group"
                          >
                            <span className="text-[9px] font-bold text-indigo-400 uppercase flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Assertive Boundary
                            </span>
                            <p className="text-xs text-slate-300 italic leading-relaxed">"{copilotHints.assertive}"</p>
                          </button>

                          <button
                            onClick={() => handleSelectHint(copilotHints.collaborative)}
                            className="text-left p-3 rounded-xl bg-slate-950 border border-slate-850 hover:border-indigo-500/60 transition-all flex flex-col gap-1 hover:bg-slate-950/90 group"
                          >
                            <span className="text-[9px] font-bold text-purple-400 uppercase flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              Collaborative Pivot
                            </span>
                            <p className="text-xs text-slate-300 italic leading-relaxed">"{copilotHints.collaborative}"</p>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* FINAL COACHING REPORT DASHBOARD */}
            {step === 'dashboard' && (
              <div className="max-w-4xl mx-auto w-full animate-in fade-in duration-300">
                {isGeneratingFeedback && (
                  <div className="flex flex-col items-center justify-center py-20 gap-6">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                    </div>
                    <div className="text-center flex flex-col gap-2">
                      <h3 className="text-lg font-bold text-slate-200">Compiling Report Logs...</h3>
                      <p className="text-sm text-slate-550 font-medium">Gemini is evaluating your pacing and transcript content.</p>
                    </div>
                  </div>
                )}

                {coachError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-3xl flex flex-col gap-4 items-center text-center">
                    <AlertTriangle className="w-10 h-10 text-red-500 animate-bounce" />
                    <div>
                      <h3 className="text-lg font-bold text-white">Analysis Failed</h3>
                      <p className="text-sm text-slate-400 mt-1">{coachError}</p>
                    </div>
                    <button
                      onClick={handleRestart}
                      className="mt-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 font-semibold px-6 py-2.5 rounded-xl transition-all"
                    >
                      Back to Setup
                    </button>
                  </div>
                )}

                {coachingResult && (
                  <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                    <div className="flex justify-between items-end border-b border-slate-900 pb-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs uppercase tracking-wider font-semibold text-emerald-450">Step 3: Analytics Scorecard</span>
                        <h2 className="text-3xl font-extrabold tracking-tight">Your Rehearsal Performance</h2>
                        <p className="text-slate-400 text-xs">
                          Final scorecard overview against {activeScenario?.title}.
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleExportLogs}
                          className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-950/20 border border-indigo-900/30 px-4 py-2.5 rounded-xl transition-all font-bold shadow-sm"
                        >
                          <Download className="w-4 h-4" />
                          Export Flight Log (.md)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                      {/* Left Overall score card */}
                      <div className="md:col-span-4 bg-slate-900 border border-slate-850 rounded-3xl p-6 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-indigo-500" />
                        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Overall Score</span>
                        
                        <div className="my-6 relative flex items-center justify-center">
                          <svg className="w-36 h-36">
                            <circle className="text-slate-800" strokeWidth="6" stroke="currentColor" fill="transparent" r="64" cx="72" cy="72" />
                            <circle className="text-emerald-500" strokeWidth="8" strokeDasharray={2 * Math.PI * 64} strokeDashoffset={2 * Math.PI * 64 * (1 - coachingResult.overallScore / 100)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="64" cx="72" cy="72" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
                          </svg>
                          <div className="absolute text-center">
                            <span className="text-4xl font-extrabold text-white">{coachingResult.overallScore}</span>
                            <span className="text-xs text-slate-550 block">/ 100</span>
                          </div>
                        </div>

                        <span className="text-xs text-emerald-450 font-bold bg-emerald-950/30 border border-emerald-900/30 px-3 py-1 rounded-full block w-full">
                          {coachingResult.overallScore >= 80 ? 'Excellent Handling' : coachingResult.overallScore >= 60 ? 'Moderate Progress' : 'Needs Practice'}
                        </span>
                      </div>

                      {/* Right Feedbacks & metric details */}
                      <div className="md:col-span-8 bg-slate-900 border border-slate-850 rounded-3xl p-6 flex flex-col gap-6 shadow-xl justify-center">
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block">Objective Checklist Success</span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {activeScenario?.objectives.map((obj) => (
                              <div 
                                key={obj.id} 
                                className={`p-2.5 rounded-xl border text-[11px] font-bold flex items-center gap-2 ${
                                  objectivesMet[obj.id] 
                                    ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' 
                                    : 'bg-slate-950/40 border-slate-850/80 text-slate-550 line-through'
                                }`}
                              >
                                {objectivesMet[obj.id] ? (
                                  <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-450" />
                                ) : (
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                                )}
                                <span className="truncate">{obj.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450">Coach's Summary Evaluation</h4>
                          <p className="text-sm text-slate-300 leading-relaxed bg-slate-955/40 p-4 border border-slate-850 rounded-2xl">
                            "{coachingResult.overallFeedback}"
                          </p>
                        </div>

                        {/* Slider Metrics */}
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-300 flex items-center gap-1.5">
                                <Smile className="w-3.5 h-3.5 text-indigo-400" />
                                Empathy & Validation
                              </span>
                              <span className="text-indigo-455">{coachingResult.metrics.empathy.score}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-955 rounded-full overflow-hidden border border-slate-800">
                              <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full" style={{ width: `${coachingResult.metrics.empathy.score}%` }} />
                            </div>
                            <p className="text-[10px] text-slate-450 leading-relaxed">{coachingResult.metrics.empathy.analysis}</p>
                          </div>

                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-300 flex items-center gap-1.5">
                                <HelpCircle className="w-3.5 h-3.5 text-emerald-455" />
                                Clarity, Articulation & Voice Pacing
                              </span>
                              <span className="text-emerald-450">{coachingResult.metrics.clarity.score}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-955 rounded-full overflow-hidden border border-slate-800">
                              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full" style={{ width: `${coachingResult.metrics.clarity.score}%` }} />
                            </div>
                            <p className="text-[10px] text-slate-450 leading-relaxed">{coachingResult.metrics.clarity.analysis}</p>
                          </div>

                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-300 flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                                Assertiveness & Boundaries
                              </span>
                              <span className="text-purple-400">{coachingResult.metrics.assertiveness.score}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-955 rounded-full overflow-hidden border border-slate-800">
                              <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" style={{ width: `${coachingResult.metrics.assertiveness.score}%` }} />
                            </div>
                            <p className="text-[10px] text-slate-450 leading-relaxed">{coachingResult.metrics.assertiveness.analysis}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-3xl p-6 flex flex-col gap-4">
                        <h4 className="text-xs font-bold text-emerald-450 uppercase tracking-wider flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          What Went Well
                        </h4>
                        <ul className="space-y-3">
                          {coachingResult.strengths.map((item, idx) => (
                            <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-indigo-950/10 border border-indigo-900/30 rounded-3xl p-6 flex flex-col gap-4">
                        <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Suggestions for Growth
                        </h4>
                        <ul className="space-y-3">
                          {coachingResult.improvements.map((item, idx) => (
                            <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex justify-center mt-4">
                      <button
                        onClick={handleRestart}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg transition-all flex items-center gap-2 text-sm animate-bounce"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Configure New Flight Rehearsal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}


        {/* ================================== TABS 2: BRANCH COMPARISON PANEL ================================== */}
        {navTab === 'branches' && (
          <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">Analysis Sandbox</span>
              <h2 className="text-3xl font-extrabold tracking-tight">Timeline Branch Comparison</h2>
              <p className="text-slate-455 text-sm">
                Whenever you rewind a timeline, the system automatically saves the abandoned path. Select two paths below to compare transcripts and scores.
              </p>
            </div>

            {savedBranches.length < 2 ? (
              <div className="bg-slate-900/50 border border-slate-900 rounded-3xl p-12 text-center flex flex-col items-center gap-4">
                <GitCommit className="w-12 h-12 text-slate-650" />
                <div>
                  <h3 className="text-lg font-bold text-slate-300">Awaiting Timeline Branches</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Start a rehearsal session, converse, and then use the **Rewind here** button to fork your timeline. Erased lines are automatically preserved here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Selectors grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-850">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Select Primary Branch (A)</label>
                    <select
                      value={compareBranchId1}
                      onChange={(e) => setCompareBranchId1(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:border-indigo-500 text-slate-100"
                    >
                      <option value="">-- Choose Branch A --</option>
                      {savedBranches.map(b => (
                        <option key={b.id} value={b.id}>{b.scenarioTitle} - {b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Select Comparison Branch (B)</label>
                    <select
                      value={compareBranchId2}
                      onChange={(e) => setCompareBranchId2(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:border-indigo-500 text-slate-100"
                    >
                      <option value="">-- Choose Branch B --</option>
                      {savedBranches.map(b => (
                        <option key={b.id} value={b.id}>{b.scenarioTitle} - {b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Comparative View panels */}
                {(() => {
                  const bA = savedBranches.find(b => b.id === compareBranchId1);
                  const bB = savedBranches.find(b => b.id === compareBranchId2);

                  if (!bA || !bB) {
                    return (
                      <div className="bg-slate-900/30 border border-slate-900 p-8 text-center text-xs text-slate-500 rounded-2xl">
                        Select two branches above to analyze the scorecard delta.
                      </div>
                    );
                  }

                  const scoreDelta = (bB.coachingResult?.overallScore || 0) - (bA.coachingResult?.overallScore || 0);

                  return (
                    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                      
                      {/* Score Comparison Delta banner */}
                      <div className="bg-indigo-950/20 border border-indigo-900/30 p-5 rounded-2xl flex items-center justify-between shadow">
                        <div className="flex items-center gap-3">
                          <Award className="w-8 h-8 text-indigo-400" />
                          <div>
                            <h4 className="text-sm font-bold text-white">Score Delta Analysis</h4>
                            <p className="text-xs text-slate-400 mt-0.5">Comparing performance values between conversational paths.</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-3xl font-extrabold ${scoreDelta >= 0 ? 'text-emerald-450' : 'text-red-400'}`}>
                            {scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta}
                          </span>
                          <span className="text-xs text-slate-500 block">points diff</span>
                        </div>
                      </div>

                      {/* Transcripts side-by-side */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Branch A Column */}
                        <div className="bg-slate-900 border border-slate-850 rounded-3xl p-5 flex flex-col gap-4 shadow">
                          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-bold text-slate-200">Branch A: {bA.name.split(' - ')[0]}</h4>
                              <span className="text-[10px] text-slate-550 block">{bA.timestamp}</span>
                            </div>
                            <span className="text-lg font-extrabold text-indigo-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                              {bA.coachingResult?.overallScore || 'Unscored'}
                            </span>
                          </div>

                          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-3 bg-slate-950/30 p-3 rounded-xl border border-slate-850/50">
                            {bA.messages.map((m, idx) => (
                              <div key={idx} className="text-xs leading-relaxed">
                                <span className="font-bold text-slate-400">{m.activePersonaName || 'User'}: </span>
                                <span className="text-slate-300">"{m.text}"</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Branch B Column */}
                        <div className="bg-slate-900 border border-slate-850 rounded-3xl p-5 flex flex-col gap-4 shadow">
                          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-bold text-slate-200">Branch B: {bB.name.split(' - ')[0]}</h4>
                              <span className="text-[10px] text-slate-550 block">{bB.timestamp}</span>
                            </div>
                            <span className="text-lg font-extrabold text-indigo-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                              {bB.coachingResult?.overallScore || 'Unscored'}
                            </span>
                          </div>

                          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-3 bg-slate-955/30 p-3 rounded-xl border border-slate-850/50">
                            {bB.messages.map((m, idx) => (
                              <div key={idx} className="text-xs leading-relaxed">
                                <span className="font-bold text-slate-400">{m.activePersonaName || 'User'}: </span>
                                <span className="text-slate-300">"{m.text}"</span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })()}

              </div>
            )}

          </div>
        )}


        {/* ================================== TABS 3: SESSION HISTORY & ANALYTICS ================================== */}
        {navTab === 'history' && (
          <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">Progression</span>
              <h2 className="text-3xl font-extrabold tracking-tight">Session History & Analytics</h2>
              <p className="text-slate-455 text-sm">
                Track how your communication metrics improve across multiple runs and evaluate pacing consistency.
              </p>
            </div>

            {historyList.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-900 rounded-3xl p-12 text-center flex flex-col items-center gap-4">
                <History className="w-12 h-12 text-slate-650" />
                <div>
                  <h3 className="text-lg font-bold text-slate-300">No Rehearsal History Yet</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Your completed conversation scorecards and pacing analytics will compile here to track progress.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Left Side: Score Trends Chart & Metrics */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                  {/* Aggregated Score Card */}
                  <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 flex flex-col gap-3 text-center shadow">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Average Dashboard Score</span>
                    <span className="text-5xl font-extrabold text-emerald-450 my-2">{getAverageHistoryScore()}</span>
                    <p className="text-[10px] text-slate-500 leading-normal">Compiled across {historyList.length} coaching evaluations.</p>
                  </div>

                  {/* Simple Custom SVG progression chart */}
                  <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 flex flex-col gap-3 shadow">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Score Progression Trend</span>
                    
                    <div className="h-36 w-full flex items-end justify-between gap-1 pt-4 border-b border-slate-800">
                      {historyList.slice(0, 10).reverse().map((run, idx) => (
                        <div key={run.id || idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                          {/* Score tooltip */}
                          <span className="absolute -top-4 text-[9px] font-bold text-indigo-400 bg-slate-950 px-1 rounded border border-slate-800 opacity-0 group-hover:opacity-100 transition-all">
                            {run.score}
                          </span>
                          <div 
                            className="w-full bg-indigo-500/80 group-hover:bg-indigo-500 rounded-t transition-all" 
                            style={{ height: `${run.score}%` }} 
                          />
                          <span className="text-[8px] text-slate-550 block mt-1.5 truncate w-full text-center">{run.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: Scorecard History logs overview */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <h3 className="text-base font-bold text-slate-200">Historical Runs</h3>
                  
                  <div className="flex flex-col gap-3">
                    {historyList.map((run) => (
                      <div 
                        key={run.id} 
                        className="bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-2xl p-5 flex items-start justify-between transition-all gap-4 shadow"
                      >
                        <div className="flex flex-col gap-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{run.scenarioTitle}</span>
                            <span className="text-[9px] text-slate-550 border border-slate-800 px-1.5 rounded flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              {run.date}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 italic">
                            "{run.feedback}"
                          </p>
                          
                          {/* Metrics logs breakdown */}
                          <div className="flex gap-4 mt-2">
                            <span className="text-[9px] text-slate-500">Empathy: <strong className="text-indigo-400">{run.metrics?.empathy?.score ?? 50}%</strong></span>
                            <span className="text-[9px] text-slate-500">Clarity: <strong className="text-emerald-450">{run.metrics?.clarity?.score ?? 50}%</strong></span>
                            <span className="text-[9px] text-slate-500">Assertiveness: <strong className="text-purple-400">{run.metrics?.assertiveness?.score ?? 50}%</strong></span>
                          </div>
                        </div>

                        <div className="text-lg font-extrabold text-indigo-400 bg-slate-950 border border-slate-850 px-3 py-2 rounded-xl shrink-0 self-center">
                          {run.score}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-550 mt-auto">
        <p>© 2026 EchoPersona. Rehearse with AI. Practice safely, execute confidently.</p>
      </footer>
    </div>
  );
}
