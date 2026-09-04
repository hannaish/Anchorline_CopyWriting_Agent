export type NavigationTab = 
  | "dashboard" 
  | "create" 
  | "hooks" 
  | "ideas" 
  | "rewrite" 
  | "repurpose" 
  | "knowledge" 
  | "voice" 
  | "history" 
  | "tests" 
  | "settings";

export interface GenerationRequest {
  topic: string;
  niche: string;
  audience: string;
  offer: string;
  goal: string;
  platform: string;
  tone: string;
  emotion: string;
  keyMessage: string;
  personalStory: string;
  cta: string;
  format: string;
}

export interface DimensionScores {
  hook: number;
  clarity: number;
  curiosity: number;
  specificity: number;
  emotion: number;
  originality: number;
  value: number;
  flow: number;
  readability: number;
  cta: number;
  audienceFit: number;
  total: number;
}

export interface ContentVersion {
  id: string;
  versionNumber: number;
  versionType: string;
  hook: string;
  angle: string;
  content: string;
  scores: DimensionScores;
}

export interface ContentCritique {
  overallSummary: string;
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
}

export interface GeneratedResult {
  generationId: string;
  request: GenerationRequest;
  versions: ContentVersion[];
  critique: ContentCritique;
}

export interface HookScores {
  curiosity: number;
  clarity: number;
  specificity: number;
  emotionalImpact: number;
  audienceRelevance: number;
  patternInterruption: number;
  scrollStoppingPotential: number;
  total: number;
}

export interface HookItem {
  id: string;
  category: string;
  text: string;
  scores: HookScores;
  isTop3?: boolean;
}

export interface SeedHook {
  id: string;
  category: string;
  template: string;
  example?: string;
  source_url?: string;
}

export interface ContentIdea {
  id: string;
  number: number;
  topic: string;
  angle: string;
  hook: string;
  emotionalTrigger: string;
  format: string;
  whyItCouldWork: string;
  cta: string;
}

export interface VoiceProfile {
  id: string;
  name: string;
  description: string;
  metrics: {
    sentenceLength?: string;
    vocabulary?: string;
    rhythm?: string;
    tone?: string;
    emotionalIntensity?: string;
    storytellingStyle?: string;
    useOfQuestions?: string;
    useOfMetaphors?: string;
    ctaStyle?: string;
    formatting?: string;
    personalityArchetype?: string;
  };
  is_active: number;
}

export interface TestCase {
  id: string;
  name: string;
  category: string;
  platform: string;
  topic: string;
  audience: string;
  goal: string;
  expectedCharacteristics: string;
}

export interface TestResult {
  runId: string;
  testCase: TestCase;
  status: "PASSED" | "FAILED";
  score: number;
  latencyMs: number;
  model: string;
  promptVersion: string;
  generatedContent: string;
  critiqueScores: DimensionScores;
}
