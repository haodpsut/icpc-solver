
export enum InputMode {
  TEXT = 'TEXT',
  PDF = 'PDF',
}

export interface AnalysisResult {
  analysis: string;
  solution: string;
}

export enum AiProvider {
  GEMINI = 'GEMINI',
  OPENROUTER = 'OPENROUTER',
}
