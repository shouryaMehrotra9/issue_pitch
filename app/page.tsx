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
  Check,
  Eye,
  Heart,
  TrendingDown,
  Lock,
  Layers,
  ChevronLeft,
  Flame,
  FileText
} from 'lucide-react';

// Scenario preset data structure containing OCEAN and Hidden Objectives
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
      { id: 'timeline', text: 'Secure a commitment for a specific future review date' },
      { id: 'alternative_bonus', text: 'Propose a performance-linked bonus if base salary increase is capped' }
    ],
    hiddenObjectives: [
      { id: 'precedent', text: 'Avoid creating a compensation precedent for other employees' },
      { id: 'confidence', text: 'Assess the employee\'s confidence under negotiation pressure' }
    ],
    personas: [
      {
        id: 'sarah-manager',
        name: 'Sarah (The Dismissive Boss)',
        relationship: 'Manager',
        prompt: `You are Sarah, a corporate manager. You are defensive, evasive, and constantly redirect to company budget constraints.`,
        traits: { 
          formality: 85, verbosity: 40, interruptionFrequency: 70, emotionalVolatility: 60, startingTension: 70,
          openness: 40, conscientiousness: 80, extraversion: 30, agreeableness: 20, neuroticism: 70
        }
      },
      {
        id: 'bob-hr',
        name: 'Bob (The Corporate HR)',
        relationship: 'HR Representative',
        prompt: `You are Bob, an HR representative mediating the salary discussion. You are neutral, formal, and policy-driven.`,
        traits: { 
          formality: 95, verbosity: 30, interruptionFrequency: 20, emotionalVolatility: 10, startingTension: 30,
          openness: 50, conscientiousness: 90, extraversion: 40, agreeableness: 60, neuroticism: 20
        }
      }
    ]
  },
  {
    id: 'guilt-tripper-scenario',
    title: 'Weekend Border Dispute',
    scenario: 'Setting Boundaries',
    description: 'Alex wants you to spend the weekend at a family gathering, while you desperately need solo time to avoid burnout.',
    objective: 'Hold your ground and set a boundary to stay home without apologizing excessively or giving in.',
    objectives: [
      { id: 'boundary', text: 'Clearly state your need to stay home without over-apologizing' },
      { id: 'validate', text: 'Validate Alex\'s feelings and confirm your care for them' },
      { id: 'alternative', text: 'Propose a specific alternative way to connect later' },
      { id: 'deescalation', text: 'De-escalate emotional tension by keeping your tone calm and steady' }
    ],
    hiddenObjectives: [
      { id: 'conflict', text: 'Avoid direct conflict/shouting while setting the boundary' },
      { id: 'commitment', text: 'Test user\'s romantic commitment to the relationship' }
    ],
    personas: [
      {
        id: 'alex-partner',
        name: 'Alex (The Guilt-Tripping Partner)',
        relationship: 'Partner',
        prompt: `You are Alex, the user's romantic partner. You are hurt, passive-aggressive, and try to guilt-trip them.`,
        traits: { 
          formality: 20, verbosity: 50, interruptionFrequency: 60, emotionalVolatility: 90, startingTension: 60,
          openness: 60, conscientiousness: 40, extraversion: 70, agreeableness: 30, neuroticism: 80
        }
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
      { id: 'protection', text: 'Reassure him that his capital and dilution are respected' },
      { id: 'milestone', text: 'Propose clear 30-day product milestones to prove pivot traction' }
    ],
    hiddenObjectives: [
      { id: 'conviction', text: 'Evaluate the founder\'s internal conviction in the new strategy' },
      { id: 'risk', text: 'Minimize further downside capital risks for this quarter' }
    ],
    personas: [
      {
        id: 'marcus-vc',
        name: 'Marcus (The Skeptical VC)',
        relationship: 'Lead Investor',
        prompt: `You are Marcus, a seasoned venture capitalist. You are impatient, skeptical, data-driven, and query retention metrics.`,
        traits: { 
          formality: 70, verbosity: 35, interruptionFrequency: 80, emotionalVolatility: 50, startingTension: 80,
          openness: 70, conscientiousness: 85, extraversion: 60, agreeableness: 20, neuroticism: 60
        }
      },
      {
        id: 'helen-angel',
        name: 'Helen (The Soft Angel)',
        relationship: 'Co-Investor',
        prompt: `You are Helen, an angel investor who co-invested. You are supportive of the founder but worried about Marcus backing out.`,
        traits: { 
          formality: 60, verbosity: 45, interruptionFrequency: 30, emotionalVolatility: 30, startingTension: 40,
          openness: 80, conscientiousness: 70, extraversion: 50, agreeableness: 70, neuroticism: 30
        }
      }
    ]
  },
  {
    id: 'angry-client-scenario',
    title: 'Client Retention Crisis',
    scenario: 'Retaining a Key Client',
    description: 'De-escalate David from Acme Corp, who is angry about service delays and threatening to cancel their annual contract.',
    objective: 'Reassure the client, explain correctives transparently, and negotiate a contract renewal.',
    objectives: [
      { id: 'apology', text: 'Sincerely acknowledge onboarding delays and take ownership' },
      { id: 'remedy', text: 'Explain the concrete corrective engineering steps being taken' },
      { id: 'renewal', text: 'Secure a renewal commitment, offering at most a 1-month credit extension' },
      { id: 'monitoring', text: 'Propose a weekly client-success review call to track deployment progress' }
    ],
    hiddenObjectives: [
      { id: 'discount', text: 'Avoid giving discount rate concessions higher than 15% on the main rate' },
      { id: 'satisfaction', text: 'Assess customer satisfaction with the core software product features' }
    ],
    personas: [
      {
        id: 'david-client',
        name: 'David (The Angry Client)',
        relationship: 'Key Client Director',
        prompt: `You are David, a director at Acme Corp. You are extremely frustrated about onboarding delays, impatient, and demanding contract termination.`,
        traits: { 
          formality: 75, verbosity: 45, interruptionFrequency: 60, emotionalVolatility: 80, startingTension: 85,
          openness: 50, conscientiousness: 70, extraversion: 60, agreeableness: 30, neuroticism: 70
        }
      }
    ]
  },
  {
    id: 'landlord-maintenance',
    title: 'Landlord Repair Dispute',
    scenario: 'Living & Housing',
    description: 'Request Mr. Henderson to fix a leaking roof and black mold in your bathroom, which he has been ignoring for two weeks.',
    objective: 'Secure a firm commitment to send a plumber within 48 hours without getting your rent raised.',
    objectives: [
      { id: 'mold', text: 'Clearly state the mold hazard and health implications' },
      { id: 'rights', text: 'Reference the tenant rights clause or safety regulations' },
      { id: 'date', text: 'Request a specific date and time for the maintenance visit' },
      { id: 'firmness', text: 'Maintain a firm, respectful tone without threatening legal action prematurely' }
    ],
    hiddenObjectives: [
      { id: 'self_pay', text: 'Avoid offering to pay for the repairs yourself' },
      { id: 'formal', text: 'Keep the conversation formal to prevent personal deflection' }
    ],
    personas: [
      {
        id: 'henderson-landlord',
        name: 'Mr. Henderson (The Evasive Landlord)',
        relationship: 'Landlord',
        prompt: `You are Mr. Henderson, a landlord. You are cheap, make excuses about maintenance costs, and try to blame the tenant for bathroom ventilation issues.`,
        traits: {
          formality: 50, verbosity: 40, interruptionFrequency: 50, emotionalVolatility: 60, startingTension: 50,
          openness: 30, conscientiousness: 40, extraversion: 50, agreeableness: 30, neuroticism: 60
        }
      }
    ]
  },
  {
    id: 'employee-termination',
    title: 'Employee Termination Meeting',
    scenario: 'Workplace Leadership',
    description: 'Fire your direct report Kevin for repeated performance lapses and missing critical project deadlines, despite prior warnings.',
    objective: 'Deliver the termination clearly, explain severance terms, and retrieve company equipment without escalating conflict.',
    objectives: [
      { id: 'clear_firing', text: 'State the termination decision clearly in the first three sentences' },
      { id: 'metrics', text: 'Reference past warning documents and metrics objectively' },
      { id: 'severance', text: 'Explain the severance package and health insurance transition' },
      { id: 'equipment', text: 'Set a deadline for returning the company laptop and badges' }
    ],
    hiddenObjectives: [
      { id: 'apology', text: 'Avoid apologizing or saying "I\'m sorry" (to mitigate legal liability)' },
      { id: 'neutrality', text: 'Remain neutral when Kevin gets emotional or begs for another chance' }
    ],
    personas: [
      {
        id: 'kevin-employee',
        name: 'Kevin (The Underperforming Employee)',
        relationship: 'Direct Report',
        prompt: `You are Kevin, an employee being let go. You are shocked, defensive, blame team communication problems, and beg to keep your job.`,
        traits: {
          formality: 40, verbosity: 60, interruptionFrequency: 40, emotionalVolatility: 80, startingTension: 70,
          openness: 40, conscientiousness: 30, extraversion: 60, agreeableness: 45, neuroticism: 75
        }
      }
    ]
  },
  {
    id: 'peer-feedback',
    title: 'Peer Performance Review',
    scenario: 'Management & Leadership',
    description: 'Give constructive feedback to Maya, who is a great coder but behaves aggressively in team meetings and shuts down others\' ideas.',
    objective: 'Help Maya acknowledge her behavior and agree to a collaborative communication plan.',
    objectives: [
      { id: 'appreciate', text: 'Acknowledge Maya\'s strong technical contributions first' },
      { id: 'incidents', text: 'Describe specific meeting incidents where she interrupted peers' },
      { id: 'impact', text: 'Explain the negative impact of her communication style on team morale' },
      { id: 'followup', text: 'Mutually agree to a weekly feedback check-in' }
    ],
    hiddenObjectives: [
      { id: 'firmness', text: 'Do not back down on the feedback when she gets defensive' },
      { id: 'behavior', text: 'Keep the focus on behavior rather than attacking her personality' }
    ],
    personas: [
      {
        id: 'maya-engineer',
        name: 'Maya (The Defensive Rock Star)',
        relationship: 'Senior Engineer Colleague',
        prompt: `You are Maya, a senior engineer. You believe you are just being direct and efficient, and feel others are too sensitive or slow.`,
        traits: {
          formality: 60, verbosity: 50, interruptionFrequency: 70, emotionalVolatility: 70, startingTension: 60,
          openness: 60, conscientiousness: 80, extraversion: 65, agreeableness: 25, neuroticism: 55
        }
      }
    ]
  },
  {
    id: 'unpaid-debt',
    title: 'Unpaid Debt Confrontation',
    scenario: 'Personal Relationships',
    description: 'Confront your close friend Dan about the $500 he borrowed three months ago to pay his rent, which he has not returned despite promises.',
    objective: 'Secure a repayment schedule/timeline without ruining the friendship.',
    objectives: [
      { id: 'friendship', text: 'Express the value of the friendship before mentioning the money' },
      { id: 'details', text: 'Clearly state the exact amount ($500) and the original agreement date' },
      { id: 'installments', text: 'Propose a flexible payment plan (e.g., installments) if he is tight on cash' },
      { id: 'firm_date', text: 'Get a firm date for the first repayment installment' }
    ],
    hiddenObjectives: [
      { id: 'waive', text: 'Do not agree to waive the debt or write it off' },
      { id: 'boundaries', text: 'Maintain boundaries if Dan attempts to guilt-trip you about his financial situation' }
    ],
    personas: [
      {
        id: 'dan-friend',
        name: 'Dan (The Forgetful Friend)',
        relationship: 'Close Friend',
        prompt: `You are Dan, the user's friend. You feel embarrassed about your money issues, try to change the subject, and ask for more time.`,
        traits: {
          formality: 20, verbosity: 55, interruptionFrequency: 40, emotionalVolatility: 50, startingTension: 45,
          openness: 55, conscientiousness: 35, extraversion: 70, agreeableness: 60, neuroticism: 60
        }
      }
    ]
  },
  {
    id: 'holiday-boundary',
    title: 'Holiday Family Boundary',
    scenario: 'Family Boundaries',
    description: 'Tell your mother Linda that you will not be coming home for Thanksgiving this year because you need to rest and avoid travel stress.',
    objective: 'Hold your boundary to stay home while assuring Linda of your love and proposing an alternative holiday call.',
    objectives: [
      { id: 'decision', text: 'State your decision clearly without making elaborate excuses' },
      { id: 'validate_linda', text: 'Validate her disappointment and desire to see you' },
      { id: 'alternative_call', text: 'Offer a specific day and time to do a video call during the holiday' },
      { id: 'calmness', text: 'Remain calm and firm when she uses family pressure or guilt-trips' }
    ],
    hiddenObjectives: [
      { id: 'stick', text: 'Avoid changing your mind or agreeing to visit "just for a day"' },
      { id: 'defuse', text: 'Defuse accusations of neglecting the family by reiterating your love' }
    ],
    personas: [
      {
        id: 'linda-mother',
        name: 'Linda (The Guilt-Tripping Mother)',
        relationship: 'Mother',
        prompt: `You are Linda, the user's mother. You are hurt, emphasize family tradition, and use guilt-tripping to make them feel selfish.`,
        traits: {
          formality: 30, verbosity: 65, interruptionFrequency: 50, emotionalVolatility: 75, startingTension: 55,
          openness: 45, conscientiousness: 70, extraversion: 60, agreeableness: 50, neuroticism: 70
        }
      }
    ]
  },
  {
    id: 'romantic-breakup',
    title: 'Romantic Breakup Discussion',
    scenario: 'Romantic Relationships',
    description: 'Break up with your partner of 8 months, Chloe. You feel your values and future directions do not align.',
    objective: 'Deliver the break-up decision clearly and respectfully, handle her reaction with empathy, and establish a clean boundary.',
    objectives: [
      { id: 'break_decision', text: 'State the decision to end the relationship directly and clearly' },
      { id: 'incompatibility', text: 'Frame the decision around incompatibility rather than blaming her' },
      { id: 'appreciation', text: 'Express genuine appreciation for the time spent together' },
      { id: 'contact_boundary', text: 'Set clear boundaries regarding contact/space moving forward' }
    ],
    hiddenObjectives: [
      { id: 'negotiation', text: 'Do not agree to "try again" or take a temporary break' },
      { id: 'no_circle', text: 'Avoid getting drawn into a circular argument about past mistakes' }
    ],
    personas: [
      {
        id: 'chloe-partner',
        name: 'Chloe (The Heartbroken Partner)',
        relationship: 'Partner',
        prompt: `You are Chloe. You are deeply hurt, shocked, try to negotiate to stay together, and ask what you did wrong.`,
        traits: {
          formality: 20, verbosity: 50, interruptionFrequency: 35, emotionalVolatility: 80, startingTension: 70,
          openness: 60, conscientiousness: 50, extraversion: 65, agreeableness: 45, neuroticism: 80
        }
      }
    ]
  },
  {
    id: 'deadline-renegotiation',
    title: 'Project Deadline Renegotiation',
    scenario: 'Professional Operations',
    description: 'Inform client representative Rachel that the website development project needs a 2-week extension due to late asset deliveries.',
    objective: 'Secure the 2-week extension without incurring financial penalties or losing the client\'s trust.',
    objectives: [
      { id: 'delays', text: 'Detail the specific delayed assets from the client\'s side' },
      { id: 'milestones', text: 'Propose a new, realistic milestone schedule for the 2-week extension' },
      { id: 'quality_risk', text: 'Highlight the risk of reduced quality if rushed without the extension' },
      { id: 'commitment', text: 'Reaffirm your commitment to the project\'s success' }
    ],
    hiddenObjectives: [
      { id: 'no_blame', text: 'Avoid taking responsibility for delays caused entirely by their team' },
      { id: 'discount_limit', text: 'Resist offering a discount on the final invoice' }
    ],
    personas: [
      {
        id: 'rachel-client',
        name: 'Rachel (The Impatient Client)',
        relationship: 'Client Representative',
        prompt: `You are Rachel, a client representative. You are under pressure from your bosses, impatient about marketing launch dates, and angry about delays.`,
        traits: {
          formality: 70, verbosity: 40, interruptionFrequency: 60, emotionalVolatility: 65, startingTension: 75,
          openness: 40, conscientiousness: 75, extraversion: 55, agreeableness: 35, neuroticism: 65
        }
      }
    ]
  },
  {
    id: 'roommate-chore',
    title: 'Roommate Cleanliness Conflict',
    scenario: 'Shared Living',
    description: 'Confront roommate Sam about dirty dishes stacking up in the sink and failure to clean shared spaces.',
    objective: 'Agree on a structured, weekly chore schedule and boundary lines for shared space cleanliness.',
    objectives: [
      { id: 'dishes', text: 'Point out the dishes and kitchen mess without using accusatory language' },
      { id: 'understand', text: 'Acknowledge his busy schedule or work hours to show understanding' },
      { id: 'chart', text: 'Propose a written, shared weekly chore chart' },
      { id: 'quick_clean', text: 'Get a verbal commitment to clean personal dishes within 24 hours of use' }
    ],
    hiddenObjectives: [
      { id: 'no_volunteer', text: 'Do not volunteer to clean his share of the mess to keep the peace' },
      { id: 'chores_only', text: 'Stay focused on the kitchen/chores and don\'t bring up unrelated historical issues' }
    ],
    personas: [
      {
        id: 'sam-roommate',
        name: 'Sam (The Laid-back Roommate)',
        relationship: 'Roommate',
        prompt: `You are Sam, the user's roommate. You are relaxed, feel the user is slightly uptight about cleanliness, and make excuses about being too busy or tired.`,
        traits: {
          formality: 15, verbosity: 45, interruptionFrequency: 30, emotionalVolatility: 40, startingTension: 35,
          openness: 50, conscientiousness: 30, extraversion: 50, agreeableness: 55, neuroticism: 40
        }
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
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
}

interface Scenario {
  id: string;
  title: string;
  scenario: string;
  description: string;
  objective: string;
  objectives: { id: string; text: string }[];
  hiddenObjectives: { id: string; text: string }[];
  personas: Persona[];
  memory?: string[];
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  activePersonaId?: string;
  activePersonaName?: string;
  coachingTip?: string;
  defensivenessScore?: number;
  trustScore?: number;
  cooperationScore?: number;
  confidenceScore?: number;
  internalThought?: string;
  tactics?: string[];
  objectivesMetSnapshot?: Record<string, boolean>;
  paceMetric?: { wpm: number; duration: number };
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
  timelineSummary?: string;
  hiddenObjectivesAnalysis?: { id: string; met: boolean; explanation: string }[];
  sportsCommentary?: { turnIndex: number; comment: string }[];
  optimalPath?: { userIndex: number; optimalResponse: string; reasoning: string; expectedOutcome: string }[];
}

interface CopilotHints {
  empathetic: string;
  assertive: string;
  collaborative: string;
}

const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
};

export default function Home() {
  // Auth & Session state
  const [googleClientId, setGoogleClientId] = useState<string>('1067280456107-p352qf8eimf4b23q1dgg3h1epd34dggq.apps.googleusercontent.com');
  const [userSession, setUserSession] = useState<{ email: string; name: string; picture: string } | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  // Global Tabs: 'simulator' | 'branches' | 'history' | 'drills' | 'skilltree' | 'marketplace' | 'enterprise' | 'certifications' | 'pricing'
  const [navTab, setNavTab] = useState<'simulator' | 'branches' | 'history' | 'drills' | 'skilltree' | 'marketplace' | 'enterprise' | 'certifications' | 'pricing'>('simulator');
  
  // Simulator Steps: 'setup' | 'rehearsal' | 'dashboard'
  const [step, setStep] = useState<'setup' | 'rehearsal' | 'dashboard'>('setup');
  
  // Demo Mode parameters for quick pitch presentation
  const [demoActive, setDemoActive] = useState<boolean>(false);

  // General state
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('dismissive-boss-scenario');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Combative'>('Medium');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Custom scenario editor state
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [customObjective, setCustomObjective] = useState<string>('');
  const [customObj1, setCustomObj1] = useState<string>('');
  const [customObj2, setCustomObj2] = useState<string>('');
  const [customObj3, setCustomObj3] = useState<string>('');
  const [customHiddenObj1, setCustomHiddenObj1] = useState<string>('');
  const [customHiddenObj2, setCustomHiddenObj2] = useState<string>('');

  // Custom persona state with OCEAN sliders
  const [persona1Name, setPersona1Name] = useState<string>('');
  const [persona1Rel, setPersona1Rel] = useState<string>('');
  const [persona1Prompt, setPersona1Prompt] = useState<string>('');
  const [formality1, setFormality1] = useState<number>(50);
  const [verbosity1, setVerbosity1] = useState<number>(50);
  const [interrupt1, setInterrupt1] = useState<number>(50);
  const [volatility1, setVolatility1] = useState<number>(50);
  const [tension1, setTension1] = useState<number>(50);
  
  // Big Five (OCEAN) custom sliders
  const [openness1, setOpenness1] = useState<number>(50);
  const [conscientiousness1, setConscientiousness1] = useState<number>(50);
  const [extraversion1, setExtraversion1] = useState<number>(50);
  const [agreeableness1, setAgreeableness1] = useState<number>(50);
  const [neuroticism1, setNeuroticism1] = useState<number>(50);

  // Second persona states
  const [includeSecondPersona, setIncludeSecondPersona] = useState<boolean>(false);
  const [persona2Name, setPersona2Name] = useState<string>('');
  const [persona2Rel, setPersona2Rel] = useState<string>('');
  const [persona2Prompt, setPersona2Prompt] = useState<string>('');
  const [formality2, setFormality2] = useState<number>(50);
  const [verbosity2, setVerbosity2] = useState<number>(50);
  const [openness2, setOpenness2] = useState<number>(50);
  const [agreeableness2, setAgreeableness2] = useState<number>(50);

  // Referee Mode state
  const [refereeMode, setRefereeMode] = useState<boolean>(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<'A' | 'B'>('A');
  const [refereeUserAName, setRefereeUserAName] = useState<string>('Employee');
  const [refereeUserBName, setRefereeUserBName] = useState<string>('Manager');
  const [coachAssistantEnabled, setCoachAssistantEnabled] = useState<boolean>(true);

  // Simulation cockpit parameters
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [isGeneratingMessage, setIsGeneratingMessage] = useState<boolean>(false);
  const [simError, setSimError] = useState<string | null>(null);
  
  const [objectivesMet, setObjectivesMet] = useState<Record<string, boolean>>({});
  const [currentTension, setCurrentTension] = useState<number>(50);
  const [lastCoachingTip, setLastCoachingTip] = useState<string>('Simulator active. Open the dialogue.');
  const [activeSpeakerId, setActiveSpeakerId] = useState<string>('');
  const [showTipId, setShowTipId] = useState<string | null>(null);

  // V3 specific states
  const [selectedMindsetIndex, setSelectedMindsetIndex] = useState<number>(-1); // for Turn Thought Reveal
  const [showMindsetModal, setShowMindsetModal] = useState<boolean>(false);

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
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [savedBranches, setSavedBranches] = useState<SavedBranch[]>([]);
  
  // Branch Comparison states
  const [compareBranchId1, setCompareBranchId1] = useState<string>('');
  const [compareBranchId2, setCompareBranchId2] = useState<string>('');

  // Coaching final report states
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState<boolean>(false);
  const [coachingResult, setCoachingResult] = useState<CoachingResult | null>(null);
  const [coachError, setCoachError] = useState<string | null>(null);

  // M6: Objection Drill Trainer States
  const [activeDrillTopic, setActiveDrillTopic] = useState<string>('');
  const [drillObjectionText, setDrillObjectionText] = useState<string>('');
  const [isGeneratingDrill, setIsGeneratingDrill] = useState<boolean>(false);
  const [drillFeedback, setDrillFeedback] = useState<string>('');
  const [drillScore, setDrillScore] = useState<number | null>(null);
  const [drillHistoryCount, setDrillHistoryCount] = useState<number>(0);

  // M11: Scenario Marketplace Mock scenarios
  const [marketplaceScenarios, setMarketplaceScenarios] = useState<any[]>([
    { id: 'm1', title: 'Crisis management pitch', category: 'Career', rating: 4.8, author: 'AlexD', cloned: false },
    { id: 'm2', title: 'Managing underperformance feedback', category: 'Leadership', rating: 4.9, author: 'SarahK', cloned: false },
    { id: 'm3', title: 'Aggressive pricing confrontation', category: 'Sales', rating: 4.7, author: 'DavidR', cloned: false },
    { id: 'm4', title: 'Trust boundary reconstruction', category: 'Relationships', rating: 4.9, author: 'ElenaS', cloned: false },
  ]);

  // M13: Certifications mock state
  const [certifications, setCertifications] = useState<any[]>([
    { id: 'c1', name: 'Negotiation Fundamentals', locked: true, progress: 0, scenarioId: 'dismissive-boss-scenario' },
    { id: 'c2', name: 'Boundary Management', locked: true, progress: 0, scenarioId: 'guilt-tripper-scenario' },
    { id: 'c3', name: 'VC Pitch & Defense', locked: true, progress: 0, scenarioId: 'skeptical-vc-scenario' },
    { id: 'c4', name: 'Client De-escalation', locked: true, progress: 0, scenarioId: 'angry-client-scenario' }
  ]);

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Google Sign-In & JWT callbacks
  const handleGoogleSignInCallback = (response: any) => {
    const token = response.credential;
    const decoded = decodeJwt(token);
    if (decoded) {
      localStorage.setItem('echopersona_jwt', token);
      setJwtToken(token);
      setUserSession(decoded);
    }
  };

  const initializeGoogleSignIn = () => {
    const google = (window as any).google;
    if (google && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleSignInCallback,
      });
      google.accounts.id.renderButton(
        document.getElementById('google-signin-btn-div'),
        { theme: 'outline', size: 'large', text: 'signin_with', shape: 'pill' }
      );
    }
  };

  const handleDemoSignInBypass = () => {
    const mockHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const mockPayload = btoa(
      JSON.stringify({
        email: 'judge.hackathon@gmail.com',
        name: 'Hackathon Judge',
        picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
        exp: Math.floor(Date.now() / 1000) + 86400,
      })
    );
    const mockToken = `${mockHeader}.${mockPayload}.mockSignature`;
    localStorage.setItem('echopersona_jwt', mockToken);
    setJwtToken(mockToken);
    setUserSession({
      email: 'judge.hackathon@gmail.com',
      name: 'Hackathon Judge',
      picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
    });
  };

  const handleSignOut = () => {
    localStorage.removeItem('echopersona_jwt');
    setUserSession(null);
    setJwtToken(null);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('echopersona_jwt');
      if (storedToken) {
        const decoded = decodeJwt(storedToken);
        if (decoded) {
          setUserSession(decoded);
          setJwtToken(storedToken);
        }
      }
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    if (!userSession && typeof window !== 'undefined') {
      const id = 'google-gsi-client';
      if (!document.getElementById(id)) {
        const script = document.createElement('script');
        script.id = id;
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => initializeGoogleSignIn();
        document.body.appendChild(script);
      } else {
        setTimeout(() => initializeGoogleSignIn(), 500);
      }
    }
  }, [userSession, googleClientId]);

  // 1. Initial Load & Seed Database
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedScenarios = localStorage.getItem('echopersona_scenarios');
      if (storedScenarios) {
        const parsed = JSON.parse(storedScenarios);
        const needsReset = parsed.length !== DEFAULT_PRESETS.length || 
          parsed.some((p: any) => {
            const original = DEFAULT_PRESETS.find(o => o.id === p.id);
            if (!original) return true;
            return p.objectives.length !== original.objectives.length || p.hiddenObjectives.length !== original.hiddenObjectives.length;
          });
        if (needsReset) {
          localStorage.setItem('echopersona_scenarios', JSON.stringify(DEFAULT_PRESETS));
          setScenarios(DEFAULT_PRESETS);
        } else {
          setScenarios(parsed);
        }
      } else {
        localStorage.setItem('echopersona_scenarios', JSON.stringify(DEFAULT_PRESETS));
        setScenarios(DEFAULT_PRESETS);
      }

      const storedHistory = localStorage.getItem('echopersona_history');
      if (storedHistory) {
        const hist = JSON.parse(storedHistory);
        setHistoryList(hist);
        
        // Update certification progress based on historical scores
        setCertifications(prev => prev.map(cert => {
          const run = hist.find((h: any) => h.scenarioId === cert.scenarioId || h.scenarioTitle.includes(cert.name.split(' ')[0]));
          if (run) {
            return {
              ...cert,
              progress: run.score,
              locked: run.score < 85
            };
          }
          return cert;
        }));
      }

      const storedBranches = localStorage.getItem('echopersona_branches');
      if (storedBranches) {
        setSavedBranches(JSON.parse(storedBranches));
      }

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
              setStep('setup');
            }
          }
        } catch (e) {
          console.error(e);
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
        rec.lang = speechLanguage;

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
            
            setInputVal((prev) => prev ? prev + ' ' + transcript : transcript);
            (window as any)._lastPacing = { wpm, duration };
          }
        };

        rec.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, [micStartTime, speechLanguage]);

  // Update Speech Recognition Language on change
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = speechLanguage;
    }
  }, [speechLanguage]);

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

  // Reset simulator state and go back to main page setup
  const handleRestart = () => {
    setStep('setup');
    setNavTab('simulator');
    setActiveScenario(null);
    setMessages([]);
    setCoachingResult(null);
    setDemoActive(false);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // Speak text via SpeechSynthesis
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechLanguage;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Select a copilot hint and copy to input box
  const handleSelectHint = (text: string) => {
    setInputVal(text);
    setShowHintModal(false);
  };

  // Export simulator flight log as JSON file
  const handleExportLogs = () => {
    if (!activeScenario || messages.length === 0) return;
    const logData = {
      scenario: activeScenario,
      messages: messages,
      coachingResult: coachingResult,
      exportedAt: new Date().toLocaleString()
    };
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flight-log-${activeScenario.id}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            startingTension: tension1,
            openness: openness1,
            conscientiousness: conscientiousness1,
            extraversion: extraversion1,
            agreeableness: agreeableness1,
            neuroticism: neuroticism1
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
            interruptionFrequency: 30,
            emotionalVolatility: 30,
            startingTension: 50,
            openness: openness2,
            conscientiousness: 50,
            extraversion: 50,
            agreeableness: agreeableness2,
            neuroticism: 30
          }
        });
      }

      const customObjectivesList = [];
      if (customObj1) customObjectivesList.push({ id: 'custom-obj1', text: customObj1 });
      if (customObj2) customObjectivesList.push({ id: 'custom-obj2', text: customObj2 });
      if (customObj3) customObjectivesList.push({ id: 'custom-obj3', text: customObj3 });
      
      const customHiddenList = [];
      if (customHiddenObj1) customHiddenList.push({ id: 'custom-hidden1', text: customHiddenObj1 });
      if (customHiddenObj2) customHiddenList.push({ id: 'custom-hidden2', text: customHiddenObj2 });

      scenarioConfig = {
        id: 'custom-scenario-' + Date.now(),
        title: customTitle,
        scenario: 'Custom Training',
        description: customDescription,
        objective: customObjective || 'Resolve the scenario constructively.',
        objectives: customObjectivesList.length > 0 ? customObjectivesList : [{ id: 'custom-obj1', text: 'State your boundary clearly' }],
        hiddenObjectives: customHiddenList.length > 0 ? customHiddenList : [{ id: 'custom-hobj1', text: 'Maintain emotional composure' }],
        personas: activePersonas,
        memory: []
      };

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

    // M8: Scenario Difficulty Evolution logic
    // Check if user has high average score on this scenario and increase difficulty traits automatically
    const priorAttempts = historyList.filter(h => h.scenarioTitle === scenarioConfig.title);
    const averageScore = priorAttempts.length > 0 
      ? priorAttempts.reduce((acc, curr) => acc + curr.score, 0) / priorAttempts.length 
      : 0;

    let finalTension = scenarioConfig.personas[0]?.traits.startingTension ?? 50;
    if (averageScore > 82) {
      // Auto-evolve difficulty: increase volatilities and starting tensions
      scenarioConfig.personas.forEach(p => {
        p.traits.startingTension = Math.min(p.traits.startingTension + 15, 100);
        p.traits.emotionalVolatility = Math.min(p.traits.emotionalVolatility + 15, 100);
        p.traits.interruptionFrequency = Math.min(p.traits.interruptionFrequency + 10, 100);
      });
      finalTension = scenarioConfig.personas[0]?.traits.startingTension;
      console.log("Difficulty evolved automatically due to high performance!");
    } else if (priorAttempts.length > 1 && averageScore < 50) {
      // Ease difficulty
      scenarioConfig.personas.forEach(p => {
        p.traits.startingTension = Math.max(p.traits.startingTension - 15, 10);
        p.traits.emotionalVolatility = Math.max(p.traits.emotionalVolatility - 15, 10);
      });
      finalTension = scenarioConfig.personas[0]?.traits.startingTension;
    }

    setActiveScenario(scenarioConfig);
    const initialObjectives: Record<string, boolean> = {};
    scenarioConfig.objectives.forEach(obj => {
      initialObjectives[obj.id] = false;
    });

    setObjectivesMet(initialObjectives);
    setCurrentTension(finalTension);
    setLastCoachingTip('Simulator active. Present your position to begin.');
    setActiveSpeakerId(scenarioConfig.personas[0]?.id || '');
    setCopilotHints(null);
    setShowHintModal(false);
    setSelectedMindsetIndex(-1);
    setShowMindsetModal(false);
    setCurrentSpeaker('A');

    setMessages([
      {
        id: 'init',
        role: 'model',
        text: `Hey, let's talk. What's on your mind?`,
        timestamp: new Date(),
        activePersonaId: scenarioConfig.personas[0]?.id,
        activePersonaName: scenarioConfig.personas[0]?.name,
        defensivenessScore: finalTension,
        trustScore: 50,
        cooperationScore: 50,
        confidenceScore: 50,
        internalThought: "Ready to listen to what they have to say.",
        tactics: [],
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

  // Rehearsal turn logic
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isGeneratingMessage || !activeScenario) return;

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
          hiddenObjectives: activeScenario.hiddenObjectives || [],
          memory: activeScenario.memory || [],
          refereeMode: refereeMode,
          activePersonaId: refereeMode ? '' : activeSpeakerId
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to simulate');

      setObjectivesMet(data.objectivesMet || {});
      setCurrentTension(data.defensivenessScore ?? 50);
      setLastCoachingTip(data.coachingTip || 'Continue maintaining control.');

      if (refereeMode) {
        const refMetaMessage: Message = {
          id: `msg-referee-${Date.now()}`,
          role: 'model',
          text: `[REFEREE FEEDBACK] Defensiveness: ${data.defensivenessScore}%. Trust: ${data.trustScore}%. ${data.coachingTip}`,
          timestamp: new Date(),
          coachingTip: data.coachingTip,
          defensivenessScore: data.defensivenessScore,
          trustScore: data.trustScore,
          cooperationScore: data.cooperationScore,
          confidenceScore: data.confidenceScore,
          internalThought: data.internalThought,
          tactics: data.tactics || [],
          objectivesMetSnapshot: data.objectivesMet
        };
        setMessages((prev) => [...prev, refMetaMessage]);
        setCurrentSpeaker(currentSpeaker === 'A' ? 'B' : 'A');
      } else {
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
          trustScore: data.trustScore ?? 50,
          cooperationScore: data.cooperationScore ?? 50,
          confidenceScore: data.confidenceScore ?? 50,
          internalThought: data.internalThought ?? "Reflecting on options.",
          tactics: data.tactics || [],
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

  // Rewind timeline
  const handleRewind = (index: number) => {
    if (index < 0 || index >= messages.length || !activeScenario) return;

    const newBranch: SavedBranch = {
      id: 'branch-' + Date.now(),
      name: `Branch from turn ${index} - ${new Date().toLocaleTimeString()}`,
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

    const slicedMessages = messages.slice(0, index + 1);
    const targetState = slicedMessages[slicedMessages.length - 1];

    setMessages(slicedMessages);
    if (targetState.objectivesMetSnapshot) setObjectivesMet(targetState.objectivesMetSnapshot);
    if (targetState.defensivenessScore !== undefined) setCurrentTension(targetState.defensivenessScore);
    
    setLastCoachingTip(targetState.coachingTip || 'Timeline rewound. Enter new branch responses.');
    setCopilotHints(null);
    setShowHintModal(false);
    setSelectedMindsetIndex(-1);

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // Get hints
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

  // End Rehearsal and get final evaluations (JSON thought reveal, comment, reconstruction)
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
          history: messages,
          hiddenObjectives: activeScenario?.hiddenObjectives || []
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to score rehearsal');

      setCoachingResult(data);

      if (data.timelineSummary && activeScenario) {
        setScenarios(prev => {
          const updated = prev.map(s => {
            if (s.id === activeScenario.id) {
              const mem = s.memory ? [...s.memory, data.timelineSummary] : [data.timelineSummary];
              if (mem.length > 5) mem.shift();
              return { ...s, memory: mem };
            }
            return s;
          });
          localStorage.setItem('echopersona_scenarios', JSON.stringify(updated));
          return updated;
        });
      }

      // Save scorecard
      const historyItem = {
        id: 'run-' + Date.now(),
        scenarioId: activeScenario?.id,
        scenarioTitle: activeScenario?.title || 'Custom Scenario',
        score: data.overallScore,
        date: new Date().toLocaleDateString(),
        feedback: data.overallFeedback,
        metrics: data.metrics
      };

      setHistoryList(prev => {
        const updated = [historyItem, ...prev];
        localStorage.setItem('echopersona_history', JSON.stringify(updated));
        
        // Update certifications
        setCertifications(prevCert => prevCert.map(cert => {
          if (cert.scenarioId === activeScenario?.id) {
            return {
              ...cert,
              progress: Math.max(cert.progress, data.overallScore),
              locked: Math.max(cert.progress, data.overallScore) < 85
            };
          }
          return cert;
        }));
        
        return updated;
      });

    } catch (err: any) {
      console.error(err);
      setCoachError(err.message || 'Feedback evaluation failed.');
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  // M6: Objection Drill Trainer triggers
  const handleStartObjectionDrill = async (topic: string) => {
    setActiveDrillTopic(topic);
    setIsGeneratingDrill(true);
    setDrillObjectionText('');
    setDrillFeedback('');
    setDrillScore(null);

    const promptObj = `
    You are generating a realistic negotiation objection for topic: "${topic}".
    Generate a 1-sentence aggressive objection text that a counterpart would say to challenge the user.
    Respond in JSON: { "objection": "objection text" }
    `;

    try {
      const apiKey = localStorage.getItem('echopersona_key') || process.env.GEMINI_API_KEY;
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personas: [{ id: 'drill', name: 'Drill Partner', prompt: 'Be extremely stubborn.' }],
          newMessage: `GENERATE OBJECTION FOR: ${topic}`,
          history: []
        })
      });
      const data = await res.json();
      setDrillObjectionText(data.text || `No, I simply don't have the budget to approve this raising request right now.`);
    } catch (e) {
      setDrillObjectionText(`We cannot accept this price. It is 20% higher than competitor solutions.`);
    } finally {
      setIsGeneratingDrill(false);
    }
  };

  const handleSubmitDrillResponse = async (userText: string) => {
    if (!userText.trim()) return;
    setIsGeneratingDrill(true);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioDescription: `Objection Drill: ${activeDrillTopic}. Counterpart said: "${drillObjectionText}"`,
          personaName: 'Drill Partner',
          history: [
            { role: 'model', text: drillObjectionText },
            { role: 'user', text: userText }
          ]
        })
      });

      const data = await res.json();
      setDrillFeedback(data.overallFeedback || 'Decent response, but try to validate first.');
      setDrillScore(data.overallScore || 75);
      setDrillHistoryCount(prev => prev + 1);
    } catch (e) {
      setDrillFeedback('Good attempt. Try to establish common ground.');
      setDrillScore(80);
    } finally {
      setIsGeneratingDrill(false);
    }
  };

  // M11: CloneScenario Marketplace
  const handleCloneScenario = (item: any) => {
    const clonedObj: Scenario = {
      id: 'cloned-' + Date.now(),
      title: item.title + ' (Cloned)',
      scenario: item.category,
      description: `Community-curated scenario for ${item.title} by ${item.author}`,
      objective: 'Achieve a mutually beneficial resolution.',
      objectives: [
        { id: 'c-obj1', text: 'Listen actively to competitor concerns' },
        { id: 'c-obj2', text: 'Propose value-driven compromise' }
      ],
      hiddenObjectives: [
        { id: 'c-hobj1', text: 'Establish common trust framework' }
      ],
      personas: [
        {
          id: 'cp-1',
          name: 'Counterpart Agent',
          relationship: 'Negotiator',
          prompt: 'Be rational but firm on pricing constraints.',
          traits: { 
            formality: 70, verbosity: 50, interruptionFrequency: 40, emotionalVolatility: 40, startingTension: 50,
            openness: 60, conscientiousness: 60, extraversion: 50, agreeableness: 50, neuroticism: 40
          }
        }
      ]
    };

    setScenarios(prev => {
      const updated = [...prev, clonedObj];
      localStorage.setItem('echopersona_scenarios', JSON.stringify(updated));
      return updated;
    });

    setMarketplaceScenarios(prev => prev.map(m => m.id === item.id ? { ...m, cloned: true } : m));
    alert('Cloned successfully! Scenario added to your cockpit preset lists.');
  };

  // M14: Demo Mode Fast-Forward simulation values
  const handleTriggerDemoFeed = (highlight: boolean) => {
    const preset = scenarios.find(s => s.id === 'dismissive-boss-scenario') || DEFAULT_PRESETS[0];
    setActiveScenario(preset);
    setObjectivesMet({ budget: true, value: true, timeline: false });
    setCurrentTension(35);
    setStep('rehearsal');
    setDemoActive(true);

    const demoMessages: Message[] = [
      { id: 'd0', role: 'model', text: "Hey, let's talk. What's on your mind?", timestamp: new Date() },
      { id: 'd1', role: 'user', text: "Hi Sarah. I wanted to discuss my compensation. Given the projects I led last quarter, I think a 15% increase is justified.", timestamp: new Date(), tactics: ['Evidence-Based Persuasion'], paceMetric: { wpm: 124, duration: 4.5 } },
      { 
        id: 'd2', role: 'model', text: "Look, you've done good work, but mid-year adjustments are practically impossible. Our department budget is locked.", timestamp: new Date(), 
        coachingTip: "Good launch, but expect budget pushbacks. Reframe to align with her constraints.",
        defensivenessScore: 65, trustScore: 60, cooperationScore: 40, confidenceScore: 70,
        internalThought: "They did lead key projects, but HR will grill me on department metrics if I approve this easily."
      },
      { id: 'd3', role: 'user', text: "I understand the budget limitations, and I respect that. Can we look at the ROI my automated pipeline generated? We saved over $40k last month alone.", timestamp: new Date(), tactics: ['Validation', 'Reframing'], paceMetric: { wpm: 118, duration: 5.2 } },
      { 
        id: 'd4', role: 'model', text: "Saving $40k is a solid metric. Still, company policy makes this tricky. We usually wait until year-end cycles.", timestamp: new Date(), 
        coachingTip: "Excellent pivot using ROI validation. Sarah is relaxing. Push for a committed review timeline.",
        defensivenessScore: 40, trustScore: 80, cooperationScore: 70, confidenceScore: 85,
        internalThought: "The $40k saving is a real value contribution. I can present this to the VP if I have to."
      }
    ];

    setMessages(demoMessages);

    if (highlight) {
      // Fast-forward directly to highlight scorecard dashboard
      setStep('dashboard');
      setCoachingResult({
        overallScore: 88,
        overallFeedback: "Excellent handling. You validated constraints successfully and backed your raise request with quantified contributions.",
        metrics: {
          empathy: { score: 85, analysis: "You actively acknowledged budget limitations before pivoting." },
          clarity: { score: 90, analysis: "Spoken pace was clear, averaging a confident 121 WPM." },
          assertiveness: { score: 90, analysis: "Stood your ground on business value contributions." }
        },
        strengths: ["Strong validation of budget realities.", "Excellent ROI proof metrics."],
        improvements: ["Push harder for a written review date commitment."],
        hiddenObjectivesAnalysis: [
          { id: 'precedent', met: true, explanation: "You framed the raise on unique automated pipeline ROI, avoiding broad precedence risk." },
          { id: 'confidence', met: true, explanation: "Maintained authority under budget deflections." }
        ],
        sportsCommentary: [
          { turnIndex: 1, comment: "User launches raised request supported by led projects." },
          { turnIndex: 3, comment: "Pivotal turn: User validates budget constraints, dropping defensiveness from 65% to 40%." }
        ],
        optimalPath: [
          { userIndex: 3, optimalResponse: "I understand budget constraints are tight. If we review the pipeline ROI which saved $40k, could we allocate a fraction of that value?", reasoning: "Directly connects the raise to self-funded revenue", expectedOutcome: "Manager trust scales immediately." }
        ]
      });
    }
  };

  const handleGenerateShareLink = () => {
    const selected = scenarios.find(s => s.id === selectedScenarioId);
    if (!selected) return;
    const b64 = btoa(JSON.stringify(selected));
    const url = `${window.location.origin}${window.location.pathname}#assignment=${encodeURIComponent(b64)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getTensionColor = (score: number) => {
    if (score < 40) return 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30';
    if (score < 75) return 'text-amber-400 bg-amber-950/20 border-amber-900/30';
    return 'text-red-400 bg-red-950/20 border-red-900/30 animate-pulse';
  };

  const getAverageHistoryScore = () => {
    if (historyList.length === 0) return 0;
    const sum = historyList.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(sum / historyList.length);
  };

  if (isLoadingAuth) {
    return (
      <div className="flex-1 w-full bg-slate-955 text-slate-100 flex flex-col items-center justify-center font-sans min-h-screen">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <TrendingUp className="w-10 h-10 text-indigo-500 animate-bounce" />
          <span className="text-sm font-bold text-slate-400">Loading EchoPersona session...</span>
        </div>
      </div>
    );
  }

  if (!userSession) {
    return (
      <div className="flex-1 w-full bg-slate-955 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased min-h-screen relative overflow-hidden justify-center items-center p-4">
        {/* Background glow animations */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse duration-4000" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl -z-10 animate-pulse duration-3000" />

        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-850 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <div className="text-center flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-2">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-400">
              EchoPersona V3
            </h1>
            <p className="text-slate-400 text-xs leading-normal">
              Flight simulator for hard conversations. Sign in to rehearse.
            </p>
          </div>

          <div className="flex flex-col gap-4 border-t border-b border-slate-850 py-5 my-2">
            {/* Custom Google Client ID config */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Google Client ID</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={googleClientId} 
                  onChange={(e) => setGoogleClientId(e.target.value)} 
                  placeholder="Enter OAuth Client ID..." 
                  className="flex-1 bg-slate-950 border border-slate-850 focus:border-indigo-500 outline-none rounded-xl px-3 py-2 text-xs text-slate-300 font-mono"
                />
                <button 
                  onClick={() => alert(`Client ID set to:\n${googleClientId}`)} 
                  className="px-3 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold rounded-xl text-indigo-400 shrink-0"
                >
                  Set ID
                </button>
              </div>
              <span className="text-[9px] text-slate-500 leading-normal">
                Leave default or configure your own from Google Developer Console.
              </span>
            </div>

            {/* Google Sign-in Button Div */}
            <div className="flex flex-col gap-2 items-center justify-center mt-3">
              <div id="google-signin-btn-div" className="w-full flex justify-center" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[9px] text-slate-500 text-center uppercase tracking-wider font-bold">Or demo sign-in option</span>
            <button 
              onClick={handleDemoSignInBypass}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <User className="w-4 h-4" /> Sign in as Demo Judge (Generates Mock JWT)
            </button>
            <span className="text-[9.5px] text-slate-555 leading-relaxed text-center block mt-1">
              Select this to immediately bypass and preview the V3 simulation cockpit without configuring Google Cloud Console project scopes.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-slate-955 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-45 bg-slate-950/90 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-400">
              EchoPersona V3
            </h1>
            <p className="text-xs text-slate-400 sm:block hidden">Flight simulator for hard conversations</p>
          </div>
        </div>

        {/* Global Tab Navigator */}
        {step === 'setup' && (
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 overflow-x-auto max-w-full">
            <button onClick={() => setNavTab('simulator')} className={`px-2.5 py-1.5 rounded text-[11px] font-bold transition-all ${navTab === 'simulator' ? 'bg-slate-800 text-white' : 'text-slate-450 hover:text-slate-200'}`}>Simulator</button>
            <button onClick={() => setNavTab('drills')} className={`px-2.5 py-1.5 rounded text-[11px] font-bold transition-all ${navTab === 'drills' ? 'bg-slate-800 text-white' : 'text-slate-450 hover:text-slate-200'}`}>Drills</button>
            <button onClick={() => setNavTab('branches')} className={`px-2.5 py-1.5 rounded text-[11px] font-bold transition-all ${navTab === 'branches' ? 'bg-slate-800 text-white' : 'text-slate-450 hover:text-slate-200'}`}>Branches</button>
            <button onClick={() => setNavTab('history')} className={`px-2.5 py-1.5 rounded text-[11px] font-bold transition-all ${navTab === 'history' ? 'bg-slate-800 text-white' : 'text-slate-450 hover:text-slate-200'}`}>Analytics</button>
            <button onClick={() => setNavTab('skilltree')} className={`px-2.5 py-1.5 rounded text-[11px] font-bold transition-all ${navTab === 'skilltree' ? 'bg-slate-800 text-white' : 'text-slate-450 hover:text-slate-200'}`}>Skill Tree</button>
            <button onClick={() => setNavTab('marketplace')} className={`px-2.5 py-1.5 rounded text-[11px] font-bold transition-all ${navTab === 'marketplace' ? 'bg-slate-800 text-white' : 'text-slate-450 hover:text-slate-200'}`}>Marketplace</button>
            <button onClick={() => setNavTab('certifications')} className={`px-2.5 py-1.5 rounded text-[11px] font-bold transition-all ${navTab === 'certifications' ? 'bg-slate-800 text-white' : 'text-slate-450 hover:text-slate-200'}`}>Certify</button>
            <button onClick={() => setNavTab('enterprise')} className={`px-2.5 py-1.5 rounded text-[11px] font-bold transition-all ${navTab === 'enterprise' ? 'bg-slate-800 text-white' : 'text-slate-450 hover:text-slate-200'}`}>Enterprise</button>
            <button onClick={() => setNavTab('pricing')} className={`px-2.5 py-1.5 rounded text-[11px] font-bold transition-all ${navTab === 'pricing' ? 'bg-slate-800 text-white' : 'text-slate-450 hover:text-slate-200'}`}>Pricing</button>
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* User profile info & Sign Out */}
          {userSession && (
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-850 rounded-xl p-1.5 pr-3">
              <img src={userSession.picture} alt={userSession.name} className="w-6 h-6 rounded-full border border-slate-700" referrerPolicy="no-referrer" />
              <span className="text-[10px] font-bold text-slate-300 max-w-[80px] truncate sm:block hidden">{userSession.name}</span>
              <button 
                onClick={handleSignOut}
                className="text-[9px] font-extrabold uppercase tracking-wider text-red-400 hover:text-red-300 ml-1 border-l border-slate-800 pl-2 transition-all"
                title="Sign out of your session"
              >
                Sign Out
              </button>
            </div>
          )}

          {/* Hackathon Demo Widget */}
          {step === 'setup' && (
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 gap-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 px-1">Judge Tool:</span>
              <button onClick={() => handleTriggerDemoFeed(false)} className="px-2 py-1 bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded text-[9.5px] font-bold transition-all hover:bg-indigo-600/35">Rehearsal Feed</button>
              <button onClick={() => handleTriggerDemoFeed(true)} className="px-2 py-1 bg-purple-600/20 text-purple-400 border border-purple-500/20 rounded text-[9.5px] font-bold transition-all hover:bg-purple-600/35">Highlight Reel</button>
            </div>
          )}

          {(step !== 'setup' || navTab !== 'simulator') && (
            <button
              onClick={handleRestart}
              className="flex items-center gap-1.5 text-xs text-slate-350 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Main Page
            </button>
          )}
        </div>
      </header>

      {/* Main Sandbox */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 flex flex-col justify-center">

        {/* ================================== TAB 1: COCKPIT / SIMULATOR ================================== */}
        {navTab === 'simulator' && (
          <div className="w-full">
            
            {/* Setup Form */}
            {step === 'setup' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
                <div className="lg:col-span-7 flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">Step 1: Rehearsal Specs</span>
                    <h2 className="text-3xl font-extrabold tracking-tight">Simulator Configuration</h2>
                    <p className="text-slate-400 text-sm">
                      Choose standard blueprints or custom build counterpart psychology metrics.
                    </p>
                  </div>

                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-850">
                    <button onClick={() => setIsCustomMode(false)} className={`flex-1 py-3 text-center rounded-lg text-sm font-semibold transition-all ${!isCustomMode ? 'bg-slate-800 text-white shadow' : 'text-slate-400'}`}>Blueprint Scenarios</button>
                    <button onClick={() => setIsCustomMode(true)} className={`flex-1 py-3 text-center rounded-lg text-sm font-semibold transition-all ${isCustomMode ? 'bg-slate-800 text-white shadow' : 'text-slate-400'}`}>OCEAN Sandbox</button>
                  </div>

                  {/* Referee Mode Toggle */}
                  <div className="flex bg-slate-900/40 border border-slate-850 p-4 rounded-xl items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Users className="w-5 h-5 text-indigo-400" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">Human-Partner Referee Mode</h4>
                        <p className="text-[10px] text-slate-500">Practice with a colleague; AI referee will track tension and score both sides.</p>
                      </div>
                    </div>
                    <button onClick={() => setRefereeMode(!refereeMode)} className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 outline-none ${refereeMode ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${refereeMode ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {refereeMode && (
                    <div className="bg-slate-900/35 border border-slate-850 p-4 rounded-xl flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-400 font-bold uppercase">Initiator Name (Player A)</label>
                          <input type="text" value={refereeUserAName} onChange={(e) => setRefereeUserAName(e.target.value)} className="bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-lg" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-400 font-bold uppercase">Counterpart Name (Player B)</label>
                          <input type="text" value={refereeUserBName} onChange={(e) => setRefereeUserBName(e.target.value)} className="bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-lg" />
                        </div>
                      </div>
                    </div>
                  )}

                  {!isCustomMode ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {scenarios.map((preset) => (
                        <button key={preset.id} onClick={() => setSelectedScenarioId(preset.id)} className={`text-left p-5 rounded-2xl border transition-all flex flex-col justify-between ${selectedScenarioId === preset.id ? 'bg-indigo-950/40 border-indigo-500 shadow-lg' : 'bg-slate-900/60 border-slate-850/60'}`}>
                          <div className="flex flex-col gap-1.5 w-full">
                            <span className="text-[9px] uppercase font-bold text-slate-500">{preset.scenario}</span>
                            <h3 className="text-base font-bold text-slate-100">{preset.title}</h3>
                            <p className="text-xs text-slate-450 leading-normal line-clamp-3 mt-1">{preset.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    /* Custom Sandbox Editor (OCEAN + Traits) */
                    <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-350">Scenario Title</label>
                          <input type="text" placeholder="e.g. Critical Review" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-sm text-slate-100" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-350">Scenario Objective</label>
                          <input type="text" placeholder="e.g. Get araise date" value={customObjective} onChange={(e) => setCustomObjective(e.target.value)} className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-sm text-slate-100" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-350">Description</label>
                        <textarea placeholder="Stakes and context..." value={customDescription} onChange={(e) => setCustomDescription(e.target.value)} rows={2} className="bg-slate-950 border border-slate-850 rounded-xl p-3 text-sm text-slate-100 resize-none" />
                      </div>

                      {/* Sliders for OCEAN and Traits */}
                      <div className="border-t border-slate-800 pt-4 mt-2">
                        <h4 className="text-sm font-bold text-indigo-400 mb-3">Counterpart Behavioral Settings</h4>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" placeholder="Name (e.g. Sarah)" value={persona1Name} onChange={(e) => setPersona1Name(e.target.value)} className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs" />
                          <input type="text" placeholder="Relationship (e.g. Boss)" value={persona1Rel} onChange={(e) => setPersona1Rel(e.target.value)} className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs" />
                        </div>

                        <textarea placeholder="System prompt instructions..." value={persona1Prompt} onChange={(e) => setPersona1Prompt(e.target.value)} rows={2} className="bg-slate-955 border border-slate-850 rounded-lg p-3 text-xs mt-3 w-full" />

                        {/* OCEAN Sliders */}
                        <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-4 mb-2">OCEAN Dimensions</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/30 p-4 rounded-xl border border-slate-850">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-slate-400 font-bold">Openness: {openness1}%</span>
                            <input type="range" min="0" max="100" value={openness1} onChange={(e) => setOpenness1(Number(e.target.value))} className="w-full accent-indigo-500" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-slate-400 font-bold">Conscientiousness: {conscientiousness1}%</span>
                            <input type="range" min="0" max="100" value={conscientiousness1} onChange={(e) => setConscientiousness1(Number(e.target.value))} className="w-full accent-indigo-500" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-slate-400 font-bold">Extraversion: {extraversion1}%</span>
                            <input type="range" min="0" max="100" value={extraversion1} onChange={(e) => setExtraversion1(Number(e.target.value))} className="w-full accent-indigo-500" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-slate-400 font-bold">Agreeableness: {agreeableness1}%</span>
                            <input type="range" min="0" max="100" value={agreeableness1} onChange={(e) => setAgreeableness1(Number(e.target.value))} className="w-full accent-indigo-500" />
                          </div>
                          <div className="flex flex-col gap-1 sm:col-span-2">
                            <span className="text-[10px] text-slate-400 font-bold">Neuroticism: {neuroticism1}%</span>
                            <input type="range" min="0" max="100" value={neuroticism1} onChange={(e) => setNeuroticism1(Number(e.target.value))} className="w-full accent-indigo-500" />
                          </div>
                        </div>

                        {/* Conversational Sliders */}
                        <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-4 mb-2">Conversational Style</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/30 p-4 rounded-xl border border-slate-850">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-slate-400 font-bold">Formality: {formality1}%</span>
                            <input type="range" min="0" max="100" value={formality1} onChange={(e) => setFormality1(Number(e.target.value))} className="w-full accent-indigo-500" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-slate-400 font-bold">Verbosity: {verbosity1}%</span>
                            <input type="range" min="0" max="100" value={verbosity1} onChange={(e) => setVerbosity1(Number(e.target.value))} className="w-full accent-indigo-500" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-slate-400 font-bold">Interruption Freq: {interrupt1}%</span>
                            <input type="range" min="0" max="100" value={interrupt1} onChange={(e) => setInterrupt1(Number(e.target.value))} className="w-full accent-indigo-500" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-slate-400 font-bold">Emotional Volatility: {volatility1}%</span>
                            <input type="range" min="0" max="100" value={volatility1} onChange={(e) => setVolatility1(Number(e.target.value))} className="w-full accent-indigo-500" />
                          </div>
                        </div>
                      </div>

                      {/* Objectives */}
                      <div className="border-t border-slate-800 pt-4 mt-2">
                        <label className="text-xs font-semibold text-slate-350 block mb-2">Scenario Objectives</label>
                        <div className="flex flex-col gap-2">
                          <input type="text" placeholder="Objective 1" value={customObj1} onChange={(e) => setCustomObj1(e.target.value)} className="bg-slate-955 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-200" />
                          <input type="text" placeholder="Objective 2" value={customObj2} onChange={(e) => setCustomObj2(e.target.value)} className="bg-slate-955 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-200" />
                        </div>
                        
                        <label className="text-xs font-semibold text-slate-350 block mt-3 mb-2">Hidden Objectives (Unknown to user during conversation)</label>
                        <div className="flex flex-col gap-2">
                          <input type="text" placeholder="Secret Objective 1" value={customHiddenObj1} onChange={(e) => setCustomHiddenObj1(e.target.value)} className="bg-slate-955 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-200" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right setup config summary and launch */}
                <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
                    
                    <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                      <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-400" />
                        Flight Settings
                      </h3>
                      <button
                        onClick={handleGenerateShareLink}
                        className="text-xs text-slate-400 hover:text-slate-250 flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-850"
                        title="Copy shared link"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-450" /> : <Share2 className="w-3.5 h-3.5" />}
                        {copiedLink ? 'Copied' : 'Share'}
                      </button>
                    </div>

                    {!isCustomMode ? (
                      (() => {
                        const preset = scenarios.find(s => s.id === selectedScenarioId);
                        if (!preset) return null;
                        return (
                          <div className="flex flex-col gap-4">
                            {/* Difficulty Selector */}
                            <div>
                              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block font-medium">Difficulty Level</span>
                              <div className="flex gap-2 mt-2">
                                <button
                                  type="button"
                                  onClick={() => setDifficulty('Easy')}
                                  className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all border ${difficulty === 'Easy' ? 'bg-emerald-950/45 border-emerald-500 text-emerald-300 shadow' : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'}`}
                                >
                                  Cooperative
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDifficulty('Medium')}
                                  className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all border ${difficulty === 'Medium' ? 'bg-indigo-950/45 border-indigo-500 text-indigo-300 shadow' : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'}`}
                                >
                                  Realistic
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDifficulty('Combative')}
                                  className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all border ${difficulty === 'Combative' ? 'bg-red-950/45 border-red-500 text-red-300 shadow' : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'}`}
                                >
                                  Hostile
                                </button>
                              </div>
                            </div>

                            {/* Coach Assistant Toggle */}
                            <div className="flex items-center justify-between border-t border-b border-slate-850 py-3 my-1">
                              <div>
                                <span className="text-[10px] font-bold text-slate-455 uppercase tracking-widest block font-medium">Real-Time Coach Assistant</span>
                                <p className="text-[9px] text-slate-500 mt-0.5">Secondary AI provides private real-time guidance tips.</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setCoachAssistantEnabled(!coachAssistantEnabled)}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${coachAssistantEnabled ? 'bg-indigo-600' : 'bg-slate-800'}`}
                              >
                                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${coachAssistantEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                              </button>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Scenario Title</span>
                              <span className="text-lg font-bold text-white mt-0.5 block">{preset.title}</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block font-medium">Scenario Objectives</span>
                              <ul className="space-y-1.5 mt-2">
                                {preset.objectives.map((obj, idx) => (
                                  <li key={obj.id} className="text-xs text-indigo-250 flex items-start gap-2">
                                    <span className="text-indigo-400 font-bold shrink-0">{idx + 1}.</span>
                                    {obj.text}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-semibold">Hidden Objectives (Hidden during play)</span>
                              <ul className="space-y-1.5 mt-1 text-[11px] text-slate-500">
                                {(preset.hiddenObjectives || []).map(obj => (
                                  <li key={obj.id}>🔒 {obj.text}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="flex flex-col gap-4">
                        {/* Difficulty Selector in Custom Mode */}
                        <div>
                          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block font-medium">Difficulty Level</span>
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => setDifficulty('Easy')}
                              className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all border ${difficulty === 'Easy' ? 'bg-emerald-950/45 border-emerald-500 text-emerald-300 shadow' : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'}`}
                            >
                              Cooperative
                            </button>
                            <button
                              type="button"
                              onClick={() => setDifficulty('Medium')}
                              className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all border ${difficulty === 'Medium' ? 'bg-indigo-950/45 border-indigo-500 text-indigo-300 shadow' : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'}`}
                            >
                              Realistic
                            </button>
                            <button
                              type="button"
                              onClick={() => setDifficulty('Combative')}
                              className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all border ${difficulty === 'Combative' ? 'bg-red-950/45 border-red-500 text-red-300 shadow' : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'}`}
                            >
                              Hostile
                            </button>
                          </div>
                        </div>

                        {/* Coach Assistant Toggle */}
                        <div className="flex items-center justify-between border-t border-b border-slate-850 py-3 my-1">
                          <div>
                            <span className="text-[10px] font-bold text-slate-455 uppercase tracking-widest block font-medium">Real-Time Coach Assistant</span>
                            <p className="text-[9px] text-slate-500 mt-0.5">Secondary AI provides private real-time guidance tips.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCoachAssistantEnabled(!coachAssistantEnabled)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${coachAssistantEnabled ? 'bg-indigo-650' : 'bg-slate-800'}`}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${coachAssistantEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Custom Blueprint</span>
                          <span className="text-lg font-bold text-white mt-0.5 block">{customTitle || '(Untitled...)'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Counterpart settings</span>
                          <p className="text-xs text-slate-350 mt-1 leading-normal">
                            {persona1Name ? `${persona1Name} (${persona1Rel || 'Partner'})` : 'Awaiting configuration...'}
                          </p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleStartRehearsal}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group text-sm"
                    >
                      Start Training Rehearsal
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Active Rehearsal Room */}
            {step === 'rehearsal' && activeScenario && (
              <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-in fade-in duration-300">
                
                {/* Left Panel: Checklist and tension meters (3 cols) */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                  <div className="bg-slate-900/70 border border-slate-850 rounded-2xl p-5 flex flex-col gap-3">
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block">Counterparts</span>
                    <div className="flex flex-col gap-2">
                      {activeScenario.personas.map((p) => {
                        const isSpeaking = activeSpeakerId === p.id && !refereeMode;
                        return (
                          <div key={p.id} className={`p-3 rounded-xl border transition-all flex justify-between items-center ${isSpeaking ? 'bg-indigo-950/30 border-indigo-500 shadow-sm' : 'bg-slate-950/60 border-slate-850 text-slate-400'}`}>
                            <div>
                              <h4 className="text-xs font-bold text-white">{p.name}</h4>
                              <span className="text-[10px] text-slate-500 italic block">{p.relationship}</span>
                            </div>
                            {isSpeaking && <span className="text-[9px] bg-indigo-500 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">Active</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Defensiveness Gauge */}
                  <div className="bg-slate-900/70 border border-slate-850 rounded-2xl p-5 flex flex-col gap-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Counterpart Defensiveness</span>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-850 p-0.5">
                        <div className={`h-full rounded-full transition-all duration-500 ${currentTension < 40 ? 'bg-emerald-500' : currentTension < 75 ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`} style={{ width: `${currentTension}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-200 w-8 text-right">{currentTension}%</span>
                    </div>
                    <span className={`text-[10px] font-bold border rounded-lg px-2.5 py-1 text-center transition-all ${getTensionColor(currentTension)}`}>
                      {currentTension < 40 ? '🟢 Receptive & Open' : currentTension < 75 ? '⚡ Defensive & Guarded' : '🔥 Combative / Stalled'}
                    </span>
                  </div>

                  {/* Objectives checklist */}
                  <div className="bg-slate-900/70 border border-slate-850 rounded-2xl p-5 flex flex-col gap-3 flex-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Objectives Checklist</span>
                    <ul className="space-y-3 mt-2">
                      {activeScenario.objectives.map((obj, idx) => {
                        const isMet = objectivesMet[obj.id];
                        return (
                          <li key={obj.id} className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all ${isMet ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-300' : 'bg-slate-955/45 border-slate-850 text-slate-450'}`}>
                            <div className="mt-0.5">
                              {isMet ? <CheckCircle className="w-4 h-4 text-emerald-450 shrink-0" /> : <span className="w-4 h-4 rounded-full border-2 border-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-500 shrink-0">{idx + 1}</span>}
                            </div>
                            <span className="text-xs leading-normal font-semibold">{obj.text}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <button onClick={handleEndAndGetFeedback} className="w-full bg-emerald-600/10 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 text-emerald-400 font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg text-sm shrink-0">
                    <Award className="w-4 h-4" />
                    End Rehearsal & Score
                  </button>
                  
                  {/* Option to go back directly to main page */}
                  <button onClick={handleRestart} className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-semibold py-2.5 rounded-2xl transition-all text-xs shrink-0">
                    Cancel & Return to Setup
                  </button>
                </div>

                {/* Middle Panel: Chat Stream, rewinding and tactical badges (6 cols / 9 cols) */}
                <div className={`bg-slate-900 border border-slate-850 rounded-3xl flex flex-col overflow-hidden h-[620px] shadow-2xl relative ${coachAssistantEnabled ? 'lg:col-span-6' : 'lg:col-span-9'}`}>
                  <div className="bg-slate-950 border-b border-slate-850 px-6 py-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{refereeMode ? 'Referee Mode' : activeScenario.title}</h4>
                      <span className="text-[10px] text-slate-550 font-semibold">Active Rehearsal Room</span>
                    </div>
                    {refereeMode && <div className="text-xs bg-indigo-950/30 border border-indigo-900/30 px-3 py-1 rounded-full text-indigo-400 font-bold">Turn: {currentSpeaker === 'A' ? refereeUserAName : refereeUserBName}</div>}
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {messages.map((msg, index) => {
                      const isUser = msg.role === 'user';
                      const isRefLog = msg.text.startsWith('[REFEREE FEEDBACK]');

                      return (
                        <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} group/msg animate-in fade-in duration-200`}>
                          <div className={`max-w-[85%] flex flex-col ${isUser ? 'items-end' : 'items-start'} relative`}>
                            
                            {/* Message metadata details */}
                            <div className="flex items-center gap-2 mb-1 px-1 flex-wrap">
                              <span className="text-[10px] text-slate-500 font-semibold">{msg.activePersonaName || (isUser ? 'You' : 'System')}</span>
                              {!isUser && msg.defensivenessScore !== undefined && !isRefLog && <span className="text-[9px] text-slate-500 bg-slate-950 border border-slate-850 px-1.5 rounded">Tension: {msg.defensivenessScore}%</span>}
                              
                              {/* Tactical move badges */}
                              {msg.tactics && msg.tactics.map((t, idx) => (
                                <span key={idx} className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border ${
                                  ['Active Listening', 'Validation', 'Reframing', 'Boundary Setting', 'Collaborative Problem Solving', 'Evidence-Based Persuasion'].includes(t)
                                    ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-450'
                                    : 'bg-red-950/20 border-red-900/30 text-red-400 animate-pulse'
                                }`}>
                                  {t}
                                </span>
                              ))}

                              {/* Rewind hover button */}
                              <button onClick={() => handleRewind(index)} className="hidden group-hover/msg:flex items-center gap-0.5 text-[9px] text-indigo-400 bg-indigo-950/50 hover:bg-indigo-500 hover:text-white border border-indigo-900/50 px-2 py-0.5 rounded" title="Rewind here">
                                <GitCommit className="w-3 h-3" />
                                Rewind
                              </button>
                            </div>

                            <div className="relative">
                              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isRefLog ? 'bg-amber-955/15 border border-amber-900/20 text-amber-300' : isUser ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-tr-none' : 'bg-slate-800 border border-slate-750 text-slate-200 rounded-tl-none'}`}>
                                {msg.text}
                                {msg.paceMetric && <span className="block text-[9px] text-indigo-250 mt-1 italic">🎤 {msg.paceMetric.wpm} WPM ({msg.paceMetric.duration}s)</span>}
                              </div>

                              {!isUser && msg.coachingTip && !isRefLog && (
                                <div className="absolute -right-3 -bottom-3 z-10">
                                  <button type="button" onClick={() => setShowTipId(showTipId === msg.id ? null : msg.id)} className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${showTipId === msg.id ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-850'}`}>
                                    <HelpCircle className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {!isUser && msg.coachingTip && showTipId === msg.id && (
                              <div className="mt-2.5 w-full bg-amber-955/15 border border-amber-900/30 p-3 rounded-xl text-xs text-amber-300">
                                <strong>Coach Tip:</strong> {msg.coachingTip}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {isGeneratingMessage && (
                      <div className="flex justify-start animate-pulse">
                        <div className="bg-slate-850 px-4 py-3 rounded-2xl text-xs text-slate-500">Processing turn...</div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input form */}
                  <form onSubmit={handleSendMessage} className="bg-slate-955 border-t border-slate-850 p-4 flex gap-3 items-center">
                    {speechToTextSupported && (
                      <div className="flex items-center gap-0 shrink-0">
                        <button
                          type="button"
                          onClick={handleVoiceInputToggle}
                          className={`p-3.5 rounded-xl border border-r-0 rounded-r-none transition-all ${
                            isListening ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' : 'bg-slate-900 border-slate-805 text-slate-400 hover:text-slate-205'
                          }`}
                          title="Voice Dictation input"
                        >
                          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSpeechLanguage(speechLanguage === 'en-US' ? 'hi-IN' : 'en-US')}
                          className="px-2.5 py-3.5 bg-slate-900 border border-slate-805 text-[9px] font-extrabold text-indigo-400 rounded-xl rounded-l-none"
                          title="Toggle Speech Recognition Language (English / Hindi)"
                        >
                          {speechLanguage === 'en-US' ? 'EN' : 'हिन्दी'}
                        </button>
                      </div>
                    )}

                    <input type="text" placeholder={isListening ? "Listening... Speak clearly" : "Type response..."} value={inputVal} onChange={(e) => setInputVal(e.target.value)} className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-3.5 text-sm" />
                    
                    {!refereeMode && (
                      <button type="button" onClick={handleGetHints} className="p-3.5 bg-slate-900 border border-slate-800 text-indigo-400 rounded-xl flex items-center gap-1 text-xs font-bold shrink-0">
                        <Sparkles className="w-4 h-4" />
                        <span className="sm:inline hidden">Ask Copilot</span>
                      </button>
                    )}

                    <button type="submit" disabled={!inputVal.trim()} className="p-3.5 bg-indigo-600 text-white rounded-xl shadow-md shrink-0"><Send className="w-4 h-4" /></button>
                  </form>
                </div>

                {/* Right Panel: Live Coach Assist */}
                {coachAssistantEnabled && (
                  <div className="lg:col-span-3 flex flex-col gap-4">
                    <div className="bg-slate-900/70 border border-slate-850 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-350 border-b border-slate-850 pb-2">Live Coach Box</h4>
                      <p className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl text-xs text-slate-350 min-h-[90px] flex items-center">"{lastCoachingTip}"</p>
                    </div>

                    {showHintModal && (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 flex-1 shadow-xl">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <span className="text-xs font-bold text-indigo-400 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" />Suggestions</span>
                          <button onClick={() => setShowHintModal(false)} className="text-xs text-slate-500">Close</button>
                        </div>

                        {isGeneratingHints && <div className="text-center py-10 text-xs text-slate-550 animate-spin"><RefreshCw className="w-5 h-5 mx-auto" /></div>}
                        {copilotHints && !isGeneratingHints && (
                          <div className="flex flex-col gap-3 overflow-y-auto max-h-[350px]">
                            <button onClick={() => handleSelectHint(copilotHints.empathetic)} className="text-left p-3 rounded-xl bg-slate-955 border border-slate-850 text-xs hover:border-indigo-500">
                              <span className="text-[9px] font-bold text-emerald-450 uppercase">Empathetic</span>
                              <p className="italic text-slate-300 mt-1">"{copilotHints.empathetic}"</p>
                            </button>
                            <button onClick={() => handleSelectHint(copilotHints.assertive)} className="text-left p-3 rounded-xl bg-slate-955 border border-slate-850 text-xs hover:border-indigo-500">
                              <span className="text-[9px] font-bold text-indigo-400 uppercase">Assertive</span>
                              <p className="italic text-slate-300 mt-1">"{copilotHints.assertive}"</p>
                            </button>
                            <button onClick={() => handleSelectHint(copilotHints.collaborative)} className="text-left p-3 rounded-xl bg-slate-955 border border-slate-850 text-xs hover:border-indigo-500">
                              <span className="text-[9px] font-bold text-purple-400 uppercase">Collaborative</span>
                              <p className="italic text-slate-300 mt-1">"{copilotHints.collaborative}"</p>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* DASHBOARD SCORECARD */}
            {step === 'dashboard' && coachingResult && (
              <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-end border-b border-slate-900 pb-4">
                  <div>
                    <span className="text-xs uppercase font-semibold text-emerald-450">Step 3: Analytics Report</span>
                    <h2 className="text-3xl font-extrabold tracking-tight">Your Rehearsal Scorecard</h2>
                    <p className="text-slate-400 text-xs">Performance scorecard against {activeScenario?.title}.</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button onClick={handleExportLogs} className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-950/20 border border-indigo-900/30 px-4 py-2.5 rounded-xl transition-all font-bold">
                      <Download className="w-4 h-4" /> Export Flight Log
                    </button>
                    <button onClick={handleRestart} className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl transition-all font-bold">
                      Back to Setup
                    </button>
                  </div>
                </div>

                {/* Score and metrics breakdown grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
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

                    <span className="text-xs text-emerald-400 font-bold bg-emerald-950/30 border border-emerald-900/30 px-3 py-1 rounded-full block w-full">
                      {coachingResult.overallScore >= 80 ? 'Excellent Handling' : 'Practice Required'}
                    </span>
                  </div>

                  <div className="md:col-span-8 bg-slate-900 border border-slate-850 rounded-3xl p-6 flex flex-col gap-6 shadow-xl justify-center">
                    
                    {/* M1: Hidden objectives report check */}
                    {coachingResult.hiddenObjectivesAnalysis && coachingResult.hiddenObjectivesAnalysis.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block">Hidden Objectives analysis</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {coachingResult.hiddenObjectivesAnalysis.map((item, idx) => (
                            <div key={idx} className={`p-3 rounded-xl border text-[11px] flex flex-col gap-1 ${item.met ? 'bg-emerald-955/15 border-emerald-900/30 text-emerald-300' : 'bg-red-955/15 border-red-900/30 text-red-400'}`}>
                              <div className="flex items-center gap-1.5 font-bold">
                                {item.met ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                <span>{item.id}</span>
                              </div>
                              <p className="text-[10.5px] text-slate-350 leading-relaxed mt-0.5">{item.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* M10: Sports commentary turning points logs */}
                    {coachingResult.sportsCommentary && coachingResult.sportsCommentary.length > 0 && (
                      <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block">AI Replay Commentary (Pivotal turns)</span>
                        <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto pr-1">
                          {coachingResult.sportsCommentary.map((c, idx) => (
                            <div key={idx} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 text-[11px] leading-relaxed text-slate-300 flex items-start gap-2">
                              <span className="text-[9.5px] font-bold text-indigo-400 bg-indigo-950 px-1.5 rounded shrink-0">Turn {c.turnIndex}</span>
                              <p>{c.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* M2: Counterpart Mindset Replay Timeline Slider */}
                <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <History className="w-4.5 h-4.5 text-indigo-400" />
                    M2: Counterpart Mindset Replay (Inside Their Brain)
                  </h3>
                  <p className="text-xs text-slate-455">Scroll through conversation turns to inspect what the counterpart was thinking and their internal score status.</p>
                  
                  <div className="flex gap-4 items-center">
                    <label className="text-xs text-slate-400 font-bold shrink-0">Select Turn Index:</label>
                    <input 
                      type="range" 
                      min="0" 
                      max={messages.length - 1} 
                      value={selectedMindsetIndex === -1 ? 0 : selectedMindsetIndex} 
                      onChange={(e) => {
                        setSelectedMindsetIndex(Number(e.target.value));
                        setShowMindsetModal(true);
                      }} 
                      className="flex-1 accent-indigo-500" 
                    />
                    <span className="text-xs font-bold text-indigo-400 w-12 text-center bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      Turn {selectedMindsetIndex === -1 ? 0 : selectedMindsetIndex}
                    </span>
                  </div>

                  {showMindsetModal && (() => {
                    const msgIndex = selectedMindsetIndex === -1 ? 0 : selectedMindsetIndex;
                    const msgObj = messages[msgIndex];
                    if (!msgObj) return null;
                    return (
                      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 animate-in slide-in-from-bottom-2 duration-200">
                        <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-indigo-400" />
                            Mindset Snapshot - Turn {msgIndex} ({msgObj.role === 'user' ? 'You Spoke' : 'Persona Spoke'})
                          </h4>
                          <span className="text-[10px] text-slate-500 italic font-semibold">"{msgObj.text.substring(0, 40)}..."</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                            <span className="text-[9px] text-slate-550 font-bold uppercase block">Defensiveness</span>
                            <span className="text-base font-extrabold text-red-400">{msgObj.defensivenessScore ?? 50}%</span>
                          </div>
                          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                            <span className="text-[9px] text-slate-550 font-bold uppercase block">Trust Level</span>
                            <span className="text-base font-extrabold text-emerald-450">{msgObj.trustScore ?? 50}%</span>
                          </div>
                          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                            <span className="text-[9px] text-slate-550 font-bold uppercase block">Cooperation</span>
                            <span className="text-base font-extrabold text-indigo-400">{msgObj.cooperationScore ?? 50}%</span>
                          </div>
                          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                            <span className="text-[9px] text-slate-550 font-bold uppercase block">Authority Confidence</span>
                            <span className="text-base font-extrabold text-purple-400">{msgObj.confidenceScore ?? 50}%</span>
                          </div>
                        </div>

                        {msgObj.internalThought && (
                          <div className="bg-slate-900/60 p-3.5 border border-slate-850 rounded-xl text-xs leading-relaxed text-indigo-250 italic">
                            <strong>Internal Thought Reveal:</strong> "{msgObj.internalThought}"
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* M4: Interactive Emotional Heatmap Timeline */}
                <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Activity className="w-4.5 h-4.5 text-indigo-400" />
                    M4: Interactive Emotional Heatmap Timeline
                  </h3>
                  <p className="text-xs text-slate-455">Click any metric node spike on the interactive timeline to jump focus to that turn's mindset snapshot.</p>
                  
                  {/* SVG Heatmap chart */}
                  <div className="h-44 w-full bg-slate-950 rounded-2xl p-4 border border-slate-850 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-2 left-3 flex gap-4 text-[9px] font-bold text-slate-500">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full" /> Defensiveness</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full" /> Trust</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-indigo-500 rounded-full" /> Cooperation</span>
                    </div>

                    <svg className="w-full h-full" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />

                      {/* Render line nodes */}
                      {messages.map((m, idx) => {
                        if (idx === 0) return null;
                        const x = `${(idx / (messages.length - 1)) * 95}%`;
                        const yDef = `${100 - (m.defensivenessScore ?? 50)}%`;
                        const yTrust = `${100 - (m.trustScore ?? 50)}%`;

                        return (
                          <g key={idx}>
                            {/* Tension dot */}
                            <circle 
                              cx={x} cy={yDef} r="5" fill="#ef4444" className="cursor-pointer hover:r-8 transition-all"
                              onClick={() => {
                                setSelectedMindsetIndex(idx);
                                setShowMindsetModal(true);
                              }}
                            />
                            {/* Trust dot */}
                            <circle 
                              cx={x} cy={yTrust} r="5" fill="#10b981" className="cursor-pointer hover:r-8 transition-all"
                              onClick={() => {
                                setSelectedMindsetIndex(idx);
                                setShowMindsetModal(true);
                              }}
                            />
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* M5: Time Machine Optimal Path Reconstruction */}
                {coachingResult.optimalPath && coachingResult.optimalPath.length > 0 && (
                  <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
                      <GitCommit className="w-4.5 h-4.5 text-indigo-400" />
                      M5: Time Machine Path Reconstruction
                    </h3>
                    <p className="text-xs text-slate-455">Reconstruct the highest scoring response sequence and expect outcomes compared side-by-side.</p>
                    
                    <div className="flex flex-col gap-3">
                      {coachingResult.optimalPath.map((item, idx) => (
                        <div key={idx} className="bg-slate-950 border border-slate-850 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Your Response (Turn {item.userIndex})</span>
                            <p className="text-xs text-slate-350 italic mt-1 leading-normal">
                              "{messages[item.userIndex]?.text || 'Loading statement...'}"
                            </p>
                          </div>
                          
                          <div className="border-t md:border-t-0 md:border-l border-slate-850 pt-3 md:pt-0 md:pl-4 flex flex-col gap-1.5">
                            <span className="text-[10px] text-indigo-400 font-bold uppercase block flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" /> Optimal Phrasing Recommendation
                            </span>
                            <p className="text-xs text-emerald-400 leading-normal font-bold">
                              "{item.optimalResponse}"
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              <strong>Why:</strong> {item.reasoning}
                            </p>
                            <span className="text-[9.5px] text-indigo-300 block font-semibold">Expected Outcome: {item.expectedOutcome}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center mt-4">
                  <button onClick={handleRestart} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg transition-all flex items-center gap-2 text-sm">
                    <RefreshCw className="w-4 h-4" /> Restart Simulation Setup
                  </button>
                </div>
              </div>
            )}

          </div>
        )}


        {/* ================================== TAB 2: OBJECTION DRILLS ================================== */}
        {navTab === 'drills' && (
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-end border-b border-slate-900 pb-3">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">Deliberate Practice</span>
                <h2 className="text-3xl font-extrabold tracking-tight">M6: Objection Drill Trainer</h2>
                <p className="text-slate-455 text-sm">Target specific roadblocks (e.g. Budget limitations, Price resistance) repeatedly with infinite AI variations.</p>
              </div>

              {activeDrillTopic && (
                <button
                  onClick={() => {
                    setActiveDrillTopic('');
                    setDrillObjectionText('');
                    setDrillFeedback('');
                    setDrillScore(null);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg"
                >
                  Change Topic
                </button>
              )}
            </div>

            {!activeDrillTopic ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { topic: 'Budget Constraints', desc: 'Practice defusing "We simply do not have the budget for this raising" arguments.', category: 'Career' },
                  { topic: 'Pricing Objection', desc: 'De-escalate client pushbacks claiming competitor rates are 20% cheaper.', category: 'Sales' },
                  { topic: 'Trust Boundary Conflict', desc: 'Practice setting personal limits with guilt-tripping and defensive counterparties.', category: 'Relationships' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleStartObjectionDrill(item.topic)}
                    className="text-left p-5 bg-slate-900 border border-slate-850 rounded-2xl hover:border-indigo-500 hover:bg-slate-900 transition-all flex flex-col justify-between h-full gap-4"
                  >
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">{item.category}</span>
                      <h3 className="text-base font-bold text-slate-100 mt-1">{item.topic}</h3>
                      <p className="text-xs text-slate-450 leading-relaxed mt-2">{item.desc}</p>
                    </div>
                    <span className="text-xs text-indigo-400 font-bold flex items-center gap-1 pt-2">
                      Start Drills <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              /* Active drill loops */
              <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 flex flex-col gap-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-indigo-500 animate-pulse" />
                
                <div className="flex justify-between items-center bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-850">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Drill Topic: {activeDrillTopic}</span>
                  <span className="text-xs font-bold text-indigo-400">Drills Practiced: {drillHistoryCount}</span>
                </div>

                {isGeneratingDrill ? (
                  <div className="text-center py-10 flex flex-col gap-3 items-center">
                    <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                    <span className="text-xs text-slate-550">Processing next drill objection...</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col gap-1.5 relative">
                      <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 animate-bounce" /> Objection Pushback
                      </span>
                      <p className="text-sm font-bold text-white mt-1 leading-normal">
                        "{drillObjectionText || 'Awaiting objection text...'}"
                      </p>
                    </div>

                    {drillFeedback && (
                      <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-2xl flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-indigo-400 font-bold uppercase">Coach Evaluation</span>
                          {drillScore !== null && (
                            <span className="text-xs font-bold text-emerald-450 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900/30">
                              Score: {drillScore}/100
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">"{drillFeedback}"</p>
                      </div>
                    )}

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formVal = (e.currentTarget.elements.namedItem('drillInput') as HTMLInputElement).value;
                        handleSubmitDrillResponse(formVal);
                        e.currentTarget.reset();
                      }}
                      className="flex gap-3 items-center bg-slate-950 p-3 rounded-2xl border border-slate-850 mt-2"
                    >
                      <input 
                        name="drillInput" 
                        type="text" 
                        placeholder="Type/Speak de-escalation statement..." 
                        className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-4 py-3 text-xs" 
                      />
                      <button type="submit" className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow">
                        Submit response
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleStartObjectionDrill(activeDrillTopic)} 
                        className="p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl"
                        title="Generate alternate variation"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        )}


        {/* ================================== TAB 3: TIMELINE BRANCH COMPARATOR ================================== */}
        {navTab === 'branches' && (
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-300">
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
                      className="bg-slate-955 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:border-indigo-500 text-slate-100"
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
                      className="bg-slate-955 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:border-indigo-500 text-slate-100"
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
                      <div className="bg-slate-900/30 border border-slate-900 p-8 text-center text-xs text-slate-550 rounded-2xl">
                        Select two branches above to analyze the scorecard delta.
                      </div>
                    );
                  }

                  const scoreDelta = (bB.coachingResult?.overallScore || 0) - (bA.coachingResult?.overallScore || 0);

                  return (
                    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                      
                      {/* Score Comparison Delta banner */}
                      <div className="bg-indigo-955/20 border border-indigo-900/30 p-5 rounded-2xl flex items-center justify-between shadow">
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
                            <span className="text-lg font-extrabold text-indigo-400 bg-slate-955 px-3 py-1 rounded-xl border border-slate-800">
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


        {/* ================================== TAB 4: SESSION HISTORY & PROGRESSION ================================== */}
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
                
                {/* Score Trends Chart & Metrics */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                  <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 flex flex-col gap-3 text-center shadow">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Average Dashboard Score</span>
                    <span className="text-5xl font-extrabold text-emerald-455 my-2">{getAverageHistoryScore()}</span>
                    <p className="text-[10px] text-slate-500 leading-normal">Compiled across {historyList.length} coaching evaluations.</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 flex flex-col gap-3 shadow">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Score Progression Trend</span>
                    
                    <div className="h-36 w-full flex items-end justify-between gap-1 pt-4 border-b border-slate-800">
                      {historyList.slice(0, 10).reverse().map((run, idx) => (
                        <div key={run.id || idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                          <span className="absolute -top-4 text-[9px] font-bold text-indigo-400 bg-slate-955 px-1 rounded border border-slate-800 opacity-0 group-hover:opacity-100 transition-all">
                            {run.score}
                          </span>
                          <div className="w-full bg-indigo-500/80 group-hover:bg-indigo-500 rounded-t transition-all" style={{ height: `${run.score}%` }} />
                          <span className="text-[8px] text-slate-550 block mt-1.5 truncate w-full text-center">{run.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scorecard History logs overview */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <h3 className="text-base font-bold text-slate-200">Historical Runs</h3>
                  
                  <div className="flex flex-col gap-3">
                    {historyList.map((run) => (
                      <div key={run.id} className="bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-2xl p-5 flex items-start justify-between transition-all gap-4 shadow">
                        <div className="flex flex-col gap-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{run.scenarioTitle}</span>
                            <span className="text-[9px] text-slate-550 border border-slate-800 px-1.5 rounded flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" /> {run.date}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 italic">"{run.feedback}"</p>
                          
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


        {/* ================================== TAB 5: SKILL TREE PROGRESSION ================================== */}
        {navTab === 'skilltree' && (
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex flex-col gap-1.5 border-b border-slate-900 pb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">Leveling</span>
              <h2 className="text-3xl font-extrabold tracking-tight">M9: Skill Trees & Learning Paths</h2>
              <p className="text-slate-455 text-sm">Gamify your communication skills. Rehearse scenarios to earn experience points and unlock advanced tracks.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              {[
                { title: 'Salary Negotiation Track', category: 'Career', desc: 'Focuses on value articulation, de-escalating budget excuses, and timeline commitments.', level: 'Intermediate', locked: false, points: '88 XP' },
                { title: 'Difficult Boundary Track', category: 'Relationships', desc: 'Practice setting boundaries, managing guilt-trips, and handling emotional volatility.', level: 'Advanced', locked: false, points: '64 XP' },
                { title: 'Crisis Venture Pitch Track', category: 'Startup', desc: 'Practice defusing board objections, managing skeptical investors, and validating strategic pivots.', level: 'Expert', locked: true, points: 'Locked' },
              ].map((item, idx) => (
                <div key={idx} className={`p-6 border rounded-3xl flex flex-col justify-between h-full gap-4 relative overflow-hidden ${item.locked ? 'bg-slate-950/40 border-slate-900 text-slate-500' : 'bg-slate-900 border-slate-850 text-slate-100'}`}>
                  {item.locked && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2">
                      <Lock className="w-8 h-8 text-indigo-500" />
                      <span className="text-xs font-bold text-slate-455">Unlock requires 80+ Average Score</span>
                    </div>
                  )}
                  
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{item.category}</span>
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/20">{item.level}</span>
                    </div>
                    <h3 className="text-base font-bold mt-2">{item.title}</h3>
                    <p className="text-xs text-slate-450 leading-relaxed mt-1.5">{item.desc}</p>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-800 pt-3">
                    <span className="text-[10.5px] font-bold text-slate-550">Current Progress: {item.points}</span>
                    {!item.locked && <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">Practice Track <ChevronRight className="w-4 h-4" /></span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* ================================== TAB 6: SCENARIO MARKETPLACE ================================== */}
        {navTab === 'marketplace' && (
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex flex-col gap-1.5 border-b border-slate-900 pb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">Communityブルー</span>
              <h2 className="text-3xl font-extrabold tracking-tight">Scenario Marketplace</h2>
              <p className="text-slate-455 text-sm">Clone or remix custom blueprints published by professional coaches and organizational teams.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marketplaceScenarios.map((item) => (
                <div key={item.id} className="p-5 bg-slate-900 border border-slate-850 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500">{item.category}</span>
                    <h4 className="text-sm font-bold text-white mt-1">{item.title}</h4>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-450">
                      <span>By {item.author}</span>
                      <span>★ {item.rating}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleCloneScenario(item)}
                    disabled={item.cloned}
                    className={`px-3 py-2 rounded-lg text-xs font-bold shrink-0 transition-all ${
                      item.cloned 
                        ? 'bg-slate-950 text-slate-600 border border-slate-900' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow'
                    }`}
                  >
                    {item.cloned ? 'Cloned' : 'Clone Blueprint'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* ================================== TAB 7: CERTIFICATIONS MODE ================================== */}
        {navTab === 'certifications' && (
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex flex-col gap-1.5 border-b border-slate-900 pb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">Credentials</span>
              <h2 className="text-3xl font-extrabold tracking-tight">Certification Center</h2>
              <p className="text-slate-455 text-sm">Earn credentials by achieving &gt;85% overall score in high-stakes training tracks.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {certifications.map((cert) => (
                <div key={cert.id} className="p-5 bg-slate-900 border border-slate-850 rounded-2xl flex flex-col gap-4 text-center items-center shadow">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${cert.locked ? 'bg-slate-950 border-slate-800 text-slate-650' : 'bg-emerald-950 border-emerald-500 text-emerald-400'}`}>
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{cert.name}</h4>
                    <span className="text-[10px] text-slate-500 block mt-1">Tier: Fundamentals</span>
                  </div>
                  <div className="w-full bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-[10.5px]">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-500">Highest Score:</span>
                      <span className={cert.locked ? 'text-slate-400' : 'text-emerald-450'}>{cert.progress}/100</span>
                    </div>
                  </div>
                  <button disabled={cert.locked} className="w-full py-2 bg-slate-950 hover:bg-slate-850 disabled:opacity-40 border border-slate-800 text-[11px] font-bold rounded-lg transition-all text-slate-300">
                    {cert.locked ? 'Locked (Requires >85)' : 'Download Badge'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* ================================== TAB 8: ENTERPRISE TEAM PORTAL ================================== */}
        {navTab === 'enterprise' && (
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex flex-col gap-1.5 border-b border-slate-900 pb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">Corporate Management</span>
              <h2 className="text-3xl font-extrabold tracking-tight">Enterprise Analytics Dashboard</h2>
              <p className="text-slate-455 text-sm">Aggregated metadata only. Protects individual employee transcripts while tracking organizational training compliance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Total Exercises Run</span>
                <span className="text-3xl font-extrabold text-white block mt-1">1,248</span>
              </div>
              <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Average Empathy Score</span>
                <span className="text-3xl font-extrabold text-indigo-400 block mt-1">79%</span>
              </div>
              <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Average Assertiveness</span>
                <span className="text-3xl font-extrabold text-emerald-450 block mt-1">82%</span>
              </div>
              <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Certifications Issued</span>
                <span className="text-3xl font-extrabold text-purple-400 block mt-1">45</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">Organizational Skill Deficiencies</h3>
              <div className="flex flex-col gap-3">
                {[
                  { name: 'Overexplaining / Excessive apologetics', percent: 64, color: 'bg-red-500' },
                  { name: 'Hesitancy in budget negotiations', percent: 45, color: 'bg-amber-500' },
                  { name: 'Conflict avoidance when setting boundaries', percent: 35, color: 'bg-indigo-500' },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-350">{item.name}</span>
                      <span className="text-slate-455">{item.percent}% of cohorts</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


        {/* ================================== TAB 9: PRICING & MONETIZATION ================================== */}
        {navTab === 'pricing' && (
          <div className="max-w-5xl mx-auto w-full flex flex-col gap-8 animate-in fade-in duration-300">
            <div className="flex flex-col gap-1.5 border-b border-slate-900 pb-3 text-center">
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">Subscription Tiers</span>
              <h2 className="text-3xl font-extrabold tracking-tight">Flexible Monetization Plans</h2>
              <p className="text-slate-455 text-sm max-w-xl mx-auto">Choose a plan to upgrade your flight simulator capabilities. Perfect for individual practitioners, professional coaches, or corporate teams.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch mt-4">
              {/* Plan 1: Free */}
              <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 flex flex-col justify-between h-full relative overflow-hidden shadow-xl">
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Individual Sandbox</span>
                    <h3 className="text-xl font-bold text-slate-100 mt-1">Pilot Free</h3>
                    <p className="text-xs text-slate-455 mt-1">Practice baseline scenarios with standard roleplay mechanics.</p>
                  </div>
                  <div className="my-2">
                    <span className="text-4xl font-extrabold text-white">$0</span>
                    <span className="text-xs text-slate-550 font-semibold"> / month</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-350 border-t border-slate-850 pt-4 mt-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-450 shrink-0" />
                      <span>3 Default Scenario Presets</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-450 shrink-0" />
                      <span>1-on-1 AI Counterparts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-450 shrink-0" />
                      <span>Standard Text-Based Chat</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <span>🚫 Custom OCEAN Sliders</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <span>🚫 Voice-Pace Coaching (WPM)</span>
                    </li>
                  </ul>
                </div>
                <button className="w-full mt-8 py-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-350 font-bold text-xs rounded-xl transition-all">
                  Current Plan
                </button>
              </div>

              {/* Plan 2: Pro */}
              <div className="bg-slate-900 border-2 border-indigo-500 rounded-3xl p-6 flex flex-col justify-between h-full relative overflow-hidden shadow-2xl">
                <div className="absolute top-3 right-3 bg-indigo-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Popular
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block flex items-center gap-1">
                      <Sparkles className="w-3 h-3 animate-pulse" /> Rehearsal Cockpit
                    </span>
                    <h3 className="text-xl font-bold text-slate-100 mt-1">Professional Pilot</h3>
                    <p className="text-xs text-slate-455 mt-1">Unlock custom parameters, timelines, and voice analytics.</p>
                  </div>
                  <div className="my-2">
                    <span className="text-4xl font-extrabold text-white">$19</span>
                    <span className="text-xs text-slate-550 font-semibold"> / seat / mo</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-350 border-t border-slate-850 pt-4 mt-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-450 shrink-0" />
                      <span>Unlimited Custom OCEAN Scenarios</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-450 shrink-0" />
                      <span>Multi-Party Counterpart Routing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-450 shrink-0" />
                      <span>Speech-to-Text & WPM Coaching</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-450 shrink-0" />
                      <span>Rewind Branch Comparison view</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-450 shrink-0" />
                      <span>Objection Drill Practice Loops</span>
                    </li>
                  </ul>
                </div>
                <button className="w-full mt-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition-all">
                  Upgrade to Pro
                </button>
              </div>

              {/* Plan 3: Enterprise */}
              <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 flex flex-col justify-between h-full relative overflow-hidden shadow-xl">
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> Team Rehearsal
                    </span>
                    <h3 className="text-xl font-bold text-slate-100 mt-1">Enterprise Fleet</h3>
                    <p className="text-xs text-slate-455 mt-1">Deploy organizational coaching templates and track metrics.</p>
                  </div>
                  <div className="my-2">
                    <span className="text-4xl font-extrabold text-white">$79</span>
                    <span className="text-xs text-slate-550 font-semibold"> / month (10 seats)</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-350 border-t border-slate-850 pt-4 mt-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-450 shrink-0" />
                      <span>Coaching Referee Mode</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-450 shrink-0" />
                      <span>Issued Downloadable Credentials</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-450 shrink-0" />
                      <span>Aggregate Organization Dashboard</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-450 shrink-0" />
                      <span>Internal Template Marketplace</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-450 shrink-0" />
                      <span>API pay-per-use token integrations</span>
                    </li>
                  </ul>
                </div>
                <button className="w-full mt-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/20 transition-all">
                  Contact Sales
                </button>
              </div>
            </div>

            {/* Monetization Model Description */}
            <div className="bg-slate-900/60 border border-slate-850 rounded-3xl p-6 shadow-xl flex flex-col gap-4 mt-2">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
                <Shield className="w-4.5 h-4.5 text-indigo-400" />
                EchoPersona Monetization Engine
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-slate-350">
                <div className="flex flex-col gap-2">
                  <h4 className="font-bold text-white text-xs">How We Make Money Off This App:</h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li><strong className="text-white">Seat License Subscription:</strong> Charging companies on a per-employee monthly fee to train their HR and sales reps.</li>
                    <li><strong className="text-white">Professional Coach Marketplace:</strong> Allowing professional communication coaches to list custom scenario templates and charging a 20% platform transaction fee on clone purchases.</li>
                    <li><strong className="text-white">Certification Licensing:</strong> Issuing formal cryptographically-verified blockchain certifications for high scores, charged at $5 per issue.</li>
                  </ul>
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="font-bold text-white text-xs">Pay-As-You-Go API Monetization:</h4>
                  <p>
                    For integration into Learning Management Systems (LMS) or HR platforms, developers hook directly to our <strong>/api/simulate</strong> and <strong>/api/coach</strong> endpoints:
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li><strong className="text-white">Turn Tokens:</strong> Charging $0.05 per conversation turn.</li>
                    <li><strong className="text-white">Coach Token:</strong> Charging $1.00 per full final Coach aggregate assessment report.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-550 mt-auto">
        <p>© 2026 EchoPersona. deliberate practice sandbox. practice safely, execute confidently.</p>
      </footer>
    </div>
  );
}
