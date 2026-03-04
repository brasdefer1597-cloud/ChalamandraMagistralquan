
export type EvolutionLevel = '3' | '6' | '9';

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface CholaResult {
  coreInsight: string;
  strategicView: string;
  costOfInaction: string;
  groundingChunks?: GroundingChunk[];
}

export interface MalandraResult {
  fatalFlaw: string;
  deconstruction: string;
  overlookedRisk: string;
  hardQuestion: string;
}

export interface FresaContent {
  title: string;
  details: string[];
  justification?: string; // Why this synthesis was chosen based on feedback
}

export interface FresaResult {
  level: EvolutionLevel;
  content: FresaContent;
  feedbackHistory?: string[]; // To track what the user liked/disliked
}

export interface AnalysisResult {
  thesis: CholaResult;
  antithesis: MalandraResult;
  synthesis: FresaResult;
}
